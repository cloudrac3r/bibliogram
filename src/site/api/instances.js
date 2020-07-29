const constants = require("../../lib/constants")
const {RequestCache} = require("../../lib/cache")
const {request} = require("../../lib/utils/request")
const {Parser} = require("../../lib/utils/parser/parser")

const instanceListCache = new RequestCache(constants.caching.instance_list_cache_time)

module.exports = [
	{
		route: "/api/instances", methods: ["GET"], code: () => {
			return instanceListCache.getOrFetch("instances", () => {
				return request(constants.resources.instances_wiki_raw).text().then(text => {
					const result = (() => {
						const instances = []
						const parser = new Parser(text)
						parser.seek("# Instance list", {moveToMatch: true, useEnd: true})
						let inTable = false
						while (!inTable && parser.hasRemaining()) {
							parser.store()
							const line = parser.get({split: "\n"})
							if (line.startsWith("|")) {
								inTable = true
								parser.restore()
							}
						}
						if (!parser.hasRemaining()) return null
						while (parser.hasRemaining()) {
							const line = parser.get({split: "\n"})
							if (line.startsWith("|")) {
								/** [empty, address, country, rss, privacy policy, cloudflare] */
								const parts = line.split("|")
								if (parts.length >= 6 && parts[1].includes("://")) {
									let address = parts[1].trim().split(" ")[0]
									let match
									if (match = address.match(/^\[\S+\]\((\S+)\)$/)) address = match[1]
									instances.push({
										address,
										country: parts[2].match(/[A-Z]{2,}|$/)[0] || null,
										official: address === "https://bibliogram.art", // yeah we're just gonna hard code this
										rss_enabled: parts[3].trim() !== "",
										has_privacy_policy: parts[4].trim() !== "",
										using_cloudflare: parts[5].trim() !== "",
										onion_site: address.endsWith(".onion")
									})
								}
							} else {
								inTable = false
							}
						}
						return instances
					})()
					if (Array.isArray(result) && result.length) {
						return {
							statusCode: 200,
							contentType: "application/json",
							content: {
								status: "ok",
								version: "2.1",
								generatedAt: Date.now(),
								data: result
							}
						}
					} else {
						return {
							statusCode: 503,
							contentType: "application/json",
							content: {
								status: "fail",
								generatedAt: Date.now(),
								message: `Unable to parse the table from the instances page at ${constants.resources.instances_wiki_raw}`
							}
						}
					}
				})
			}).then(cacheResult => cacheResult.result)
		}
	}
]
