export const BASE_URLS = {
  prod: 'https://api.id.gov.sg',
  stag: 'https://api-stg.id.gov.sg',
  dev: process.env.OVERRIDE_DEV,
}
export const PORT = process.env.PORT || 10000
export const SCOPES = process.env.SCOPES || 'openid'
export const DEV_AND_STAGING_SCOPES =
  process.env.DEV_AND_STAGING_SCOPES || 'openid'
