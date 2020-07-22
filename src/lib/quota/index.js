const constants = require("../constants")
const LimitByFrame = require("./LimitByFrame")
const {getIdentifier} = require("./get_identifier")
require("../testimports")(LimitByFrame, getIdentifier)

const limiter = new LimitByFrame()

function getIPFromReq(req) {
	if (constants.quota.ip_mode === "header") {
		return req.headers[constants.quota.ip_header]
	} else { // constants.quota.ip_mode === "address"
		return req.connection.remoteAddress
	}
}

function remaining(req) {
	if (!constants.quota.enabled) return Infinity // sure.

	const ip = getIPFromReq(req)
	const identifier = getIdentifier(ip)
	return limiter.remaining(identifier)
}

function add(req, count) {
	if (!constants.quota.enabled) return Infinity // why not.

	const ip = getIPFromReq(req)
	const identifier = getIdentifier(ip)
	return limiter.add(identifier, count)
}

module.exports.remaining = remaining
module.exports.add = add
