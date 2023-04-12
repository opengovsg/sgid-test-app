const config = require('../lib/config')
const {sgidClient, scopes, randomnonce} = require('../lib/sgid-client-singleton')
/**
 * Main controller function to generate the home page
 *
 * @param {*} _req
 * @param {*} res
 */
function index(_req, res) {
  const authUrl = {}
  for (const [env, ] of Object.entries(config.baseUrls)) {
	authUrl[env] = sgidClient[env].authorizationUrl(env,scopes,randomnonce).url
  }

  res.render('index', { authUrl })
}

module.exports = index
