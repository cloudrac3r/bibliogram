import {q, ElemJS} from "./elemjs/elemjs.js"
import {timeline} from "./post_series.js"
import {quota} from "./quota.js"

/** @type {PostOverlay[]} */
const postOverlays = []
const titleHistory = []
titleHistory.push(document.title)
const shortcodeDataMap = new Map()

window.addEventListener("popstate", event => {
	// console.log(event.state, postOverlays.length)
	if (event.state) {
		if (event.state.view === "post_overlay") {
			console.log(event.state.shortcode, postOverlays.map(o => o.identifier))
			/*if (postOverlays.length >= 2 && postOverlays.slice(-2)[0].identifier === event.state.shortcode) {
				// continue down to actually pop please
			} else {*/
				return loadPostOverlay(event.state.shortcode, "none")
			/*}*/
		}
	}
	// event.state === null which means back to originally loaded page, so pop overlay
	setTimeout(() => { // make sure document is entirely loaded
		if (titleHistory.length === 1) {
			document.title = titleHistory[0]
		} else if (titleHistory.length >= 2) {
			titleHistory.pop()
			document.title = titleHistory.slice(-1)[0]
		}
		if (postOverlays.length) {
			popOverlay()
		} else {
			window.location.reload()
		}
	})
})

function pushOverlay(overlay) {
	postOverlays.push(overlay)
	document.body.style.overflowY = "hidden"
}

function popOverlay() {
	const top = postOverlays.pop()
	if (top) {
		top.pop()
	}
	if (postOverlays.length === 0) document.body.style.overflowY = "auto"
}

class PostOverlay extends ElemJS {
	constructor(identifier) {
		super("div")
		this.identifier = identifier
		this.loaded = false
		this.available = true
		this.keyboardListeners = []

		this.class("post-overlay")
		this.event("click", event => {
			if (event.target === event.currentTarget) history.back()
		})
		setTimeout(() => {
			if (!this.loaded) {
				this.class("loading")
				this.child(
					new ElemJS("div").class("loading-inner").text("Loading...")
				)
			}
		}, 0)
	}

	addKeyboardCallback(callback) {
		if (this.available) {
			this.keyboardListeners.push(callback)
			document.addEventListener("keydown", callback)
		}
	}

	setContent(html) {
		this.html(html)
		this.loaded = true
		this.removeClass("loading")
	}

	showError() {
		this.loaded = true
		this.class("loading")
		this.clearChildren()
		this.child(
			new ElemJS("div").class("loading-inner").text("Request failed.")
		)
	}

	pop() {
		this.element.remove()
		this.available = false
		while (this.keyboardListeners.length) {
			document.removeEventListener("keydown", this.keyboardListeners.shift())
		}
	}
}

const timelineElement = q("#timeline")
if (timelineElement) {
	timelineElement.addEventListener("click", event => {
		/** @type {HTMLElement[]} */
		//@ts-ignore
		const path = event.composedPath()
		const postLink = path.find(element => element.classList && element.classList.contains("sized-link") && element.hasAttribute("data-shortcode"))
		if (postLink) {
			event.preventDefault()
			const shortcode = postLink.getAttribute("data-shortcode")
			loadPostOverlay(shortcode, "push")
		}
	})
}

function fetchShortcodeFragment(shortcode) {
	if (shortcodeDataMap.has(shortcode)) return Promise.resolve(shortcodeDataMap.get(shortcode))
	else return fetch(`/fragment/post/${shortcode}`).then(res => res.json())
}

function loadPostOverlay(shortcode, stateChangeType) {
	const overlay = new PostOverlay(shortcode)
	document.body.appendChild(overlay.element)
	pushOverlay(overlay)
	if (stateChangeType === "push") {
		history.pushState({view: "post_overlay", shortcode: shortcode}, "", `/p/${shortcode}`)
	} else if (stateChangeType === "replace") {
		history.replaceState({view: "post_overlay", shortcode: shortcode}, "", `/p/${shortcode}`)
	} else if (stateChangeType !== "none") {
		throw new Error("Unknown stateChangeType: "+stateChangeType)
	}
	return new Promise((resolve, reject) => {
		const fetcher = fetchShortcodeFragment(shortcode)
		fetcher.then(root => {
			if (root.redirectTo) {
				window.location.assign(root.redirectTo)
				return
			}

			if (root.quota) {
				quota.set(root.quota)
				delete root.quota // don't apply the old quota next time the post is opened
			}

			shortcodeDataMap.set(shortcode, root)
			if (overlay.available) {
				const {title, html} = root
				overlay.setContent(html)
				if (overlay.available) {
					document.title = title
				}
				while (postOverlays.length >= 2) postOverlays.shift().pop()
				const entry = timeline.entries.get(shortcode)
				let canInteractWithNavigation = true
				overlay.element.querySelectorAll(".navigate-posts").forEach(button => {
					button.addEventListener("click", async event => {
						/** @type {HTMLButtonElement} */
						// @ts-ignore
						const button = event.currentTarget
						if (button.hasAttribute("data-next")) {
							navigate("next")
						} else if (button.hasAttribute("data-previous")) {
							navigate("previous")
						}
					})
				})
				overlay.addKeyboardCallback(event => {
					if (event.key === "ArrowRight") navigate("next")
					else if (event.key === "ArrowLeft") navigate("previous")
				})
				async function navigate(direction) {
					if (canInteractWithNavigation) {
						/** @type {HTMLButtonElement} */
						//@ts-ignore
						if (direction === "next") {
							canInteractWithNavigation = false
							if (entry.isLastEntry()) await timeline.fetch()
							if (!overlay.available) return
							var futureShortcode = entry.getNextShortcode()
						} else { // "previous"
							if (entry.isFirstEntry()) return
							canInteractWithNavigation = false
							var futureShortcode = entry.getPreviousShortcode()
						}
						if (futureShortcode) {
							await loadPostOverlay(futureShortcode, "replace")
							const newOverlay = postOverlays.slice(-1)[0]
							if (newOverlay === overlay) { // was cancelled
								canInteractWithNavigation = true
							}
						} else {
							canInteractWithNavigation = true
						}
					}
				}
			}
			resolve()
		})
		fetcher.catch(error => {
			console.error(error)
			overlay.showError()
			reject(error)
		})
	})
}
