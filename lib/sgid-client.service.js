const { SgidClient } = require('@opengovsg/sgid-client')

class SgidService {
  DEFAULT_NONCE = 'randomnonce'

  constructor(baseUrl, clientId, clientSecret, redirectUri, privateKey) {
    this.sgidClient = new SgidClient({
      clientId: clientId,
      clientSecret: clientSecret,
      privateKey: privateKey,
      redirectUri: redirectUri,
      hostname: baseUrl,
    })
    this.redirectUri = redirectUri
  }

  /**
   * Fetches the token via sgid SDK
   *
   * @param {string} code
   * @returns {object} { sub: string, accessToken: string }
   */
  async fetchToken(code) {
    if (!code) throw Error(`code cannot be empty`)

    try {
      const { sub, accessToken } = await this.sgidClient.callback(
        code,
        this.DEFAULT_NONCE,
        this.redirectUri,
      )
      return { sub, accessToken: accessToken }
    } catch (e) {
      console.error(e)
      throw new Error(
        'Error retrieving access token via sgid-client'
      )
    }
  }

  /**
   * Fetches the user info via sgid SDK
   *
   * @param {string} accessToken
   * @return {object} { sub: string, data: array }
   */
  async fetchUserInfo(accessToken) {
    if (!accessToken) throw Error(`accessToken cannot be empty`)

    try {
      return await this.sgidClient.userinfo(accessToken)
    } catch (e) {
      console.error(e)
      throw new Error('Error retrieving user info via sgid-client')
    }
  }
}

module.exports = SgidService
