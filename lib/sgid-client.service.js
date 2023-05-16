const { SgidClient, generatePkcePair } = require('@opengovsg/sgid-client')
const config = require('../lib/config')
const randomnonce = 'randomnonce'
const scopes = process.env.SCOPES

class SgidService {
  constructor({ clientId, clientSecret, privateKey, redirectUri, hostname }) {
    this.sgidClient = new SgidClient({
      clientId: clientId,
      clientSecret: clientSecret,
      privateKey: privateKey,
      redirectUri: redirectUri,
      hostname: hostname,
    })
    this.sub = ''
    this.codeVerifier = ''
  }

  /**
   * Fetches the url via sgid SDK
   *
   * @param {string} env
   * @param {string} scopes
   * @param {string} nonce
   * @returns {object} { url: string }
   */
  authorizationUrl(env, scopes, nonce) {
    if (!env || !scopes || !nonce)
      throw Error(`env, scopes, nonce cannot be empty`)
    try {
      const { codeChallenge, codeVerifier } = generatePkcePair()
      this.codeVerifier = codeVerifier
      const { url } = this.sgidClient.authorizationUrl({
        state: env,
        scope: scopes,
        nonce,
        codeChallenge,
      })
      return { url }
    } catch (e) {
      console.error(e)
      throw new Error('Error retrieving url via sgid-client')
    }
  }

  /**
   * Fetches the token via sgid SDK
   *
   * @param {string} code
   * @param {string} randomnonce
   * @returns {object} { sub: string, accessToken: string }
   */
  async callback(code, randomnonce) {
    if (!code) throw Error(`code cannot be empty`)
    try {
      const { sub, accessToken } = await this.sgidClient.callback({
        code,
        nonce: randomnonce,
        codeVerifier: this.codeVerifier,
      })
      this.sub = sub
      return { sub, accessToken: accessToken }
    } catch (e) {
      console.error(e)
      throw new Error('Error retrieving access token via sgid-client')
    }
  }

  /**
   * Fetches the user info via sgid SDK
   *
   * @param {string} accessToken
   * @return {object} { sub: string, data: array }
   */
  async userinfo(accessToken) {
    if (!accessToken) throw Error(`accessToken cannot be empty`)
    try {
      return await this.sgidClient.userinfo({ accessToken, sub: this.sub })
    } catch (e) {
      console.error(e)
      throw new Error('Error retrieving user info via sgid-client')
    }
  }
}

// Initialised the sgidService object with the different environments
const sgidService = {}

Object.keys(config.baseUrls).forEach((env) => {
  // Initialise the sgidService object with the different environments
  sgidService[env] = new SgidService({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    privateKey: process.env.PRIVATE_KEY?.replace(/\\n/gm, '\n'),
    redirectUri: process.env.HOSTNAME + '/callback',
    hostname: config.baseUrls[env],
  })

  // Initialise the sgidService object with the different environments for mobile
  sgidService[env + '-mobile'] = new SgidService({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    privateKey: process.env.PRIVATE_KEY?.replace(/\\n/gm, '\n'),
    redirectUri: process.env.HOSTNAME + '/mobile/callback',
    hostname: config.baseUrls[env],
  })
})

module.exports = {
  sgidService,
  randomnonce,
  scopes,
}
