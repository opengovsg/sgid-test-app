const {sgidClient, randomnonce} = require('../lib/sgid-client-singleton')

/**
 * Main controller function to generate the callback page
 *
 * @param {*} req
 * @param {*} res
 */
async function index(req, res) {
  try {
    const { code, state } = req.query
	const { accessToken } = await sgidClient[state].callback(code,randomnonce)
    const { sub, data } = await sgidClient[state].userinfo(accessToken)
    const formattedData = formatData(data)

    res.render('callback', {
      data: [['sgID', sub], ...formattedData],
    })
  } catch (error) {
    console.error(error)
    res.status(500).render('error', { error })
  }
}

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

module.exports = index
