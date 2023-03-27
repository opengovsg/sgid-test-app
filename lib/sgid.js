const fetch = require('node-fetch')
const jwt = require('jsonwebtoken')
const { JWE, JWK, JWS } = require('node-jose')
const sgidClient = require('@opengovsg/sgid-client')

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
async function fetchToken(baseUrl, clientId, clientSecret, redirectUri, code) {
  for (const [key, value] of Object.entries({
    baseUrl,
    clientId,
    clientSecret,
    redirectUri,
    code,
  })) {
    if (!value) throw Error(`${key} cannot be empty`)
  }

  // Currently using direct REST calls, 
  // TODO Call SDK's directly instead
  /*
  const client = new SgidClient({
    clientID: "ROCKLEE-TEST",
    clientSecret: 625d59f58e99b4270dd304bbfec70ee0,
    privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCPipf61dr8+YLl\ne2jXJly89zAS3/BOU3POfK0wrKoi9MBMV9baLuCcNXlQRBwiCN9He+Q3hwmfDXTb\nh+qxMS5ZtMcy8B2u/UQskPbYSwUTiorTvFhHWaiSgjV865AeATOLXS/tf4FvDB8p\ng0R7LTjUbS2Et7va6dKqxCA0CXgN90ylA4XTNOtQ9U/aKMyYC/aDwvwltwXaTkDm\nb4LCWA4DIo5lv/ubGXTZRQh8uyvabocF1ARoUVFjaATUhy9vOOhtS0xN/mbyRrSJ\n/CTQJ0Gix99VCXVOVxI2o0c8Lr3yXP0MhNr8QlaKpIzew3NWojhoPT1lbBakDvmS\nkqunQEhfAgMBAAECggEADVMhYMl8xSWiWlj2gzZn8hC30TpUwLVr5Cio6RvpXuPw\n4x73IZTfCKrI6RCrIRh8WNK649Hj+XRSoaIAQTrRoZLJa3fK9NIRtvNg2FsKcxhv\nlh0yf3+ASW1pHebXuR+4001iV0rFTw1e6fsdODQBkp9tIMtV8HBRPCuHQJCUD1oY\neZvdvH6VUJpMT32K8XKb0qoWoQDN8ChXUuu2fvGy7R0cqH1a/iOJKsG86rpnG5OB\noiUY3IpCP519mlUCitTShLgdmhrFNMhPXidtEKQzh0FPAQc0CCvUjHhHNBYUkXPJ\nrS+aG2cNCQxyzd5jqIgA8QSy1Ab7YihjF4q+kWE1eQKBgQC5se6LEcurNVu6miWK\nhxDG6a2HmKqN/vjD7eAuVDrxqogtY7UIk2SeKSnSjQGO151p7u8/gTc9vD+T0nQO\nUUxCcHePBkfP0SLiLj2Oj5Tv5SuS74SQ3nV7dIgQW2YXl/cuV+Z9TdgKem5AODO3\nsWGRDrt08BPQ2SKHD23umzBjKQKBgQDF4wOi92Tw6hwImWrJBTjSPasBtA0J6rcF\na4dDLvkxWgt19ZloEy0Vz9nZdq6dzHy6CCF8UWcTGT4g54FNq0nNX1aebBnGnkrl\nD2H+eft04y6Rq7Y9prRErXpMdlPAD/o6xo7eSPNIGXUrHMfCy0Kv8yWCQXxEYZ7a\nw25oKs+IRwKBgALPjqzMOCj/RcQtUSQnpzlbkCTdSrebhGhy0VHiNIIz8pu9RqA6\nmutJ9DgbqkpfOSLBWx269vsYPl4ecWNGF8FpsmWX0r5yi/Sgfo4J3ldDQMWYmokW\n1PBpcyXMPF9fDX7GFdcPtpVyBPkz4JSHOtLXRj8e4y3mG3+v3BogfzsBAoGAO3J/\nXS3E/TrXQR4Vnl4bO82a2eAlKp2Abfhnoh8ybUkHuGAXvdRE7xCJ+XJV8sHDln9q\nz9YEiRBEQc5KYfLbMP87HkyLUcer6DQ+1BwBFpRJISncjZjO/vK+ksnZTxF9srqD\noPN5YmeDc3gp6rL1TbZVxlO16TUKa93aBSEXR3ECgYBpE2VekyrIO0T0ZQfZSldL\np7hAQiYIJNimcVbI9XI0HQPaSE0sQzp7ibEP6TZQKP0HyLwrhy3sut7QTEgEONJM\nY36XJWCIDra4thkQkV0nOF3ZZACNSO9b2mR0rsCSegdNMR2GG+VQEDKiR51Ftl5K\nhi4jWSQd6xKEqQ7ZncWRRA==\n-----END PRIVATE KEY-----', // TO be generated
    redirectUri: 'http://localhost:3000/callback',
  })

  // Get Authorization URL
  const {url} = client.authorizationUrl(
    'state',
    ['openid', ]
  )
  */

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

  const body = await response.json()
  if (response.ok) {
    const { access_token, id_token } = body
    const sub = await verifyAndDecodeIdToken(baseUrl, id_token)
    return { sub, accessToken: access_token }
  } else {
    handleResponseError(body)
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
  for (const [key, value] of Object.entries({ baseUrl, accessToken })) {
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

  const body = await response.json()
  if (response.ok) {
    const { sub, key, data } = body

    let decrypted = []
    if (data && key) {
      decrypted = await decryptData(key, data, privateKeyPem)
    } else {
      throw Error('Missing key and/or data in userinfo')
    }
    return { sub, data: decrypted }
  } else {
    handleResponseError(body)
  }
}

/**
 * Verifies the id token from the jwks endpoint
 *
 * @param {string} baseUrl
 * @param {string} token
 * @returns {string}
 */
async function verifyAndDecodeIdToken(baseUrl, token) {
  const response = await fetch(`${baseUrl}/.well-known/jwks.json`, {
    // make a POST request
    method: 'GET',
    cache: 'no-cache',
    // Set the content type header, so that we get the response in JSON
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })

  const body = await response.json()
  if (response.ok) {
    const keystore = await JWK.asKeyStore(body)
    const verified = await JWS.createVerify(keystore).verify(token)
    const decoded = Buffer.from(verified.payload).toJSON()

    return decoded.sub
  } else {
    handleResponseError(body)
  }
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

  // Parse private key
  let privateKey
  try {
    privateKey = await JWK.asKey(privateKeyPem, 'pem')
  } catch (e) {
    throw new Error("Unable to parse client's private key")
  }

  // Decrypted encKey to get symmetric key
  let key
  try {
    key = await JWE.createDecrypt(privateKey).decrypt(encKey)
  } catch (e) {
    throw new Error('Unable to decrypt block key')
  }

  // Parse symmetric key
  let decryptedKey
  try {
    decryptedKey = await JWK.asKey(key.plaintext, 'json')
  } catch (e) {
    throw new Error('Unable to parse decrypted symmetric key')
  }

  // Decrypt myinfo data
  for (const [key, value] of Object.entries(block)) {
    try {
      const { plaintext } = await JWE.createDecrypt(decryptedKey).decrypt(value)
      result[key] = plaintext.toString('ascii')
    } catch (e) {
      throw new Error('Unable to decrypt field')
    }
  }
  return result
}

function handleResponseError(body) {
  throw new Error(
    body.error_description || body.error || body.description || body.code
  )
}

module.exports = {
  decryptData,
  verifyAndDecodeIdToken,
  fetchToken,
  fetchUserInfo,
}
