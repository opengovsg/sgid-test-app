require('dotenv').config()

const PORT = process.env.PORT || 10000

const express = require('express')
const cookieParser = require('cookie-parser')

const auth = require('./routes/mobile')
const home = require('./routes/home')
const callback = require('./routes/callback')
const { csp } = require('./middlewares')

const app = express()

app.use(csp())
app.use(cookieParser())

app.use('/mobile', auth) // mobile use-case
app.use('/assets', express.static('assets'))
app.set('view engine', 'ejs')

app.get('/', home)
app.get('/callback', callback)

app.listen(PORT, () => console.log(`listening on port ${PORT}`))
