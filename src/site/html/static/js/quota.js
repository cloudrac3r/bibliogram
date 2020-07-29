import {ElemJS, q} from "./elemjs/elemjs.js"

class Quota extends ElemJS {
	constructor() {
		super(q("#quota"))
		this.value = +this.element.textContent
	}

	set(value) {
		this.value = value
		this.text(this.value)
	}

	change(difference) {
		this.value += difference
		this.value = Math.max(0, this.value)
		this.text(this.value)
	}
}

const quota = new Quota()

export {quota}
