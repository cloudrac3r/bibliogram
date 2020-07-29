const constants = require("./constants")

/**
 * @template T
 */
class TtlCache {
	/**
	 * @param {number} ttl time to keep each resource in milliseconds
	 */
	constructor(ttl) {
		this.ttl = ttl
		/** @type {Map<string, {data: T, time: number}>} */
		this.cache = new Map()
		this.sweepInterval = setInterval(() => {
			this.clean()
		}, constants.caching.cache_sweep_interval)
		this.sweepInterval.unref()
	}

	clean() {
		for (const key of this.cache.keys()) {
			this.cleanKey(key)
		}
	}

	cleanKey(key) {
		const value = this.cache.get(key)
		if (value && Date.now() > value.time + this.ttl) this.cache.delete(key)
	}

	/**
	 * @param {string} key
	 */
	has(key) {
		this.cleanKey(key)
		return this.hasWithoutClean(key)
	}

	hasWithoutClean(key) {
		return this.cache.has(key)
	}

	hasNotPromise(key) {
		const has = this.has(key)
		if (!has) return false
		const value = this.get(key)
		if (value instanceof Promise || (value.constructor && value.constructor.name === "Promise")) return false
		return true
	}

	/**
	 * @param {string} key
	 */
	get(key) {
		this.cleanKey(key)
		return this.getWithoutClean(key)
	}

	getWithoutClean(key) {
		const value = this.cache.get(key)
		if (value) return value.data
		else return null
	}

	/**
	 * Returns null if doesn't exist
	 * @param {string} key
	 * @param {number} factor factor to divide the result by. use 60*1000 to get the ttl in minutes.
	 */
	getTtl(key, factor = 1) {
		if (this.has(key)) {
			return Math.max(Math.ceil((this.cache.get(key).time + this.ttl - Date.now()) / factor), 0)
		} else {
			return null
		}
	}

	/**
	 * @param {string} key
	 * @param {any} data
	 */
	set(key, data) {
		this.cache.set(key, {data, time: Date.now()})
	}

	/**
	 * @param {string} key
	 */
	refresh(key) {
		this.cache.get(key).time = Date.now()
	}
}

/**
 * @extends TtlCache<Promise<T>>
 * @template T
 */
class RequestCache extends TtlCache {
	/**
	 * @param {number} ttl time to keep each resource in milliseconds
	 */
	constructor(ttl) {
		super(ttl)
	}

	/**
	 * @param {string} key
	 * @param {() => Promise<T>} callback
	 * @returns {Promise<{result: T, fromCache: boolean}>}
	 */
	getOrFetch(key, callback) {
		this.cleanKey(key)
		if (this.cache.has(key)) {
			return this.getWithoutClean(key).then(result => ({result, fromCache: true}))
		} else {
			const pending = callback()
			this.set(key, pending)
			return pending.then(result => ({result, fromCache: false}))
		}
	}

	/**
	 * @param {string} key
	 * @param {() => Promise<T>} callback
	 * @returns {Promise<{result: T, fromCache: boolean}>}
	 */
	getOrFetchPromise(key, callback) {
		return this.getOrFetch(key, callback).then(result => {
			this.cache.delete(key)
			return result
		}).catch(error => {
			this.cache.delete(key)
			throw error
		})
	}
}

/**
 * @template T
 */
class UserRequestCache extends TtlCache {
	constructor(ttl) {
		super(ttl)
		/** @type {Map<string, {data: T, isReel: boolean, isFailedPromise: boolean, htmlFailed: boolean, reelFailed: boolean, time: number}>} */
		this.cache
		/** @type {Map<string, string>} */
		this.idCache = new Map()
	}

	/**
	 * @param {string} key
	 * @param {boolean} isReel
	 * @param {any} [data]
	 */
	set(key, isReel, data) {
		const existing = this.cache.get(key)
		// Preserve html failure status if now requesting as reel
		const htmlFailed = isReel && existing && existing.htmlFailed
		this.cache.set(key, {data, isReel, isFailedPromise: false, htmlFailed, reelFailed: false, time: Date.now()})
		if (data && data.data && data.data.id) this.idCache.set(data.data.id, key) // this if statement is bad
	}

	/**
	 * @param {string} key
	 * @param {boolean} isHtmlPreferred
	 * @param {boolean} willFetchReel
	 * @param {() => Promise<T>} callback
	 * @returns {Promise<T>}
	 */
	getOrFetch(key, willFetchReel, isHtmlPreferred, callback) {
		this.cleanKey(key)
		if (this.cache.has(key)) {
			const existing = this.cache.get(key)
			if (!existing.isFailedPromise) { // if the existing entry contains usable data
				if (!existing.isReel) { // hurrah, the best we could get!
					return Promise.resolve(existing.data)
				}
				// we don't have HTML, only reel
				if (!isHtmlPreferred) { // well that's cool, we only wanted reel anyway
					return Promise.resolve(existing.data)
				} else { // (isHtmlPreferred ~= true): we'd _like_ some HTML, but we don't have it currently. if HTML is blocked then using reel is smart
					if (existing.htmlFailed) { // HTML is in fact blocked, so we will have to settle for reel. fortunately we already have reel!
						return Promise.resolve(existing.data)
					}
				}
			} else { // (existing.isFailedPromise ~= true): the existing entry is a failed request
				if (existing.reelFailed || (existing.htmlFailed && !willFetchReel)) { // it's no use! the attempt will fail again; don't try.
					return Promise.resolve(existing.data) // this is actually a promise rejection
				}
			}
		}
		const pending = callback().then(result => {
			if (this.getWithoutClean(key) === pending) { // if nothing has replaced the current cache in the meantime
				this.set(key, willFetchReel, result)
			}
			return result
		}).catch(error => {
			if (willFetchReel) this.cache.get(key).reelFailed = true
			else this.cache.get(key).htmlFailed = true
			this.cache.get(key).isFailedPromise = true
			throw error
		})
		this.set(key, willFetchReel, pending)
		return pending
	}

	getByID(id) {
		const key = this.idCache.get(id)
		if (key == null) return null
		const data = this.getWithoutClean(key)
		if (data == null) return null
		return data
	}
}

module.exports.TtlCache = TtlCache
module.exports.RequestCache = RequestCache
module.exports.UserRequestCache = UserRequestCache
