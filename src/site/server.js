const {Pinski} = require("pinski")
const {subdirs} = require("node-dir")
const constants = require("../lib/constants")
const lang = require("../lang")

const passthrough = require("./passthrough")

const deniedFeatures = [
	"accelerometer", "ambient-light-sensor", "battery", "camera", "display-capture", "document-domain", "geolocation", "gyroscope",
	"magnetometer", "microphone", "midi", "payment", "publickey-credentials-get", "sync-xhr", "usb", "xr-spatial-tracking"
]

const pinski = new Pinski({
	port: +process.env.PORT || constants.port,
	ip: constants.bind_ip,
	relativeRoot: __dirname,
	basicCacheControl: {
		exts: ["ttf", "woff2", "png", "jpg", "jpeg", "svg", "gif", "webmanifest", "ico"],
		seconds: 604800
	},
	globalHeaders: {
		"Content-Security-Policy": "default-src 'self'; frame-ancestors 'none'; block-all-mixed-content",
		"Feature-Policy": deniedFeatures.map(feature => `${feature} 'none'`).join("; "),
		"Referrer-Policy": "strict-origin",
		"X-Content-Type-Options": "nosniff"
	},
	onionLocation: constants.onion_location
})

pinski.startServer()

subdirs("pug", async (err, dirs) => {
	if (err) throw err

	// need to check for and run db upgrades before anything starts using it
	await require("../lib/utils/upgradedb")()

	pinski.setNotFoundTarget("/404")
	for (const file of constants.themes.collatedFiles) {
		pinski.addRoute(`/static/css/${file}.css`, `sass/${file}.sass`, "sass")
	}
	pinski.addRoute("/settings", "pug/settings.pug", "pug")
	pinski.addPugDir("pug", dirs)
	pinski.addSassDir("sass", ["sass/includes", "sass/themes"])
	pinski.addStaticHashTableDir("html/static/js")
	pinski.addStaticHashTableDir("html/static/img")
	pinski.muteLogsStartingWith("/imageproxy")
	pinski.muteLogsStartingWith("/videoproxy")
	pinski.muteLogsStartingWith("/static")

	for (const route of constants.additional_routes) {
		pinski.addRoute(route.web, route.local, route.type)
	}

	if (constants.tor.enabled) {
		await require("../lib/utils/tor") // make sure tor state is known before going further
	}

	pinski.addAPIDir("api")

	if (constants.as_assistant.enabled) {
		console.log("[.] Assistant API enabled")
		pinski.addAPIDir("assistant_api")
	}

	const plugins = require("pinski/plugins")
	plugins.setInstance(pinski)
	Object.assign(pinski.pugDefaultLocals, {constants, lang})
	Object.assign(passthrough, pinski.getExports())

	console.log("[.] Server started")

	if (process.stdin.isTTY || process.argv.includes("--enable-repl")) {
		pinski.waitForFirstCompile().then(() => {
			require("./repl")
		})
	}
})

module.exports = pinski
