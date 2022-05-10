const SgidClient = require('@opengovsg/sgid-client').default

const { baseUrls } = require('./config')

const clients = {}
for (const env in baseUrls) {
  if (baseUrls[env]) {
    clients[env] = new SgidClient({
      hostname: baseUrls[env],
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      privateKey: process.env.PRIVATE_KEY,
      redirectUri: `${process.env.HOSTNAME}/callback`,
    })
  }
}

module.exports = {
  clients,
}
