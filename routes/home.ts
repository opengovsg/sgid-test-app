import express from 'express'
import { v4 as uuidV4 } from 'uuid'
import { BASE_URLS, RANDOMNONCE, SCOPES } from '../config'
import { generatePkcePair } from '@opengovsg/sgid-client'
import { sgidService } from '../services/sgid-client.service'
import { nodeCache } from '../services/node-cache.service'
import { SESSION_COOKIE_NAME } from '../constants'

/**
 * Main controller function to generate the home page
 */
export const home = (req: express.Request, res: express.Response) => {
  const sessionId = uuidV4()

  const { codeChallenge, codeVerifier } = generatePkcePair()
  nodeCache.set(sessionId, codeVerifier)

  const authUrl: { [index: string]: string } = {}
  Object.keys(BASE_URLS).forEach((env) => {
    authUrl[env] = sgidService[env].authorizationUrl(
      env,
      SCOPES,
      RANDOMNONCE,
      codeChallenge
    ).url
  })

  res.cookie(SESSION_COOKIE_NAME, sessionId, { httpOnly: true })
  res.render('index', { authUrl })
}
