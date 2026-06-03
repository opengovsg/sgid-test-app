import express from 'express'
import { sgidService } from '../services/sgid-client.service'
import { formatData } from '../utils'
import { nodeCache } from '../services/node-cache.service'
import { SESSION_COOKIE_NAME } from '../constants'
import { IAuthSession } from '../types'

/**
 * Main controller function to generate the callback page
 */
export const callback = async (req: express.Request, res: express.Response) => {
  const { code, state } = req.query

  // Validate client-supplied input up-front. Malformed callbacks (scanners,
  // expired links, a `state` that maps to no configured environment) are
  // client errors, so return 400 rather than letting them surface as a 500 —
  // a 500 implies a server fault and inflates the Elastic Beanstalk 5xx
  // metric for what is really bad input.
  if (typeof code !== 'string' || typeof state !== 'string') {
    return res.status(400).render('error', {
      error: new Error('Missing or invalid `code`/`state` query parameters.'),
    })
  }

  const service = sgidService[state]
  if (!service) {
    return res.status(400).render('error', {
      error: new Error(`Unknown sgID environment: ${state}`),
    })
  }

  const sessionData = nodeCache.get<IAuthSession>(
    req.cookies[SESSION_COOKIE_NAME]
  )
  if (!sessionData) {
    return res.status(400).render('error', {
      error: new Error('Session expired or missing. Please restart login.'),
    })
  }

  try {
    const { sub, accessToken } = await service.callback(
      code,
      String(sessionData.authNonce[state]),
      String(sessionData.codeVerifier)
    )

    const { data } = await service.userinfo(accessToken, sub)
    const formattedData = formatData(data)

    res.render('callback', {
      data: [['sgID', sub], ...formattedData],
    })
  } catch (error) {
    console.error(error)
    res.status(500).render('error', { error })
  }
}
