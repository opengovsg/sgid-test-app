require('dotenv').config()

// Import the express lirbary
const express = require('express')

// Import the axios library, to make HTTP requests
const cons = require('consolidate')
const axios = require('axios')
const fs = require('fs')
const { JWE, JWK, JWS } = require('node-jose')
const { env } = require('process')
const Sugar = require('sugar')

// This is the client ID and client secret that you obtained
// while registering the application
const environment = process.env.ENVIRONMENT ? process.env.ENVIRONMENT : 'development'
const clientID = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const port = process.env.PORT
const redirect_url = process.env.REDIRECT_URL
const private_key = (environment == 'production') ? process.env.PRIVATE_KEY : fs.readFileSync('./private.pem', 'utf8')

const BASE_URLS = {
  PROD: 'https://api.id.gov.sg',
  MAST: 'https://api-master.id.gov.sg',
  STAG: 'https://api-staging.id.gov.sg',
  DEV: 'https://api-test.id.gov.sg'
}

const demoScopes = {
  default: [
    'openid',
    'name',
    'sex',
    'nationality'
  ],
  hcc: [
    'openid',
    'name',
    'sex',
    'nationality',
    'healthcare_corps_demo.assigned_role',
    'healthcare_corps_demo.mask_type',
    'healthcare_corps_demo.classes_passed'
  ],
  mom: [
    'openid',
    'name',
    'nationality',
    'mom_foreign_workers.gender',
    'mom_foreign_workers.contract_id',
    'mom_foreign_workers.current_employer'
  ]
}

let scopes = encodeURIComponent(demoScopes.default.join(' '))

// Create a new express application and use
// the express static middleware, to serve all files
// inside the public directory
const app = express()
app.use(express.static('public'))
app.engine('html', cons.ejs)
app.set('view engine', 'html')
app.set('views', __dirname + '/src/views')

app.get('/', function (req, res) {
  const demo = req.query.demo || 'default'

  switch (demo) {
    case 'hcc':
      scopes = encodeURIComponent(demoScopes.hcc.join(' '))
      break
    case 'mom':
      scopes = encodeURIComponent(demoScopes.mom.join(' '))
      break
    default:
      scopes = encodeURIComponent(demoScopes.default.join(' '))
      break
  }

  res.render('index', {
    demo,
    redirect_url,
    BASE_URLS,
    clientID,
    scopes
  })
})

app.get('/mom', function (req, res) {
  scopes = encodeURIComponent(demoScopes.mom.join(' '))
  res.render('index', {
    demo: 'mom',
    redirect_url,
    BASE_URLS,
    clientID,
    scopes
  })
})

app.get('/callback', async (req, res) => {
  try {
    // The req.query object has the query params that
    // were sent to this route. We want the `code` param
    const requestToken = req.query.code
    const state = req.query.state
    const baseUrl = BASE_URLS[state]

    const response = await axios({
      // Make a POST request
      method: 'post',
      // to the sgID token API, with the client ID, client secret
      // and request token
      url: `${baseUrl}/v1/oauth/token`,
      data: {
        client_id: clientID,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirect_url + '/callback',
        code: requestToken
      },
      // Set the content type header, so that we get the response in JSON
      headers: {
        accept: 'application/json'
      }
    })

    const access_token = response.data.access_token
    const token_type = response.data.token_type
    const expires_in = response.data.expires_in
    const id_token = response.data.id_token

    const decodedSub = await decodeIdToken(id_token, baseUrl)

    const encrypted_user_response = await axios({
      // Make a POST request
      method: 'get',
      url: `${baseUrl}/v1/oauth/userinfo`,
      // Set the content type header, so that we get the response in JSON
      headers: {
        authorization: `Bearer ${access_token}`
      }
    })
    const { data, key } = encrypted_user_response.data
    let userData = []
    // Decrypt data if not empty
    if (Object.entries(data).length !== 0) {
    // Decrypt key
    const decryptedKey = await decryptJWE(key, private_key, 'pem')
    // Decrypt data
      userData = await decryptData(data, decryptedKey)
    }
    // Add sgID field
    // userData.sub = decodedSub
    res.render('result', {
      data: userData,
      json: JSON.stringify(userData)
    })
  } catch (error) {
    console.log(error)
    res.render('index', {
      demo: 'default',
      redirect_url,
      BASE_URLS,
      clientID,
      scopes
    })
  }
})

async function decodeIdToken (token, baseUrl) {
  // Fetch server public key
  const response = await axios.get(baseUrl + '/v1/oauth/certs')
  // Create JWK
  const publicKey = await JWK.asKey(response.data.keys[0])
  // Decode and verify id token
  const { payload } = await JWS.createVerify(publicKey).verify(token)
  // Parse payload and retrieve sub
  const { sub } = JSON.parse(payload.toString())
  return sub
}

// Decrypt data given data object and JWK
async function decryptData (data, key) {
  const fields = []
  // Loop through fields
  for (const [fieldName, jwe] of Object.entries(data)) {
    // Get source name and field name
    const titleized = Sugar.String(fieldName).titleize().valueOf().split('.')
    let source, header
    if (titleized.length === 1) {
      // Default to myinfo as source name
      source = 'MyInfo'
      header = titleized[0]
    } else {
      [source, header] = titleized
    }
    const result = {
      source,
      header,
      // Decrypt field
      value: await decryptJWE(jwe, key, 'json')
    }
    fields.push(result)
  }
  // Sort by source name
  return fields.sort((a, b) => a.source > b.source ? 1 : -1)
}

// Decrypt JWE given key and keyFormat (json/pem)
async function decryptJWE (jwe, key, keyFormat) {
  try {
    // Import key
    const jwk = await JWK.asKey(key, keyFormat)
    // Decrypt jwe
    const result = await JWE.createDecrypt(jwk).decrypt(jwe)
    // Parse plaintext buffer to string
    return result.plaintext.toString()
  } catch (e) {
    console.error(e)
  }
}

// Start the server on port 8080
app.listen(port)

console.log('listening on port ' + port)
