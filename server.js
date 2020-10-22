require('dotenv').config()

const scopes = process.env.SCOPES
const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const hostname = process.env.HOSTNAME
const { fetchToken, fetchUserInfo } = require('./scripts/callback')

const BASE_URLS = {
  prod: 'https://api.id.gov.sg',
  stag: 'https://api-staging.id.gov.sg',
  dev: 'http://localhost:3000',
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

  console.log(authUrl)

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

app.listen(10000, () => console.log('Example app listening on port 10000!'))
