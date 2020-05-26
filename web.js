require('dotenv').config()

// Import the express lirbary
const express = require('express')

// Import the axios library, to make HTTP requests
const cons = require('consolidate')
const axios = require('axios')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const { JWE, JWK, JWS } = require('node-jose')

// This is the client ID and client secret that you obtained
// while registering the application
const environment = process.env.ENVIRONMENT ? process.env.ENVIRONMENT : 'development'
const clientID = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const port = process.env.PORT
const redirect_url = (environment == 'production') ? process.env.REDIRECT_URL : process.env.REDIRECT_URL
const private_key = (environment == 'production') ? process.env.PRIVATE_KEY : fs.readFileSync('./private.pem', 'utf8')

const BASE_URLS = {
  PROD: 'https://api.id.gov.sg',
  MAST: 'https://api-master.id.gov.sg',
  STAG: 'https://api-staging.id.gov.sg',
  DEV: 'https://api-test.id.gov.sg'
}

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
    clientID
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
      // to the Github authentication API, with the client ID, client secret
      // and access token
      url: `${baseUrl}/v1/oauth/userinfo`,
      // Set the content type header, so that we get the response in JSOn
      headers: {
        authorization: `Bearer ${access_token}`
      }
    })

    const { encrypted_payload, verification_key } = encrypted_user_response.data
    const decrypted = await decryptJWE(encrypted_payload, private_key)
    verifySignatures(verification_key, decrypted)
    // redirect the user to the welcome page, along with the access token
    // res.send({ sub ,decrypted})
    // res.render('sample', {"name": "Sherlynn"})
    decrypted.sub = decodedSub
    res.render('result', decrypted)
    // res.redirect(`/welcome.html?decrypted=${JSON.stringify(decrypted)}`)
  } catch (error) {
    console.log(error)
    res.render('index', {
      redirect_url,
      BASE_URLS,
      clientID
    })
  }
})

function aesRsaDecrypt (encrypted_payload, private_key) {
  const OUTPUT_ENCODING = 'base64'
  const SOURCE_ENCODING = 'utf8'
  const AES_ALGORITHM = 'aes-128-ctr'
  const { iv, encrypted, key } = JSON.parse(encrypted_payload)
  const decryptedKey = crypto.privateDecrypt(private_key, Buffer.from(key, OUTPUT_ENCODING))
  const decipher = crypto.createDecipheriv(AES_ALGORITHM, Buffer.from(decryptedKey, OUTPUT_ENCODING), Buffer.from(iv, OUTPUT_ENCODING))
  let decrypted = decipher.update(encrypted, OUTPUT_ENCODING, SOURCE_ENCODING)
  decrypted += decipher.final(SOURCE_ENCODING)
  return JSON.parse(decrypted)
}

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

function verifySignatures (userPublicKey, decrypted) {
  for (const fieldKey in decrypted) {
    const { value, signature } = decrypted[fieldKey]
    const verify = crypto.createVerify('SHA256').update(JSON.stringify({ [fieldKey]: value })).end()
    decrypted[fieldKey].verified = verify.verify(userPublicKey, signature, 'hex')
  }
}

// Start the server on port 8080
app.listen(port)

console.log('listening on port ' + port)
