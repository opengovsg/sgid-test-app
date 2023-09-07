import express from 'express'
import cookieParser from 'cookie-parser'
import { csp } from './middlewares/csp.middleware'
import { PORT } from './config'
import { callback } from './routes/callback'
import { home } from './routes/home'
import { profile } from './routes/profile'

const app = express()

app.use(csp)
app.use(cookieParser())
app.use('/assets', express.static('assets'))
app.set('view engine', 'ejs')

app.get('/', home)
app.get('/callback', callback)
app.get('/profile', profile)

app.listen(PORT, () => console.log(`listening on port ${PORT}`))
