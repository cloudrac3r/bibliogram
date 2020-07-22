const tap = require("tap")
const se = require("selenium-webdriver")
const fs = require("fs").promises
const Jimp = require("jimp")
const commands = require("./screenshots/commands")
const child_process = require("child_process")
const constants = require("../src/lib/constants")

const browser = "firefox"

const port = 10407 + (+process.env.TAP_CHILD_ID)
constants.port = port
constants.request_backend = "saved" // predictable request results
const origin = `http://localhost:${port}`
constants.website_origin = origin

const dimensions = new Map([
	["firefox", {
		scrollbar: 12,
		heightDifference: 74,
		widthDifference: 0
	}],
	["chrome", {
		scrollbar: 15,
		heightDifference: 128,
		widthDifference: 8
	}]
])

const browserDimensions = dimensions.get(browser)

process.chdir("src/site")
const server = require("../src/site/server")

function exec(command) {
	return new Promise((resolve, reject) => {
		child_process.exec(command, (error, stdout, stderr) => {
			resolve({stdout, stderr})
		})
	})
}

;(async () => {
	await fs.mkdir("../../test/screenshots/diff", {recursive: true})
	await fs.mkdir("../../test/screenshots/staging", {recursive: true})

	const [driver] = await Promise.all([
		new se.Builder().forBrowser(browser).build(),
		server.waitForFirstCompile()
	])

	server.muteLogsStartingWith("/") // we don't need webserver stuff in our test logs

	function setSize(size) {
		return driver.manage().window().setRect({
			width: size.width + browserDimensions.widthDifference + browserDimensions.scrollbar,
			height: size.height + browserDimensions.heightDifference
		})
	}

	await driver.get(origin)

	for (const command of commands) {
		function screenPath(dir) {
			return `../../test/screenshots/${dir}/${command.filename}.png`
		}

		await Promise.all(Object.keys(command.cookies).map(cookieName =>
			driver.manage().addCookie({
				name: cookieName,
				value: command.cookies[cookieName]
			})
		))

		await Promise.all([
			setSize(command.size),
			driver.get(origin + command.url)
		])

		const finalExists = await fs.access(screenPath("final")).then(() => true).catch(() => false)

		const screenshot = Buffer.from(await driver.takeScreenshot(), "base64")

		const message = `equal screens: ${command.filename}`
		tap.test(message, async childTest => {
			const image = await Jimp.read(screenshot)
			image.crop(0, 0, command.size.width, command.size.height) // crop out page scrollbar

			if (finalExists) {
				await image.writeAsync(screenPath("staging"))
				const message = `screen: ${command.filename}`
				const result = await exec(`compare -metric AE ${screenPath("staging")} ${screenPath("final")} ${screenPath("diff")}`)
				const diff = +result.stderr
				childTest.ok(diff === 0, message)
				if (diff === 0) { // it worked, so we don't need the files anymore
					fs.unlink(screenPath("staging"))
					fs.unlink(screenPath("diff"))
				}
			} else {
				image.writeAsync(screenPath("final"))
				console.log(`note: creating new screenshot ${command.filename}`)
			}
		})
	}

	tap.teardown(() => {
		driver.close()
		server.shutdown()
	})
})()
