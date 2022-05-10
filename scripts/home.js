const scopes = process.env.SCOPES
const clientId = process.env.CLIENT_ID
const hostname = process.env.HOSTNAME

const { clients } = require('../lib/sgid')

/**
 * Main controller function to generate the home page
 *
 * @param {*} _req
 * @param {*} res
 */
function index(_req, res) {
  const authUrl = {}
  for (const [env, client] of Object.entries(clients)) {
    authUrl[env] = client.authorizationUrl(env, scopes, null).url
  }

  res.render('index', { authUrl })
}

module.exports = index
