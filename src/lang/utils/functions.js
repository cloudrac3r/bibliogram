const compile = require("pug").compile

/**
 * @param {string} text
 */
function pug(text) {
	let lines = text.split("\n")
	while (lines[0] === "") lines.shift()
	const indentLevel = lines[0].match(/^\t*/)[0].length
	lines = lines.map(l => l.replace(new RegExp(`^\\t{0,${indentLevel}}`), ""))
	return compile(lines.join("\n"))
}

module.exports.pug = pug
