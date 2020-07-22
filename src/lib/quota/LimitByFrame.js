const constants = require("../constants")

class Frame {
	constructor(identifier) {
		this.identifier = identifier
		this.frameStartedAt = 0
		this.count = 0
	}

	refresh() {
		if (Date.now() > this.frameStartedAt + constants.quota.timeframe) {
			this.count = 0
		}
	}

	remaining() {
		this.refresh()
		return Math.max(constants.quota.count - this.count, 0)
	}

	add(count) {
		this.refresh()
		if (this.count === 0) this.frameStartedAt = Date.now()
		this.count += count
		return this.remaining()
	}
}

class LimitByFrame {
	constructor() {
		/** @type {Map<string, Frame>} */
		this.frames = new Map()
	}

	getOrCreateFrame(identifier) {
		if (!this.frames.has(identifier)) {
			const frame = new Frame(identifier)
			this.frames.set(identifier, frame)
			return frame
		} else {
			return this.frames.get(identifier)
		}
	}

	remaining(identifier) {
		return this.getOrCreateFrame(identifier).remaining()
	}

	add(identifier, count) {
		return this.getOrCreateFrame(identifier).add(count)
	}
}

module.exports = LimitByFrame
