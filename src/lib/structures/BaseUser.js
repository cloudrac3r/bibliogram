const constants = require("../constants")
const {proxyProfilePic} = require("../utils/proxyurl")
const {structure} = require("../utils/structuretext")

const rewriters = {
	rewrite_youtube: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"],
	rewrite_twitter: ["twitter.com", "www.twitter.com", "twtr.cm"]
}

class BaseUser {
	constructor() {
		/** @type {import("../types").GraphUser} */
		this.data
		/** @type {number} */
		this.cachedAt
	}

	/**
	 * @param {object} settings
	 * @param {string} settings.rewrite_youtube
	 * @param {string} settings.rewrite_twitter
	 */
	getRewriteLink(settings) {
		if (!this.data.external_url) return null
		let url
		try {
			url = new URL(this.data.external_url)
		} catch (e) {
			return null
		}
		for (const key of Object.keys(rewriters)) { // for each thing we can rewrite
			if (key in settings) { // if the settings want to replace it
				if (rewriters[key].includes(url.host)) { // if the url matches this filter
					if (settings[key].includes("://")) {
						[url.protocol, url.host] = settings[key].split("//")
					} else {
						url.host = settings[key]
						url.protocol = "https:"
					}
				}
			}
		}
		return url.toString()
	}

	computeProxyProfilePic() {
		this.proxyProfilePicture = proxyProfilePic(this.data.profile_pic_url, this.data.id)
	}

	getStructuredBio() {
		if (!this.data.biography) return null
		return structure(this.data.biography)
	}

	getTtl(scale = 1) {
		const expiresAt = this.cachedAt + constants.caching.resource_cache_time
		const ttl = expiresAt - Date.now()
		return Math.ceil(Math.max(ttl, 0) / scale)
	}

	export() {
		return this.data
	}
}

module.exports = BaseUser
