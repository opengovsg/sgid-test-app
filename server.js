require('dotenv').config()

const PORT = process.env.PORT || 10000

const home = require('./scripts/home')
const callback = require('./scripts/callback')
const { csp } = require('./middlewares')

const express = require('express')
const app = express()

app.use(csp())
app.use('/assets', express.static('assets'))
app.set('view engine', 'ejs')

app.get('/', home)
app.get('/callback', callback)

app.listen(PORT, () => console.log(`listening on port ${PORT}`))
