const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const hostname = process.env.HOSTNAME

const sgid = require('../lib/sgid')
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

    const { accessToken } = await fetchToken(baseurl, code)
    const { sub, data } = await fetchUserInfo(baseurl, accessToken, process.env.PRIVATE_KEY)

    res.render('callback', {
      data: [['sgID', sub], ...data],
    })
  } catch (error) {
    console.log(error)
    res.status(500).render('error', { error })
  }
}

/**
 * Fetches the token from the oauth endpoint
 * 
 * @param {string} baseUrl
 * @param {string} code
 */
async function fetchToken(baseUrl, code) {
  try {
    return await sgid.fetchToken(
      baseUrl,
      clientId,
      clientSecret,`${hostname}/callback`,
      code
    )
  } catch (error) {
    console.error(`Error in fetchToken: ${error.message}`)
    throw error
  }
}

/**
 * Fetches user info
 * 
 * @param {string} baseUrl
 * @param {string} accessToken
 * @param {string} privateKeyPem
 * @return {object} { sub: string, data: array }
 */
async function fetchUserInfo(baseUrl, accessToken, privateKeyPem) {
  try {
    const { sub, data } = await sgid.fetchUserInfo(baseUrl, accessToken, privateKeyPem)
    return {
      sub,
      data: formatData(data)
    }
  } catch (error) {
    console.error(`Error in fetchUserInfo: ${error.message}`)
    throw error
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
