/*
	Welcome to the constants file!
	Copy a key and provide a new value in /config.js to override the value here.
	Please read the comments above every section!
*/

let constants = {
	// Things that server owners _should_ change!
	// Protocol and domain that the website can be accessed on. Images and links in RSS feeds start with this URL.
	// Do NOT include a trailing slash. If you leave this as localhost, Bibliogram will not work correctly when accessed from any other device.
	// If you are using nginx to make Bibliogram accessible on port 80/443, do NOT write a port here.
	// For example, "https://bibliogram.art"
	website_origin: "http://localhost:10407",
	// IP address to bind to.
	// "0.0.0.0" will make the server reachable on all IPv4 interfaces.
	// "::" will make the server reachable on all IPv6 interfaces, and maybe also IPv4. (https://nodejs.org/api/net.html#net_server_listen_port_host_backlog_callback)
	// If you run nginx, you must change the nginx config instead.
	bind_ip: "0.0.0.0",
	// Port to actually run the webserver on.
	port: 10407,
	// You MUST read /src/site/pug/privacy.pug.template before changing has_privacy_policy!
	has_privacy_policy: false,
	// If your instance is also available as an onion site, add the onion URL here.
	// It should look something like "http://3gldbgtv5e4god56.onion" (no trailing slash).
	onion_location: null,

	// Things that server owners _could_ change if they want to.
	tor: {
		enabled: false, // If false, everything else in this block has no effect.
		password: null, // If `null`, Bibliogram will run its own Tor process instead.
		for: {
			user_html: false, // User HTML page seems to have less forgiving rates, and Tor always fails, so it's disabled by default.
			timeline_graphql: true,
			post_graphql: true,
			reel_graphql: true
		}
	},
	request_backend: "node-fetch", // one of: "node-fetch", "got"
	// After setting your privacy policy, I suggest you read src/site/html/.well-known/dnt-policy.txt. If you comply with it,
	// change this to `true` to serve it, which will make extensions like Privacy Badger automatically whitelist the domain.
	does_not_track: false,

	allow_user_from_reel: "preferForRSS", // one of: "never", "fallback", "prefer", "onlyPreferSaved", "preferForRSS"

	feeds: {
		// Whether feeds are enabled.
		enabled: true,
		// Whether to display links to feeds on pages.
		display_links: true,
		// Whether to display the `v!` link to validate a feed.
		display_validation_links: false,
		// This feed message field allows you to insert a custom message into all RSS feeds to inform users of important changes,
		// such as feeds being disabled forever on that instance.
		feed_message: {
			enabled: false,
			// If the feed message is enabled, then `id` MUST be supplied.
			// Please set it to `bibliogram:feed_announcement/your.domain/1`
			// replacing `your.domain` with the address of your own domain,
			// and incrementing `1` every time you make a new announcement (to make sure the IDs are unique).
			id: "",
			// The timestamp that you disabled feeds at. For example, if you disabled feeds forever starting at 2020-04-01T12:00:00 UTC,
			// you should set this to 1585742400000.
			timestamp: 0,
			// The title of the feed item.
			title: "Important message from Bibliogram",
			// The text of the message.
			message: "There is an important message about feeds on this Bibliogram instance. Please visit this link to read the message: ",
			// The link address.
			link: "https://your.domain/feedannouncement"
		},
		feed_disabled_max_age: 2*24*60*60 // 2 days
	},

	// Themes. `file` is the filename without extension. `name` is the display name on the settings page.
	// If you make your own theme, I encourage you to submit a pull request for it!
	themes: {
		// If you want to disable some official themes, then create an entry that replaces this array in config.js.
		// Format: `{file: string, name: string}[]`
		official: [
			{file: "classic", name: "Vanilla sard"},
			{file: "blue", name: "Vanilla sky"},
			{file: "discord", name: "Discord dark"},
			{file: "pitchblack", name: "Pitch black"},
			{file: "pussthecat.org", name: "PussTheCat.org dark v1"},
			{file: "pussthecat.org-v2", name: "PussTheCat.org dark v2"},
		],
		// To add your own theme, create an entry that replaces this array in config.js, then add your theme to it.
		// Format: `{file: string, name: string}[]`
		custom: [
		],
		// If you want your custom theme to be the default for your instance, don't forget to set it here!
		// For good UI, you probably also want the default entry to be the first thing in the selection box.
		default: "classic",
		// This sets which order the themes appear in in the list on the settings page.
		sort: {
			// This sets whether the order is custom + official, or official + custom
			order: "custom_first", // "custom_first", "official_first"
			// To selectively override that order, add things to this array.
			// If you set it to `["blue", "midnight"]` then the theme with file name `blue` will be hoisted to the top,
			// the theme with file name `midnight` will be below it, and all other themes will appear below those.
			// Format: `string[]`
			manual: []
		},
		// These arrays should be empty, do not edit them!
		collated: [],
		collatedFiles: []
	},

	default_user_settings: {
		language: "en",
		rewrite_youtube: "invidio.us",
		rewrite_twitter: "nitter.net"
	},

	quota: {
		enabled: false,
		timeframe: 20*60*60*1000,
		count: 50,
		ip_mode: "header", // one of: "header", "address"
		ip_header: "x-forwarded-for"
	},

	user_settings: [
		{
			name: "language",
			default: "en",
			boolean: false,
			replaceEmptyWithDefault: true // set this to false if the control is a checkbox and is not disabled
		},{
			name: "show_comments",
			default: "",
			boolean: true,
			replaceEmptyWithDefault: true
		},{
			name: "remove_trailing_hashtags",
			default: "",
			boolean: true,
			replaceEmptyWithDefault: false
		},{
			name: "link_hashtags",
			default: "",
			boolean: true,
			replaceEmptyWithDefault: true
		},{
			name: "spa",
			default: "on",
			boolean: true,
			replaceEmptyWithDefault: false
		},{
			name: "infinite_scroll",
			default: "normal",
			boolean: false,
			replaceEmptyWithDefault: true
		},{
			name: "caption_side",
			default: "left",
			boolean: false,
			replaceEmptyWithDefault: true
		},{
			name: "display_alt",
			default: "",
			boolean: true,
			replaceEmptyWithDefault: true
		},{
			name: "timeline_columns",
			default: "dynamic",
			boolean: false,
			replaceEmptyWithDefault: true
		},{
			name: "display_top_nav",
			default: "",
			boolean: true,
			replaceEmptyWithDefault: true
		},{
			name: "save_data",
			default: "automatic",
			boolean: false,
			replaceEmptyWithDefault: true
		},{
			name: "rewrite_youtube",
			default: "",
			boolean: false,
			replaceEmptyWithDefault: false
		},{
			name: "rewrite_twitter",
			default: "",
			boolean: false,
			replaceEmptyWithDefault: false
		}
	],

	featured_profiles: [
	],

	use_assistant: {
		enabled: false,
		assistants: [
		],
		offline_request_cooldown: 20*60*1000,
		blocked_request_cooldown: 0
	},

	as_assistant: {
		enabled: false, // You can still start just the assistant with npm run assistant.
		require_key: false,
		// List of keys that are allowed access. You can use any string.
		// Try `crypto.randomBytes(20).toString("hex")` to get some randomness.
		keys: []
	},

	caching: {
		image_cache_control: `public, max-age=${7*24*60*60}`,
		resource_cache_time: 30*60*1000,
		instance_list_cache_time: 3*60*1000,
		cache_sweep_interval: 3*60*1000,
		csrf_time: 60*60*1000,
		self_blocked_status: {
			enabled: true,
			time: 2*60*60*1000,
		},
		db_user_id: true,
		db_post_n3: false,
		db_request_history: false
	},

	// Instagram uses this stuff. This shouldn't be changed, except to fix a bug that hasn't yet been fixed upstream.
	external: {
		reel_query_hash: "c9100bf9110dd6361671f113dd02e7d6",
		timeline_query_hash: "e769aa130647d2354c40ea6a439bfc08",
		timeline_query_hash_2: "42323d64886122307be10013ad2dcc44", // https://github.com/rarcega/instagram-scraper/blob/dc022081dbefc81500c5f70cce5c70cfd2816e3c/instagram_scraper/constants.py#L30
		shortcode_query_hash: "2b0673e0dc4580674a88d426fe00ea90",
		igtv_query_hash: "bc78b344a68ed16dd5d7f264681c4c76",
		timeline_fetch_first: 12,
		igtv_fetch_first: 12,
		username_regex: "[\\w.]*[\\w]",
		shortcode_regex: "[\\w-]+",
		hashtag_regex: "[^ \\n`~!@#\\$%^&*()\\-=+[\\]{};:\"',<.>/?\\\\]+",
		reserved_paths: [ // https://git.sr.ht/~cadence/bibliogram-docs/tree/master/docs/Reserved%20URLs.md
			// Redirects
			"about", "explore", "support", "press", "api", "privacy", "safety", "admin",
			// Content
			"embed.js",
			// Not found, but likely reserved
			"graphql", "accounts", "p", "help", "terms", "contact", "blog", "igtv"
		]
	},

	resources: {
		instances_wiki_raw: "https://git.sr.ht/~cadence/bibliogram-docs/blob/master/docs/Instances.md",
		saved_requests_location: "https://meta.bibliogram.art/saved_requests/"
	},

	// My code uses this stuff. Server owners have no reason to change it.
	symbols: {
		NO_MORE_PAGES: Symbol("NO_MORE_PAGES"),
		TYPE_IMAGE: Symbol("TYPE_IMAGE"),
		TYPE_VIDEO: Symbol("TYPE_VIDEO"),
		TYPE_GALLERY: Symbol("TYPE_GALLERY"),
		TYPE_GALLERY_IMAGE: Symbol("TYPE_GALLERY_IMAGE"),
		TYPE_GALLERY_VIDEO: Symbol("TYPE_GALLERY_VIDEO"),
		NOT_FOUND: Symbol("NOT_FOUND"),
		INSTAGRAM_DEMANDS_LOGIN: Symbol("INSTAGRAM_DEMANDS_LOGIN"),
		RATE_LIMITED: Symbol("RATE_LIMITED"),
		ENDPOINT_OVERRIDDEN: Symbol("ENDPOINT_OVERRIDDEN"),
		NO_ASSISTANTS_AVAILABLE: Symbol("NO_ASSISTANTS_AVAILABLE"),
		QUOTA_REACHED: Symbol("QUOTA_REACHED"),
		extractor_results: {
			SUCCESS: Symbol("SUCCESS"),
			AGE_RESTRICTED: Symbol("AGE_RESTRICTED"),
			NO_SHARED_DATA: Symbol("NO_SHARED_DATA")
		},
		assistant_statuses: {
			OFFLINE: Symbol("OFFLINE"),
			BLOCKED: Symbol("BLOCKED"),
			OK: Symbol("OK"),
			NONE: Symbol("NONE"),
			NOT_AUTHENTICATED: Symbol("NOT_AUTHENTICATED")
		},
		fetch_context: {
			RSS: Symbol("RSS"),
			ASSISTANT: Symbol("ASSISTANT")
		}
	},

	secrets: {
		push_webhook_token: null
	},

	additional_routes: [],

	database_version: 9
}

// Override values from config and export the result
const md = require("mixin-deep")
if (process.env.BIBLIOGRAM_CONFIG) { // presence of environment variable BIBLIOGRAM_CONFIG overrides /config.js
	const config = JSON.parse(process.env.BIBLIOGRAM_CONFIG)
	constants = md(constants, config)
} else {
	const config = require("../../config")
	constants = md(constants, config)
}

// Set theme settings
constants.user_settings.push({
	name: "theme",
	default: constants.themes.default,
	boolean: false,
	replaceEmptyWithDefault: true
})
let pool
if (constants.themes.sort.order === "custom_first") {
	pool = [].concat(constants.themes.custom, constants.themes.official)
} else if (constants.themes.sort.order === "official_first") {
	pool = [].concat(constants.themes.official, constants.themes.custom)
}
for (const file of constants.themes.sort.manual) {
	const index = pool.findIndex(row => row.file === file)
	if (index !== -1) {
		const removed = pool.splice(index, 1)[0]
		constants.themes.collated.push(removed)
	}
}
constants.themes.collated = constants.themes.collated.concat(pool)
constants.themes.collatedFiles = constants.themes.collatedFiles.concat(pool.map(row => row.file))

module.exports = constants
