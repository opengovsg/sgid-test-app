const { SgidClient } = require('@opengovsg/sgid-client')
const config = require('../lib/config')

const randomnonce = 'randomnonce'
const scopes = process.env.SCOPES

// Initialised the sgidClient object with the different environments
const sgidClient = {}
for (const [env, baseurl] of Object.entries(config.baseUrls)) {
	sgidClient[env] = new SgidClient({
		clientId: process.env.CLIENT_ID,
		clientSecret: process.env.CLIENT_SECRET,
		privateKey: process.env.PRIVATE_KEY,
		redirectUri: process.env.HOSTNAME + '/callback',
		hostname: baseurl,
	  })
}

module.exports = {
	sgidClient,
	randomnonce,
	scopes
}