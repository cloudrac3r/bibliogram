const {request} = require("../utils/request")
const {log} = require("pinski/util/common")

let addresses = []

request("https://check.torproject.org/torbulkexitlist").text().then(text => {
	const lines = text.split("\n").filter(l => l)
	addresses = addresses.concat(lines)
	log(`Loaded Tor exit node list (${addresses.length} total)`, "spam")
})

/*
	request("https://meta.bibliogram.art/ip_proxy_list.txt").text().then(text => {
		const lines = text.split("\n").filter(l => l)
		addresses = addresses.concat(lines)
		log(`Loaded Bibliogram proxy list (${addresses.length} total)`, "spam")
	})
*/

function getIdentifier(address) {
	if (addresses.includes(address)) return "proxy"
	else return address
}

module.exports.getIdentifier = getIdentifier
