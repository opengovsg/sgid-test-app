const config = require('../lib/config')
const {
  sgidService,
  scopes,
  randomnonce,
} = require('../lib/sgid-client.service')
/**
 * Main controller function to generate the home page
 *
 * @param {*} _req
 * @param {*} res
 */
function index(_req, res) {
  const authUrl = {}
  Object.keys(config.baseUrls).forEach((env) => {
    authUrl[env] = sgidService[env].authorizationUrl(
      env,
      scopes,
      randomnonce
    ).url
  })
  res.render('index', { authUrl })
}

module.exports = index
