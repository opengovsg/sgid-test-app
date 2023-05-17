import express from 'express'
import { sgidService } from '../services/sgid-client.service'
import { formatData } from '../utils'
import { RANDOMNONCE } from '../config'
import { nodeCache } from '../services/node-cache.service'

/**
 * Main controller function to generate the callback page
 */
export const callback = async (req: express.Request, res: express.Response) => {
  try {
    const { code, state } = req.query
    const codeVerifier = nodeCache.get(req.cookies.sessionId)

    const { sub, accessToken } = await sgidService[String(state)].callback(
      String(code),
      RANDOMNONCE,
      String(codeVerifier)
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
