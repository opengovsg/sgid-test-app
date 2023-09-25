import SgidClient, {
  RulesParams,
  RulesReturn,
} from '@opengovsg/sgid-client'
import { BASE_URLS } from '../config'

interface SgidServiceOption {
  clientId: string
  clientSecret: string
  privateKey: string
  redirectUri: string
  hostname: string
  rulesEngineEndpoint: string | undefined
}

class SgidService {
  private sgidClient: SgidClient
  clientId: string

  constructor({
    clientId,
    clientSecret,
    privateKey,
    redirectUri,
    hostname,
    rulesEngineEndpoint
  }: SgidServiceOption) {
    this.sgidClient = new SgidClient({
      clientId: clientId,
      clientSecret: clientSecret,
      privateKey: privateKey,
      redirectUri: redirectUri,
      hostname: hostname,
      rulesEngineEndpoint: rulesEngineEndpoint
    })
    this.clientId = clientId
  }

  /**
   * Fetches the url via sgid SDK
   */
  authorizationUrl(
    env: string,
    scopes: string | string[],
    codeChallenge: string
  ): { url: string; nonce?: string } {
    if (!env || !scopes) throw Error(`env, scopes cannot be empty`)
    try {
      const { url, nonce } = this.sgidClient.authorizationUrl({
        state: env,
        scope: scopes,
        codeChallenge,
      })
      return { url, nonce }
    } catch (e) {
      console.error(e)
      throw new Error('Error retrieving url via sgid-client')
    }
  }

  /**
   * Fetches the token via sgid SDK
   */
  async callback(code: string, nonce: string, codeVerifier: string) {
    if (!code) throw Error(`code cannot be empty`)
    try {
      const { sub, accessToken } = await this.sgidClient.callback({
        code,
        nonce,
        codeVerifier,
      })
      return { sub, accessToken: accessToken }
    } catch (e) {
      console.error(e)
      throw new Error('Error retrieving access token via sgid-client')
    }
  }

  /**
   * Fetches the user info via sgid SDK
   */
  async userinfo(accessToken: string, sub: string) {
    if (!accessToken) throw Error(`accessToken cannot be empty`)
    try {
      return await this.sgidClient.userinfo({ accessToken, sub })
    } catch (e) {
      console.error(e)
      throw new Error('Error retrieving user info via sgid-client')
    }
  }

  async rules(rulesParams: RulesParams): Promise<RulesReturn> {
    const { accessToken, ruleIds, userInfoData } = rulesParams

    if (!accessToken) throw new Error(`accessToken cannot be empty`)
    if (!ruleIds) throw new Error(`ruleIds cannot be empty`)
    if (!userInfoData) throw new Error(`userInfoData cannot be empty`)

    try {
      const data = await this.sgidClient.rules(rulesParams)
      return data
    } catch (e) {
      console.error(e)
      throw new Error('Error retrieving rule-based fields')
    }
  }
}

// Initialised the sgidService object with the different environments
export const sgidService: { [index: string]: SgidService } = {}

Object.keys(BASE_URLS).forEach((env) => {
  // Initialise the sgidService object with the different environments
  sgidService[env] = new SgidService({
    clientId: process.env.CLIENT_ID as string,
    clientSecret: process.env.CLIENT_SECRET as string,
    privateKey: process.env.PRIVATE_KEY as string,
    redirectUri: process.env.HOSTNAME + '/callback',
    hostname: BASE_URLS[env as keyof typeof BASE_URLS] as string,
    rulesEngineEndpoint: env === 'dev' ? process.env.RULES_ENGINE_DEV_ENDPOINT : undefined
  })
})
