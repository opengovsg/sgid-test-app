const express = require('express')
const uuid = require('uuid')
const router = express.Router()
const {
  sgidService,
  scopes,
  randomnonce,
} = require('../lib/sgid-client.service')

// This is to mimic SPA behaviour
router.get('/session', async (req, res) => {
  const currentSession = uuid.v4()
  res.cookie('sgid-session', currentSession)
  res.status(200).json({ 'sgid-session': currentSession })
})

router.get('/login', async (req, res) => {
  try {
    const { state } = req.query
    const env = state.split(',')[0] || 'prod'
    if (!['dev', 'stag', 'prod'].includes(env)) {
      throw new Error('Invalid environment')
    }
    const authUrl = sgidService[`${env}-mobile`]?.authorizationUrl(
      state,
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
    const env = state?.split(',')[0]
    const session = state?.split(',')[1]
    const { 'sgid-session': sgidSession } = req.cookies

    if (!session && session !== sgidSession) {
      throw new Error('Invalid state')
    }

    const { accessToken } = await sgidService[`${env}-mobile`].callback(
      code,
      randomnonce
    )
    const { sub, data } = await sgidService[`${env}-mobile`].userinfo(
      accessToken
    )
    res.clearCookie('sgid-session')
    return res.status(200).json({ sub, data })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error })
  }
})

module.exports = router
