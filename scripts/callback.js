const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const hostname = process.env.HOSTNAME

const { clients } = require('../lib/sgid')
const config = require('../lib/config')

/**
 * Main controller function to generate the callback page
 *
 * @param {*} req
 * @param {*} res
 */
async function index(req, res) {
  try {
    const { code, state } = req.query
    const baseurl = config.baseUrls[state]

    const client = clients[state]

    if (!client) {
      console.error(`Invalid state: ${state}`)
      return res.status(500).json({ error: 'Invalid state' })
    }

    const { accessToken } = await client.callback(code, null)
    const { sub, data } = await client.userinfo(accessToken)

    res.render('callback', {
      data: [['sgID', sub], ...formatData(data)],
    })
  } catch (error) {
    console.log(error)
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
