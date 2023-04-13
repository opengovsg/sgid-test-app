const overrideDev = process.env.OVERRIDE_DEV
const baseUrls = {
  prod: 'https://api.id.gov.sg',
  stag: 'https://api-stg.id.gov.sg',
  dev: overrideDev,
}

module.exports = {
  baseUrls,
}
