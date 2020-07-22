const constants = require("../../lib/constants")
const {Feed} = require("feed")
const {getFeedSetup} = require("../../lib/utils/feed")
const {fetchUser, userRequestCache} = require("../../lib/collectors")
const {render, getStaticURL} = require("pinski/plugins")
const {pugCache} = require("../passthrough")
const {compile} = require("pug")

const rssAnnouncementTemplate = compile(`
p(style="white-space: pre-line") #{message}#[a(href=link)= link]
`)

function respondWithFeed(feed, kind, maxAge, available) {
	if (kind === "rss") {
		var data = {
			contentType: "application/rss+xml", // see https://stackoverflow.com/questions/595616/what-is-the-correct-mime-type-to-use-for-an-rss-feed,
			content: feed.rss2()
		}
	} else if (kind === "atom") {
		var data = {
			contentType: "application/atom+xml", // see https://en.wikipedia.org/wiki/Atom_(standard)#Including_in_HTML
			content: feed.atom1()
		}
	}
	const headers = {
		"Cache-Control": `public, max-age=${maxAge}`
	}
	if (!available) headers["X-Bibliogram-Feed-Unavailable"] = 1
	return {
		statusCode: 200, // must return 200 even if announcement only, since readers might not display anything with a failed status code
		contentType: data.contentType,
		headers,
		content: data.content
	}
}

/**
 * @param {Feed} feed
 */
function addAnnouncementFeedItem(feed) {
	feed.addItem({
		title: constants.feeds.feed_message.title,
		description: rssAnnouncementTemplate({
			message: constants.feeds.feed_message.message,
			link: constants.feeds.feed_message.link
		}),
		link: constants.feeds.feed_message.link,
		id: constants.feeds.feed_message.id,
		published: new Date(constants.feeds.feed_message.timestamp),
		date: new Date(constants.feeds.feed_message.timestamp)
	})
}


module.exports = [
	{
		route: `/u/(${constants.external.username_regex})/(rss|atom)\\.xml`, methods: ["GET"], code: ({fill}) => {
			const kind = fill[1]
			if (constants.feeds.enabled) {
				return fetchUser(fill[0], constants.symbols.fetch_context.RSS).then(async ({user}) => {
					const feed = await user.timeline.fetchFeed()
					if (constants.feeds.feed_message.enabled) {
						addAnnouncementFeedItem(feed)
					}
					return respondWithFeed(feed, kind, userRequestCache.getTtl("user/"+user.data.username, 1000), true)
				}).catch(error => {
					if (error === constants.symbols.NOT_FOUND || error === constants.symbols.ENDPOINT_OVERRIDDEN) {
						return render(404, "pug/friendlyerror.pug", {
							statusCode: 404,
							title: "Not found",
							message: "This user doesn't exist.",
							withInstancesLink: false
						})
					} else if (error === constants.symbols.INSTAGRAM_DEMANDS_LOGIN || error === constants.symbols.RATE_LIMITED) {
						return {
							statusCode: 503,
							contentType: "text/html",
							headers: {
								"Cache-Control": `public, max-age=${userRequestCache.getTtl("user/"+fill[0], 1000)}`,
								"Retry-After": userRequestCache.getTtl("user/"+fill[0], 1000)
							},
							content: pugCache.get("pug/blocked.pug").web({
								website_origin: constants.website_origin,
								username: fill[0],
								expiresMinutes: userRequestCache.getTtl("user/"+fill[0], 1000*60),
								getStaticURL
							})
						}
					} else if (error === constants.symbols.extractor_results.AGE_RESTRICTED) {
						return render(403, "pug/age_gated.pug")
					} else {
						throw error
					}
				})
			} else {
				if (constants.feeds.feed_message.enabled) {
					const setup = getFeedSetup(fill[0], "", undefined, new Date())
					const feed = new Feed(setup)
					addAnnouncementFeedItem(feed)
					return Promise.resolve(respondWithFeed(feed, kind, constants.feeds.feed_disabled_max_age, false))
				} else {
					return Promise.resolve(render(403, "pug/friendlyerror.pug", {
						statusCode: 403,
						title: "Feeds disabled",
						message: "Feeds are disabled on this instance.",
						withInstancesLink: true
					}))
				}
			}
		}
	}
]
