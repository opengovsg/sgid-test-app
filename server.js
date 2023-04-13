require('dotenv').config()

const PORT = process.env.PORT || 10000

const express = require('express')
const useragent = require('express-useragent')

const auth = require('./routes/auth')
const home = require('./scripts/home')
const { csp } = require('./middlewares')

const app = express()

app.use(useragent.express())
app.use(csp())

app.use(auth)
app.use('/assets', express.static('assets'))
app.set('view engine', 'ejs')

app.get('/', home)

app.listen(PORT, () => console.log(`listening on port ${PORT}`))
