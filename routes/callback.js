const { sgidService, randomnonce } = require('../lib/sgid-client.service')
const { formatData } = require('../lib/utils')

/**
 * Main controller function to generate the callback page
 *
 * @param {*} req
 * @param {*} res
 */
async function home(req, res) {
  try {
    const { code, state } = req.query
    const { accessToken } = await sgidService[state].callback(code, randomnonce)
    const { sub, data } = await sgidService[state].userinfo(accessToken)
    const formattedData = formatData(data)

    res.render('callback', {
      data: [['sgID', sub], ...formattedData],
    })
  } catch (error) {
    console.error(error)
    res.status(500).render('error', { error })
  }
}

module.exports = home
