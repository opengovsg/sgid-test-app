const fetch = require('node-fetch')
const jwt = require('jsonwebtoken')
const jwksRsa = require('jwks-rsa')
const { JWE, JWK } = require('node-jose')

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
async function fetchToken(
  baseUrl,
  clientId,
  clientSecret,
  redirectUri,
  code,
  kid,
) {
  for(const [key, value] of Object.entries({ baseUrl, clientId, clientSecret, redirectUri, code, kid })) {
    if (!value) throw Error(`${key} cannot be empty`)
  }

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
      redirect_uri: redirectUri,
      code,
      grant_type: 'authorization_code',
    }),
  })

  if (response.ok) {
    const { access_token, id_token } = await response.json()
    const sub = await verifyAndDecodeIdToken(baseUrl, id_token, kid)
    
    return { sub, accessToken: access_token }
  } else {
    const error = await response.json()
    throw Error(error.error_description)
  }
}

/**
 * Fetches the user info
 * 
 * @param {string} baseUrl 
 * @param {string} accessToken 
 * @param {string} privateKeyPem in pem format
 * @return {object} { sub: string, data: array }
 */
async function fetchUserInfo(baseUrl, accessToken, privateKeyPem) {
  for(const [key, value] of Object.entries({ baseUrl, accessToken })) {
    if (!value) throw Error(`${key} cannot be empty`)
  }

  const response = await fetch(`${baseUrl}/v1/oauth/userinfo`, {
    method: 'GET',
    cache: 'no-cache',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  
  if (response.ok) {
    const { sub, key, data } = await response.json()
    let decrypted = []
    if (data && key) {
      decrypted = await decryptData(key, data, privateKeyPem)
    } else {
      throw Error('Invalid key and/or data in userinfo')
    }
    return { sub, data: decrypted }
  } else {
    const error = await response.json()
    throw Error(error.error_description)
  }
}

/**
 * Verifies the id token
 * 
 * @param {string} baseUrl
 * @param {string} token
 * @param {string} kid id of the token in the jwk
 * @returns {string}
 */
async function verifyAndDecodeIdToken(baseUrl, token, kid) {
  const client = jwksRsa({
    jwksUri: `${baseUrl}/.well-known/jwks.json`,
  })
  const jwks = await client.getSigningKeyAsync(kid)
  const result = jwt.verify(token, jwks.getPublicKey())
  
  return result
}

/**
 * Decrypts the block into an object of
 * plaintext key-value pairs
 * 
 * @param {string} encKey 
 * @param {array} block 
 * @param {string} privateKeyPem in pem format
 * @returns {object}
 */
async function decryptData(encKey, block, privateKeyPem) {
  const result = {}
  
  // Decrypted encKey to get symmetric key
  const privateKey =await JWK.asKey(privateKeyPem, 'pem')
  const key = await JWE.createDecrypt(privateKey)
                        .decrypt(encKey)

  const decryptedKey = await JWK.asKey(key.plaintext, 'json')
  // Decrypt myinfo data
  for (const [key, value] of Object.entries(block)) {
    const { plaintext } = await JWE.createDecrypt(decryptedKey).decrypt(value)
    result[key] = plaintext.toString('ascii')
  }
  return result
}

module.exports = {
  decryptData,
  verifyAndDecodeIdToken,
  fetchToken,
  fetchUserInfo,
}
