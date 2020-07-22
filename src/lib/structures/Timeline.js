const {Feed} = require("feed")
const constants = require("../constants")
const db = require("../db")
const TimelineEntry = require("./TimelineEntry")
const InstaCache = require("../cache")
const collectors = require("../collectors")
const {getFeedSetup} = require("../utils/feed")
require("../testimports")(constants, collectors, TimelineEntry, InstaCache)

/** @param {any[]} edges */
function transformEdges(edges) {
	return edges.map(e => {
		/** @type {import("../types").TimelineEntryAll} */
		const data = e.node
		const entry = collectors.getOrCreateShortcode(data.shortcode)
		entry.apply(data)
		return entry
	})
}

class Timeline {
	/**
	 * @param {import("./User")|import("./ReelUser")} user
	 * @param {string} type
	 */
	constructor(user, type) {
		this.user = user
		/** one of: "timeline", "igtv" */
		this.type = type
		/** @type {import("./TimelineEntry")[][]} */
		this.pages = []
		if (this.user.data.edge_owner_to_timeline_media) {
			this.addPage(this.user.data.edge_owner_to_timeline_media)
		}
	}

	hasNextPage() {
		return !this.page_info || this.page_info.has_next_page
	}

	fetchNextPage() {
		if (!this.hasNextPage()) return constants.symbols.NO_MORE_PAGES
		const method =
			this.type === "timeline" ? collectors.fetchTimelinePage
			: this.type === "igtv" ? collectors.fetchIGTVPage
			: null
		const after = this.page_info ? this.page_info.end_cursor : ""
		return method(this.user.data.id, after).then(({result: page, fromCache}) => {
			const quotaUsed = fromCache ? 0 : 1
			this.addPage(page)
			return {page: this.pages.slice(-1)[0], quotaUsed}
		})
	}

	async fetchUpToPage(index) {
		let quotaUsed = 0
		while (this.pages[index] === undefined && this.hasNextPage()) {
			const result = await this.fetchNextPage()
			if (typeof result !== "symbol") {
				quotaUsed += result.quotaUsed
			}
		}
		return quotaUsed
	}

	addPage(page) {
		// update whether the user should be private
		if (this.pages.length === 0 && page.count > 0) { // this is the first page, and user has posted
			const shouldBePrivate = page.edges.length === 0
			if (shouldBePrivate !== this.user.data.is_private) {
				db.prepare("UPDATE Users SET is_private = ? WHERE user_id = ?").run(+shouldBePrivate, this.user.data.id)
				this.user.data.is_private = shouldBePrivate
			}
		}
		// add the page
		this.pages.push(transformEdges(page.edges))
		this.page_info = page.page_info
		this.user.posts = page.count
	}

	async fetchFeed() {
		const setup = getFeedSetup(this.user.data.username, this.user.data.biography, constants.website_origin+this.user.proxyProfilePicture, new Date(this.user.cachedAt))
		const feed = new Feed(setup)
		const page = this.pages[0] // only get posts from first page
		await Promise.all(page.map(item =>
			item.fetchFeedData().then(feedData => feed.addItem(feedData))
		))
		return feed
	}
}

module.exports = Timeline
