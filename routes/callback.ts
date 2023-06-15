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
  try {
    const { code, state } = req.query
    const sessionData = nodeCache.get<IAuthSession>(
      req.cookies[SESSION_COOKIE_NAME]
    )

    const { sub, accessToken } = await sgidService[String(state)].callback(
      String(code),
      String(sessionData?.authNonce[String(state)]),
      String(sessionData?.codeVerifier)
    )

    const { data } = await sgidService[String(state)].userinfo(accessToken, sub)
    const formattedData = formatData(data)

    res.render('callback', {
      data: [['sgID', sub], ...formattedData],
    })
  } catch (error) {
    console.error(error)
    res.status(500).render('error', { error })
  }
}
