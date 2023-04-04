const fetch = require('node-fetch')
const jwt = require('jsonwebtoken')
const { JWE, JWK, JWS } = require('node-jose')
const { SgidClient } = require('@opengovsg/sgid-client')

class SgidService {

  constructor(baseUrl, clientId, clientSecret, redirectUri) {
    this.sgidClient = new SgidClient({
      clientId: clientId,
      clientSecret: clientSecret,
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDFWHj+oViiRh6D\n1N197ZVTBnSOX/CvzrsEkOM004vPte9Ei+hcR8jhdKL6jQj1hsK+c9gM6BWzmafB\nfmSdi1qYBZl4iM2mIYoB/Xp//nYlCm9ybd9e0LLpKP2mOiDtax8YnULT/MoxcO8J\nIuXcqShegipLbLExC1yRu9GRNA9OGpslk1ynfvZTsrcfAZclWPuYHUenDvWOhP7G\nCK3YZoWpDGC1ohjhYxSNSMdPNYFV8Kz1kDDE54jZfI3FmzcyOk31lZcpAcC//mYi\ncHvACl8Dz0bHvbqLIpXiPJMBfmmx0j5OH0kTk7mtA8FCZgZtCbiB8FFVbZ4SZtyO\nfvsCeCWVAgMBAAECggEAVvqQkYHhg9wt1OL8IGWXm/lLY/kLJyGRsgh966mVhJ3m\ncCrN5eZJtnzm3FFO8pBLww9h2QZtkjQWCSVBCWMDMd+97a82HJPJtOjYlhM8VUUN\nK70bZznKsRM9AIe8PYgqM3oUm0RehX4GDNvRvfjcbxMluwqT6k7cpOrIChyM5lny\n31VMbOXIYOOTuL6cTcMyaMPEoGy/5TRTZmeA7IGKxqdSj7/mOmjnw4cwq/SpdyFM\nPq4pIBR3XYtB1QFMCJ8ccwP6mUB3nmwnMsojsHAfhAG7Nu73SMHFBfupF99DGyfP\n4xQiVTROLquKiAwx2HugPUS6kHWKv+7OJO9Ih1DlHQKBgQDz1lnXQ14gBFBPUT+z\nUZ4BJd3RKyS6RGOO75FncEGzVQEVr6YqCfvtNhrxHfRxfd7i5I3awPmXVvUqAA9u\nhebPs4A2UXK78L1/v9B0yQvmDshJkcsDalWVTFRqk0hYFUL38PcnjNC0rX2R2rGa\nGzi1FLEaezWjVWdULGsABqPUiwKBgQDPMHOnYwcGw/uedRUy/pqVYEOLikl3uZYb\n/6troVS2mpu6IoJYaVps3WWLydmGEx+8ZnpLd3Dps6P+y9Zhkt8ANhRfEUNpdvA8\nFp/K41sbLe7GL1yLFTLxgN6abVbqDbFy/Rx0gVLCv9tT4P5iMT3iuWVTU6McPDV6\nwSmZ8v+SXwKBgQCoz7GLMnyrtdDT2PA8+ThmmwyijzfyLP6wKnOEJVeXDDagCOcF\nG7xqUZb9bzuYhwgUFR+QXyFtASriVQBaCCHvkdolwOWp79WB6A4tjDLMp1dKd8ER\nMEDoB9w5nJXtRWsDtLOnkfm73JCetcVXZ5ku5JBoQPy1g57xy36YmgA6WQKBgQCc\ny+EqsxG1OAorMBY8AlyAYVqctqnE1olYZROYn35ZtwXVRpp4SDqrmp1nvflFsyFY\nVgGFLT4hTtb0U9TJAPqM0WB3Vbw7i0xhXQnO5GKlXgyOpXcWtpNYGxvbqJWXCYfa\nKt0m+lvkkIduoh5Bt1xLQd0Bw5D0JEigvqA6JqDtZwKBgQDH3Tq0bLbbLYPh4UOH\nK7jPE9S49dteWrQ+Lsu6MJFm/HA6+Qmhs4IEyGROUec/fM4XXY6iRh0uqoEwdQay\nDnoEiQipt44MNFCrF+Oa8jbetaCKf5pWbJMXbMalWZoeK1RIOwZ73EuuLZrINA/Y\nLp9nzJlNOa6DtROsuYz7vUsP/g==\n-----END PRIVATE KEY-----",
      redirectUri: redirectUri,
      hostname: baseUrl,
    })
    this.redirectUri = redirectUri
  }

  /**
   * Fetches the token from the oauth endpoint
   *
   * @param {string} baseUrl
   * @param {string} code
   * @param {string} hostname
   * @param {string} clientId
   * @param {string} clientSecret
   *
   * @returns {object} { accessToken }
   */
  async fetchToken(code) {
    if (!code) throw Error(`code cannot be empty`)

    const { url } = this.sgidClient.authorizationUrl(
      "dev",
      ["myinfo"],
      "randomnonce",
    )
    console.log("(Sanity check) auth url= ", url)

    // Token request
    const { sub, accessToken } = await this.sgidClient.callback(
      code,
      'randomnonce',
      this.redirectUri,
    )
    return { sub, accessToken: accessToken }
  }

  /**
   * Fetches the user info
   *
   * @param {string} baseUrl
   * @param {string} accessToken
   * @param {string} privateKeyPem in pem format
   * @return {object} { sub: string, data: array }
   */
  async fetchUserInfo(baseUrl, accessToken, privateKeyPem) {
    for (const [key, value] of Object.entries({ baseUrl, accessToken })) {
      if (!value) throw Error(`${key} cannot be empty`)
    }
    
    const { sub, data } = await this.sgidClient.userinfo(accessToken)
    return { sub, data}
  }
}

module.exports = SgidService
