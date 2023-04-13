const { sgidClient, randomnonce } = require('../lib/sgid-client-singleton')
const { formatData } = require('../lib/utils')

/**
 * Main controller function to generate the callback page
 *
 * @param {*} req
 * @param {*} res
 */
async function index(req, res) {
	try {
		const { code, state } = req.query
		const { accessToken } = await sgidClient[state].callback(code, randomnonce)
		const { sub, data } = await sgidClient[state].userinfo(accessToken)
		const formattedData = formatData(data)

		res.render('callback', {
			data: [['sgID', sub], ...formattedData],
		})
	} catch (error) {
		console.error(error)
		res.status(500).render('error', { error })
	}
}

module.exports = index
