import express, { Express } from 'express'
import cookieParser from 'cookie-parser'
import { csp } from './middlewares/csp.middleware'
import { callback } from './routes/callback'
import { home } from './routes/home'
import { profile } from './routes/profile'

export const createApp = (): Express => {
  const app = express()

  app.use(csp)
  app.use(cookieParser())
  app.use('/assets', express.static('assets'))
  app.set('view engine', 'ejs')

  app.get('/', home)
  app.get('/callback', callback)
  app.get('/profile', profile)

  return app
}
