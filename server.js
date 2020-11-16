require('dotenv').config()

const scopes = process.env.SCOPES
const clientId = process.env.CLIENT_ID
const hostname = process.env.HOSTNAME
const PORT = process.env.PORT || 10000
const overrideDev = process.env.OVERRIDE_DEV

const { fetchToken, fetchUserInfo } = require('./scripts/callback')

const BASE_URLS = {
  prod: 'https://api.id.gov.sg',
  stag: 'https://api-stg.id.gov.sg',
  dev: overrideDev || 'https://api-dev.id.gov.sg',
}

const express = require('express')
const app = express()

app.use('/assets', express.static('assets'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  const authUrl = {}
  for (const [env, baseurl] of Object.entries(BASE_URLS)) {
    authUrl[
      env
    ] = `${baseurl}/v1/oauth/authorize?response_type=code&purpose=For%20testing%20purposes&client_id=${clientId}&scope=${scopes}&redirect_uri=${hostname}/callback&nonce=randomnonce&state=${env}`
  }

  res.render('index', { authUrl })
})

app.get('/callback', async (req, res) => {
  const { code, state } = req.query
  console.log({ code, state })
  const baseurl = BASE_URLS[state]

  const { accessToken } = await fetchToken(baseurl, code)
  const { sub, data } = await fetchUserInfo(baseurl, accessToken)
  res.render('callback', {
    data: [['sgID', sub], ...data],
  })
})

app.listen(PORT, () => console.log(`listening on port ${PORT}`))
