const scopes = process.env.SCOPES
const clientId = process.env.CLIENT_ID
const hostname = process.env.HOSTNAME

const config = require('../lib/config')

/**
 * Main controller function to generate the home page
 *
 * @param {*} _req
 * @param {*} res
 */
function index(_req, res) {
  const authUrl = {}
  for (const [env, baseurl] of Object.entries(config.baseUrls)) {
    authUrl[
      env
    ] = `${baseurl}/v1/oauth/authorize?response_type=code&purpose=For%20testing%20purposes&client_id=${clientId}&scope=${scopes}&redirect_uri=${hostname}/callback&nonce=randomnonce&state=${env}`
  }

  res.render('index', { authUrl })
}

module.exports = index
