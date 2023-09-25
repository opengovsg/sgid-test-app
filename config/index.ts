export const BASE_URLS = {
  prod: 'https://api.id.gov.sg',
  stag: 'https://api-stg.id.gov.sg',
  dev: process.env.OVERRIDE_DEV,
  passkeyProd: 'https://api.id.gov.sg',
  passkeyStaging: 'https://api-stg.id.gov.sg',
  passkeyDev: process.env.OVERRIDE_DEV,
}
export const PORT = process.env.PORT || 10000
export const SCOPES = process.env.SCOPES || 'openid'
export const DEV_AND_STAGING_SCOPES =
  process.env.DEV_AND_STAGING_SCOPES || 'openid'
export const SGID_RULE_IDS = process.env.SGID_RULE_IDS || ''
