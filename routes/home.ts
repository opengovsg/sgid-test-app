import express from 'express'
import { v4 as uuidV4 } from 'uuid'
import { BASE_URLS, SCOPES, DEV_AND_STAGING_SCOPES } from '../config'
import { generatePkcePair } from '@opengovsg/sgid-client'
import { sgidService } from '../services/sgid-client.service'
import { nodeCache } from '../services/node-cache.service'
import { SESSION_COOKIE_NAME } from '../constants'
import { IAuthSession } from '../types'

/**
 * Main controller function to generate the home page
 */
export const home = (req: express.Request, res: express.Response) => {
  const sessionId = uuidV4()

  const { codeChallenge, codeVerifier } = generatePkcePair()

  const authUrl: { [index: string]: string } = {}
  const authNonce: { [index: string]: string } = {}
  Object.entries(BASE_URLS).forEach(([env, value]) => {
    if (value) {
      const { url, nonce } = sgidService[env].authorizationUrl(
        env,
        env === 'prod' ? SCOPES : DEV_AND_STAGING_SCOPES,
        codeChallenge
      )
      if (env.includes('passkey')) {
        authUrl[env] = url?.replace('/v2/oauth/', '/v2/oauth/passkey/')
      } else {
        authUrl[env] = url
      }
      if (nonce) {
        authNonce[env] = nonce
      }
    }
  })

  nodeCache.set<IAuthSession>(sessionId, { codeVerifier, authNonce })

  res.cookie(SESSION_COOKIE_NAME, sessionId, { httpOnly: true })
  res.render('index', { authUrl })
}
