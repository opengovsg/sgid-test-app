import express from 'express'
import { sgidService } from '../services/sgid-client.service'
import { formatData, prettifyRuleName } from '../utils'
import { nodeCache } from '../services/node-cache.service'
import { SESSION_COOKIE_NAME } from '../constants'
import { IAuthSession } from '../types'
import { SGID_RULE_NAMES } from '../config'

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

    const { data: userInfoData } = await sgidService[String(state)].userinfo(
      accessToken,
      sub
    )
    const formattedUserInfoData = formatData(userInfoData)

    const clientId = sgidService[String(state)].clientId
    const rulesData = await sgidService[String(state)].rules({
      clientId,
      accessToken,
      ruleNames: SGID_RULE_NAMES,
      userInfoData,
    })
    const formattedRulesData = rulesData.map(data => [prettifyRuleName(data.ruleName), data.output])

    res.render('callback', {
      data: [['sgID', sub], ...formattedUserInfoData, ...formattedRulesData],
    })
  } catch (error) {
    console.error(error)
    res.status(500).render('error', { error })
  }
}
