const base = require("./base")

class Lang {
	constructor() {
		/** @type {Map<string, import("./base")>} */
		this.backing = new Map()

		this.backing.set("base", require("./base"))

		for (const code of ["en", "en-us", "es", "fa", "gl", "it", "ru"]) {
			// Assign lang
			const data = require(`./${code}`)
			this.backing.set(code, data)
			// Check properties
			for (const key of Object.keys(base)) {
				if (!key.startsWith("meta_") && (!data[key] || data[key] === base[key])) {
					console.log(`[!] [${code}] ${key} was not replaced`)
				}
			}
		}
	}

	/**
	 * @param {string} code
	 */
	get(code) {
		if (this.backing.has(code)) {
			// console.log(`[.] Getting language code ${code}`)
			return this.backing.get(code)
		} else {
			console.log(`[!] WARNING: tried to get missing language code ${code}`)
			return this.backing.get("base")
		}
	}
}

const lang = new Lang()

module.exports = lang
