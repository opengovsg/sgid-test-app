const express = require('express')
const router = express.Router()
const {
  sgidService,
  scopes,
  randomnonce,
} = require('../lib/sgid-client.service')
const { formatData } = require('../lib/utils')

router.get('/login/:env?', async (req, res) => {
  try {
    const env = req.params.env || 'prod'
    if (!['dev', 'stag', 'prod'].includes(env)) {
      throw new Error('Invalid environment')
    }
    const authUrl = sgidService[`${env}-mobile`]?.authorizationUrl(
      env,
      scopes,
      randomnonce
    ).url
    res.redirect(authUrl)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error })
  }
})

router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query
    const { accessToken } = await sgidService[`${state}-mobile`].callback(
      code,
      randomnonce
    )
    const { sub, data } = await sgidService[`${state}-mobile`].userinfo(
      accessToken
    )
    const encodedSub = Buffer.from(JSON.stringify(sub)).toString('base64')
    const encodedData = Buffer.from(JSON.stringify(formatData(data))).toString(
      'base64'
    )

    // Native app redirection can be done by accessing appScheme://
    // Since app is published through Expo, the appScheme is exp:// with queryParams channel-name and runtime-version required
    return res.redirect(
      `${process.env.MOBILE_APP_BUNDLE_ID}callback?userInfo=${encodedData}&sub=${encodedSub}&channel-name=main&runtime-version=exposdk:48.0.0`
    )
  } catch (error) {
    console.error(error)
    res.status(500).json({ error })
  }
})

module.exports = router
