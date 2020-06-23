require('dotenv').config()

// Import the express lirbary
const express = require('express')

// Import the axios library, to make HTTP requests
const cons = require('consolidate')
const axios = require('axios')
const crypto = require('crypto')
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

const scopes =  encodeURIComponent([
  'openid',
  'myinfo.name',
  'myinfo.sex',
  'myinfo.race',
  'myinfo.nationality',
  'healthcare_corps_demo.assigned_role',
  'healthcare_corps_demo.mask_type',
  'healthcare_corps_demo.classes_passed',
].join(' '))

// Create a new express application and use
// the express static middleware, to serve all files
// inside the public directory
const app = express()
app.engine('html', cons.mustache)
app.set('view engine', 'html')
app.set('views', __dirname + '/src/views')

app.get('/', function (req, res) {
  res.render('index', {
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
      // make a POST request
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
      // Set the content type header, so that we get the response in JSOn
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
      // make a POST request
      method: 'get',
      url: `${baseUrl}/v1/oauth/userinfo`,
      // Set the content type header, so that we get the response in JSOn
      headers: {
        authorization: `Bearer ${access_token}`
      }
    })
    const { encrypted_payload, verification_keys } = encrypted_user_response.data
    // Decrypt data
    const decrypted = await decryptJWE(encrypted_payload, private_key)
    // Check signatures
    const userData = verifyData(decrypted, verification_keys)
    // Add sgID field
    userData.sub = decodedSub
    userData.json = JSON.stringify(userData)
    res.render('result', userData)
  } catch (error) {
    console.log(error)
    res.render('index', {
      redirect_url,
      BASE_URLS,
      clientID,
      scopes
    })
  }
})

async function decryptJWE (encryptedPayload, privateKey) {
  try {
    // import privateKey as a jwk
    const key = await JWK.asKey(privateKey, 'pem')
    // decrypt jwe
    const result = await JWE.createDecrypt(key).decrypt(encryptedPayload)
    // parse plaintext buffer to string then to JSON
    return JSON.parse(result.plaintext.toString())
  } catch (e) {
    console.error(e)
  }
}

async function decodeIdToken (token, baseUrl) {
  // fetch server public key
  const response = await axios.get(baseUrl + '/v1/oauth/certs')
  // create JWK
  const publicKey = await JWK.asKey(response.data.keys[0])
  // decode and verify id token
  const { payload } = await JWS.createVerify(publicKey).verify(token)
  // parse payload and retrieve sub
  const { sub } = JSON.parse(payload.toString())
  return sub
}

// Verify signatures of all data sources and return data and verification status
function verifyData (data, keys) {
  const result = {}
  for (const [sourceName, key] of Object.entries(keys)) {
    result[sourceName] = verifyDataSource(data[sourceName], key)
  }
  return result
}

// Verify signatures of a data source with public block key
function verifyDataSource (data, key) {
  const fields = {} // Stores fields and verification status
  // Loop through fields
  for (const [fieldName, field] of Object.entries(data)) {
    fields[fieldName] = {
      header: Sugar.String(fieldName).titleize().valueOf(),
      value: field.value
    }

    try {
      // Verify signature
      const isValid = verifyFieldSignature(fieldName, field, key)
      fields[fieldName].verified = isValid
    } catch {
      fields[fieldName].verified = false
    }
  }
  return fields
}

// Verify signature of a field object { value, signature }
function verifyFieldSignature (name, field, publicKey) {
  const stringToVerify = JSON.stringify({ [name]: field.value })
  return verifyStringSignature(stringToVerify, publicKey, field.signature)
}

// Verify string with signature
function verifyStringSignature (data, publicKey, signature) {
  const verify = crypto.createVerify('sha256').update(data).end()
  return verify.verify(publicKey, signature, 'base64')
}

// Start the server on port 8080
app.listen(port)

console.log('listening on port ' + port)
