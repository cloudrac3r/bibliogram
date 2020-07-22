const constants = require("./constants")
const {request} = require("./utils/request")
const switcher = require("./utils/torswitcher")
const {extractSharedData} = require("./utils/body")
const {TtlCache, RequestCache, UserRequestCache} = require("./cache")
const RequestHistory = require("./structures/RequestHistory")
const db = require("./db")
require("./testimports")(constants, request, extractSharedData, UserRequestCache, RequestHistory, db)

const requestCache = new RequestCache(constants.caching.resource_cache_time)
/** @type {import("./cache").UserRequestCache<import("./structures/User")|import("./structures/ReelUser")>} */
const userRequestCache = new UserRequestCache(constants.caching.resource_cache_time)
/** @type {import("./cache").TtlCache<import("./structures/TimelineEntry")>} */
const timelineEntryCache = new TtlCache(constants.caching.resource_cache_time)
const history = new RequestHistory(["user", "timeline", "igtv", "post", "reel"])

const AssistantSwitcher = require("./structures/AssistantSwitcher")
const assistantSwitcher = new AssistantSwitcher()

/**
 * @param {string} username
 * @param {symbol} [context]
 */
async function fetchUser(username, context) {
	if (constants.external.reserved_paths.includes(username)) {
		throw constants.symbols.ENDPOINT_OVERRIDDEN
	}

	let mode = constants.allow_user_from_reel
	if (mode === "preferForRSS") {
		if (context === constants.symbols.fetch_context.RSS) mode = "prefer"
		else mode = "onlyPreferSaved"
	}
	if (context === constants.symbols.fetch_context.ASSISTANT) {
		const saved = db.prepare("SELECT username, user_id, updated_version, biography, post_count, following_count, followed_by_count, external_url, full_name, is_private, is_verified, profile_pic_url FROM Users WHERE username = ?").get(username)
		if (saved && saved.updated_version >= 2) {
			return fetchUserFromSaved(saved)
		} else {
			return fetchUserFromHTML(username)
		}
	}
	if (mode === "never") {
		return fetchUserFromHTML(username)
	}
	if (mode === "prefer") {
		const saved = db.prepare("SELECT username, user_id, updated_version, biography, post_count, following_count, followed_by_count, external_url, full_name, is_private, is_verified, profile_pic_url FROM Users WHERE username = ?").get(username)
		if (saved && saved.updated_version >= 2) {
			return fetchUserFromSaved(saved)
		} else if (saved && saved.updated_version === 1) {
			return fetchUserFromCombined(saved.user_id, saved.username)
		} else {
			return fetchUserFromHTML(username)
		}
	}
	if (mode === "onlyPreferSaved") {
		const saved = db.prepare("SELECT username, user_id, updated_version, biography, post_count, following_count, followed_by_count, external_url, full_name, is_private, is_verified, profile_pic_url FROM Users WHERE username = ?").get(username)
		if (saved && saved.updated_version >= 2) {
			return fetchUserFromSaved(saved)
		} else {
			mode = "fallback"
		}
	}
	if (mode === "fallback") {
		return fetchUserFromHTML(username).catch(error => {
			if (error === constants.symbols.INSTAGRAM_DEMANDS_LOGIN || error === constants.symbols.RATE_LIMITED) {
				const saved = db.prepare("SELECT username, user_id, updated_version, biography, post_count, following_count, followed_by_count, external_url, full_name, is_private, is_verified, profile_pic_url FROM Users WHERE username = ?").get(username)
				if (saved && saved.updated_version === 1) {
					return fetchUserFromCombined(saved.user_id, username)
				} else if (saved && saved.updated_version >= 2) {
					return fetchUserFromSaved(saved)
				} else if (assistantSwitcher.enabled()) {
					return assistantSwitcher.requestUser(username).catch(error => {
						if (error === constants.symbols.NO_ASSISTANTS_AVAILABLE) throw constants.symbols.RATE_LIMITED
						else throw error
					})
				}
			}
			throw error
		})
	}
	throw new Error(`Selected fetch mode ${mode} was unmatched.`)
}

/**
 * @param {string} username
 * @returns {Promise<{user: import("./structures/User"), quotaUsed: number}>}
 */
function fetchUserFromHTML(username) {
	if (constants.caching.self_blocked_status.enabled) {
		if (history.store.has("user")) {
			const entry = history.store.get("user")
			if (!entry.lastRequestSuccessful && Date.now() < entry.lastRequestAt + constants.caching.self_blocked_status.time) {
				return Promise.reject(constants.symbols.RATE_LIMITED)
			}
		}
	}
	return userRequestCache.getOrFetch("user/"+username, false, true, () => {
		return switcher.request("user_html", `https://www.instagram.com/${username}/feed/`, async res => {
			if (res.status === 301) throw constants.symbols.ENDPOINT_OVERRIDDEN
			if (res.status === 302) throw constants.symbols.INSTAGRAM_DEMANDS_LOGIN
			if (res.status === 429) throw constants.symbols.RATE_LIMITED
			return res
		}).then(async g => {
			const res = await g.response()
			if (res.status === 404) {
				throw constants.symbols.NOT_FOUND
			} else {
				const text = await g.text()
				// require down here or have to deal with require loop. require cache will take care of it anyway.
				// User -> Timeline -> TimelineEntry -> collectors -/> User
				const User = require("./structures/User")
				const result = extractSharedData(text)
				if (result.status === constants.symbols.extractor_results.SUCCESS) {
					const sharedData = result.value
					const user = new User(sharedData.entry_data.ProfilePage[0].graphql.user)
					history.report("user", true)
					if (constants.caching.db_user_id) {
						const existing = db.prepare("SELECT created, updated_version FROM Users WHERE username = ?").get(user.data.username)
						db.prepare(
							"REPLACE INTO Users (username,  user_id,  created,  updated,  updated_version,  biography,  post_count,  following_count,  followed_by_count,  external_url,  full_name,  is_private,  is_verified,  profile_pic_url) VALUES "
							                 +"(@username, @user_id, @created, @updated, @updated_version, @biography, @post_count, @following_count, @followed_by_count, @external_url, @full_name, @is_private, @is_verified, @profile_pic_url)"
						).run({
							username: user.data.username,
							user_id: user.data.id,
							created: existing && existing.updated_version === constants.database_version ? existing.created : Date.now(),
							updated: Date.now(),
							updated_version: constants.database_version,
							biography: user.data.biography || null,
							post_count: user.posts || 0,
							following_count: user.following || 0,
							followed_by_count: user.followedBy || 0,
							external_url: user.data.external_url || null,
							full_name: user.data.full_name || null,
							is_private: +user.data.is_private,
							is_verified: +user.data.is_verified,
							profile_pic_url: user.data.profile_pic_url
						})
					}
					return user
				} else if (result.status === constants.symbols.extractor_results.AGE_RESTRICTED) {
					// I don't like this code.
					history.report("user", true)
					throw constants.symbols.extractor_results.AGE_RESTRICTED
				} else {
					throw result.status
				}
			}
		}).catch(error => {
			if (error === constants.symbols.INSTAGRAM_DEMANDS_LOGIN || error === constants.symbols.RATE_LIMITED) {
				history.report("user", false)
			}
			throw error
		})
	}).then(user => ({user, quotaUsed: 0}))
}

/**
 * @param {string} userID
 */
function updateProfilePictureFromReel(userID) {
	const p = new URLSearchParams()
	p.set("query_hash", constants.external.reel_query_hash)
	p.set("variables", JSON.stringify({
		user_id: userID,
		include_reel: true
	}))
	return switcher.request("reel_graphql", `https://www.instagram.com/graphql/query/?${p.toString()}`, async res => {
		if (res.status === 429) throw constants.symbols.RATE_LIMITED
		return res
	}).then(res => res.json()).then(root => {
		const result = root.data.user
		if (!result) throw constants.symbols.NOT_FOUND
		const profilePicURL = result.reel.user.profile_pic_url
		if (!profilePicURL) throw constants.symbols.NOT_FOUND
		db.prepare("UPDATE Users SET profile_pic_url = ? WHERE user_id = ?").run(profilePicURL, userID)
		for (const entry of userRequestCache.cache.values()) {
			// yes, data.data is correct.
			if (entry.data && entry.data.data && entry.data.data.id === userID) {
				entry.data.data.profile_pic_url = profilePicURL
				entry.data.computeProxyProfilePic()
				break // stop checking entries from the cache since we won't find any more
			}
		}
		return profilePicURL
	}).catch(error => {
		throw error
	})
}

/**
 * @param {string} userID
 * @param {string} username
 * @returns {Promise<{user: import("./structures/ReelUser")|import("./structures/User"), quotaUsed: number}>}
 */
function fetchUserFromCombined(userID, username) {
	// Fetch basic user information
	const p = new URLSearchParams()
	p.set("query_hash", constants.external.reel_query_hash)
	p.set("variables", JSON.stringify({
		user_id: userID,
		include_reel: true
	}))
	return userRequestCache.getOrFetch("user/"+username, true, false, () => {
		return switcher.request("reel_graphql", `https://www.instagram.com/graphql/query/?${p.toString()}`, async res => {
			if (res.status === 429) throw constants.symbols.RATE_LIMITED
			return res
		}).then(res => res.json()).then(root => {
			const result = root.data.user
			if (!result) {
				// user ID doesn't exist.
				db.prepare("DELETE FROM Users WHERE user_id = ?").run(userID) // deleting the entry makes sense to me; the username might be claimed by somebody else later
				throw constants.symbols.NOT_FOUND // this should cascade down and show the user not found page
			}
			// require down here or have to deal with require loop. require cache will take care of it anyway.
			// ReelUser -> Timeline -> TimelineEntry -> collectors -/> User
			const ReelUser = require("./structures/ReelUser")
			const user = new ReelUser(result.reel.user)
			history.report("reel", true)
			return user
		})
	}).then(async user => {
		// Add first timeline page
		let quotaUsed = 0
		if (!user.timeline.pages[0]) {
			const fetched = await fetchTimelinePage(userID, "")
			if (!fetched.fromCache) quotaUsed++
			user.timeline.addPage(fetched.result)
		}
		return {user, quotaUsed}
	}).catch(error => {
		if (error === constants.symbols.RATE_LIMITED) {
			history.report("reel", false)
		}
		throw error
	})
}

function fetchUserFromSaved(saved) {
	let quotaUsed = 0
	return userRequestCache.getOrFetch("user/"+saved.username, false, true, async () => {
		// require down here or have to deal with require loop. require cache will take care of it anyway.
		// ReelUser -> Timeline -> TimelineEntry -> collectors -/> ReelUser
		const ReelUser = require("./structures/ReelUser")
		const user = new ReelUser({
			username: saved.username,
			id: saved.user_id,
			biography: saved.biography,
			edge_follow: {count: saved.following_count},
			edge_followed_by: {count: saved.followed_by_count},
			external_url: saved.external_url,
			full_name: saved.full_name,
			is_private: !!saved.is_private,
			is_verified: !!saved.is_verified,
			profile_pic_url: saved.profile_pic_url
		})
		// Add first timeline page
		if (!user.timeline.pages[0]) {
			const {result: page, fromCache} = await fetchTimelinePage(user.data.id, "")
			if (!fromCache) quotaUsed++
			user.timeline.addPage(page)
		}
		return user
	}).then(user => {
		return {user, quotaUsed}
	})
}

/**
 * @param {string} userID
 * @param {string} after
 * @returns {Promise<{result: import("./types").PagedEdges<import("./types").TimelineEntryN2>, fromCache: boolean}>}
 */
function fetchTimelinePage(userID, after) {
	const p = new URLSearchParams()
	p.set("query_hash", constants.external.timeline_query_hash)
	p.set("variables", JSON.stringify({
		id: userID,
		first: constants.external.timeline_fetch_first,
		after: after
	}))
	return requestCache.getOrFetchPromise(`page/${userID}/${after}`, () => {
		return switcher.request("timeline_graphql", `https://www.instagram.com/graphql/query/?${p.toString()}`, async res => {
			if (res.status === 429) throw constants.symbols.RATE_LIMITED
		}).then(g => g.json()).then(root => {
			if (root.data.user === null) {
				// user ID doesn't exist.
				db.prepare("DELETE FROM Users WHERE user_id = ?").run(userID) // deleting the entry makes sense to me; the username might be claimed by somebody else later
				requestCache
				throw constants.symbols.NOT_FOUND // this should cascade down and show the user not found page
			}
			/** @type {import("./types").PagedEdges<import("./types").TimelineEntryN2>} */
			const timeline = root.data.user.edge_owner_to_timeline_media
			history.report("timeline", true)
			return timeline
		}).catch(error => {
			if (error === constants.symbols.RATE_LIMITED) {
				history.report("timeline", false)
			}
			throw error
		})
	})
}

/**
 * @param {string} userID
 * @param {string} after
 * @returns {Promise<{result: import("./types").PagedEdges<import("./types").TimelineEntryN2>, fromCache: boolean}>}
 */
function fetchIGTVPage(userID, after) {
	const p = new URLSearchParams()
	p.set("query_hash", constants.external.igtv_query_hash)
	p.set("variables", JSON.stringify({
		id: userID,
		first: constants.external.igtv_fetch_first,
		after: after
	}))
	return requestCache.getOrFetchPromise(`igtv/${userID}/${after}`, () => {
		// assuming this uses the same bucket as timeline, which may not be the case
		return switcher.request("timeline_graphql", `https://www.instagram.com/graphql/query/?${p.toString()}`, async res => {
			if (res.status === 429) throw constants.symbols.RATE_LIMITED
		}).then(g => g.json()).then(root => {
			/** @type {import("./types").PagedEdges<import("./types").TimelineEntryN2>} */
			const timeline = root.data.user.edge_felix_video_timeline
			history.report("igtv", true)
			return timeline
		}).catch(error => {
			if (error === constants.symbols.RATE_LIMITED) {
				history.report("igtv", false)
			}
			throw error
		})
	})
}

/**
 * @param {string} userID
 * @param {string} username
 * @returns {Promise<{result: boolean, fromCache: boolean}>}
 */
function verifyUserPair(userID, username) {
	// Fetch basic user information
	const p = new URLSearchParams()
	p.set("query_hash", constants.external.reel_query_hash)
	p.set("variables", JSON.stringify({
		user_id: userID,
		include_reel: true
	}))
	return requestCache.getOrFetchPromise("userID/"+userID, () => {
		return switcher.request("reel_graphql", `https://www.instagram.com/graphql/query/?${p.toString()}`, async res => {
			if (res.status === 429) throw constants.symbols.RATE_LIMITED
			return res
		}).then(res => res.json()).then(root => {
			let user = root.data.user
			if (!user) throw constants.symbols.NOT_FOUND
			user = user.reel.user
			history.report("reel", true)
			return user.id === userID && user.username === username
		}).catch(error => {
			throw error
		})
	})
}

/**
 * @param {string} shortcode
 * @returns {import("./structures/TimelineEntry")}
 */
function getOrCreateShortcode(shortcode) {
	if (timelineEntryCache.has(shortcode)) {
		return timelineEntryCache.get(shortcode)
	} else {
		// require down here or have to deal with require loop. require cache will take care of it anyway.
		// TimelineEntry -> collectors -/> TimelineEntry
		const TimelineEntry = require("./structures/TimelineEntry")
		const result = new TimelineEntry()
		timelineEntryCache.set(shortcode, result)
		return result
	}
}

async function getOrFetchShortcode(shortcode) {
	if (timelineEntryCache.has(shortcode)) {
		return timelineEntryCache.get(shortcode)
	} else {
		const data = await fetchShortcodeData(shortcode)
		const entry = getOrCreateShortcode(shortcode)
		entry.applyN3(data.result)
		return entry
	}
}

/**
 * @param {string} shortcode
 * @returns {Promise<{result: import("./types").TimelineEntryN3, fromCache: boolean}>}
 */
function fetchShortcodeData(shortcode) {
	// example actual query from web:
	// query_hash=2b0673e0dc4580674a88d426fe00ea90&variables={"shortcode":"xxxxxxxxxxx","child_comment_count":3,"fetch_comment_count":40,"parent_comment_count":24,"has_threaded_comments":true}
	// we will not include params about comments, which means we will not receive comments, but everything else should still work fine
	const p = new URLSearchParams()
	p.set("query_hash", constants.external.shortcode_query_hash)
	p.set("variables", JSON.stringify({shortcode}))
	return requestCache.getOrFetchPromise("shortcode/"+shortcode, () => {
		return switcher.request("post_graphql", `https://www.instagram.com/graphql/query/?${p.toString()}`, async res => {
			if (res.status === 429) throw constants.symbols.RATE_LIMITED
		}).then(res => res.json()).then(root => {
			/** @type {import("./types").TimelineEntryN3} */
			const data = root.data.shortcode_media
			if (data == null) {
				// the thing doesn't exist
				throw constants.symbols.NOT_FOUND
			} else {
				history.report("post", true)
				if (constants.caching.db_post_n3) {
					db.prepare("REPLACE INTO Posts (shortcode, id, id_as_numeric, username, json) VALUES (@shortcode, @id, @id_as_numeric, @username, @json)")
						.run({shortcode: data.shortcode, id: data.id, id_as_numeric: data.id, username: data.owner.username, json: JSON.stringify(data)})
				}
				// if we have the owner but only a reelUser, update it. this code is gross.
				if (userRequestCache.hasNotPromise("user/"+data.owner.username)) {
					const user = userRequestCache.getWithoutClean("user/"+data.owner.username)
					if (user.fromReel) {
						user.data.full_name = data.owner.full_name
						user.data.is_verified = data.owner.is_verified
					}
				}
				return data
			}
		}).catch(error => {
			if (error === constants.symbols.RATE_LIMITED) {
				history.report("post", false)
			}
			throw error
		})
	})
}

module.exports.fetchUser = fetchUser
module.exports.fetchTimelinePage = fetchTimelinePage
module.exports.fetchIGTVPage = fetchIGTVPage
module.exports.getOrCreateShortcode = getOrCreateShortcode
module.exports.fetchShortcodeData = fetchShortcodeData
module.exports.requestCache = requestCache
module.exports.userRequestCache = userRequestCache
module.exports.timelineEntryCache = timelineEntryCache
module.exports.getOrFetchShortcode = getOrFetchShortcode
module.exports.updateProfilePictureFromReel = updateProfilePictureFromReel
module.exports.history = history
module.exports.fetchUserFromSaved = fetchUserFromSaved
module.exports.assistantSwitcher = assistantSwitcher
module.exports.verifyUserPair = verifyUserPair
