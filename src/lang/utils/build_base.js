const fs = require("fs").promises
const pj = require("path").join

;(async () => {
	const contents = await fs.readFile(pj(__dirname, "base.txt"), "utf8")
	const lines = contents.split("\n")
	let template = await fs.readFile(pj(__dirname, "base.template.js"), "utf8")

	template = template
		.replace("// This file is a template.", "// This file was automatically generated and its contents will be overwritten later.")
		.replace("// CONTENT", lines
			.filter(l => l && !l.startsWith("#"))
			.map(l => {
				if (l.startsWith("pug_")) {
					return `"${l}": locals => "MISSING TEMPLATE: ${l}"`
				} else if (l.startsWith("fn_")) {
					return `"${l}": () => "MISSING FUNCTION: ${l}"`
				} else {
					return `"${l}": "MISSING STRING: ${l}"`
				}
			})
			.join(",\n\t")
		)

	await fs.writeFile(pj(__dirname, "../base.js"), template, "utf8")

	console.log("base.js written.")
})()
