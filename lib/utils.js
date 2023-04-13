/**
 * Formats the data into an array of arrays,
 * specifically for the display on the frontend
 *
 * @param {object} result
 * @returns {array}
 */
function formatData(result) {
	const formattedResult = []

	for (const [key, value] of Object.entries(result)) {
		formattedResult.push([prettifyKey(key), value])
	}

	return formattedResult
}

/**
 * Converts a key string from dot-delimited into uppercase
 * for frontend display
 *
 * @param {string} key
 * @returns {string}
 */
function prettifyKey(key) {
	let prettified = key.split('.')[1]
	prettified = prettified.replace(/_/g, ' ')
	return prettified.toUpperCase()
}

module.exports = {
	formatData
}