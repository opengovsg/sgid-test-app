const BASE_URLS = {
  prod: 'https://api.id.gov.sg',
  stag: 'https://api-stg.id.gov.sg',
  dev: process.env.OVERRIDE_DEV || 'http://localhost:3000',
}
const PORT = process.env.PORT || 10000
const RANDOMNONCE = 'randomnonce'
const SCOPES = process.env.SCOPES || 'openid'

export { BASE_URLS, PORT, RANDOMNONCE, SCOPES }
