const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const hostname = process.env.HOSTNAME
const jwkKid = process.env.JWK_KID
const fetch = require('node-fetch')
const jwt = require('jsonwebtoken')
const jwtDecode = require('jwt-decode')
const jwksRsa = require('jwks-rsa')
const { JWK, JWE } = require('node-jose')

async function fetchToken(baseUrl, code) {
  const response = await fetch(`${baseUrl}/v1/oauth/token`, {
    // make a POST request
    method: 'POST',
    cache: 'no-cache',
    // Set the content type header, so that we get the response in JSON
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: hostname + '/callback',
      code,
    }),
  })
  const { access_token, id_token } = await response.json()
  const sub = await decodeIdToken(id_token, baseUrl)
  return { sub, accessToken: access_token }
}

async function fetchUserInfo(baseUrl, accessToken) {
  const response = await fetch(`${baseUrl}/v1/oauth/userinfo`, {
    method: 'GET',
    cache: 'no-cache',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const { sub, key, data } = await response.json()
  let decrypted = []
  if (data && key) {
    decrypted = await decryptData(key, data)
  }
  return { sub, data: decrypted }
}

async function decodeIdToken(token, baseUrl) {
  // TODO verify id_token
  try {
    const client = jwksRsa({
      jwksUri: `${baseUrl}/.well-known/jwks.json`,
    })
    const validSigningKey = await client.getSigningKeyAsync(jwkKid)

    // parse payload and retrieve sub
    const { sub } = jwtDecode(token)
    return sub
  } catch (e) {
    console.error(e)
  }
}

async function decryptData(encKey, block) {
  const result = []
  try {
    // Decrypted encKey to get symmetric key
    const privateKey = await JWK.asKey(process.env.PRIVATE_KEY, 'pem')
    const key = await JWE.createDecrypt(privateKey).decrypt(encKey)

    const decryptedKey = await JWK.asKey(key.plaintext, 'json')
    // Decrypt myinfo data
    for (const [key, value] of Object.entries(block)) {
      const { plaintext } = await JWE.createDecrypt(decryptedKey).decrypt(value)
      result.push([prettifyKey(key), plaintext.toString('ascii')])
    }
    return result
  } catch (e) {
    console.error(e)
  }
}

function prettifyKey(key) {
  let prettified = key.split('.')[1]
  prettified = prettified.replace(/_/g, ' ')
  return prettified.toUpperCase()
}

module.exports = {
  fetchToken,
  fetchUserInfo,
}
