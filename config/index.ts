export const BASE_URLS = {
  prod: 'https://api.id.gov.sg',
  stag: 'https://api-stg.id.gov.sg',
  dev: process.env.OVERRIDE_DEV || 'http://localhost:3000',
}
export const PORT = process.env.PORT || 10000
export const SCOPES = process.env.SCOPES || 'openid'
