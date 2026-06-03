import express, { Express } from 'express'
import cookieParser from 'cookie-parser'
import { csp } from './middlewares/csp.middleware'
import { callback } from './routes/callback'
import { home } from './routes/home'
import { profile } from './routes/profile'
import { healthz } from './routes/healthz'

export const createApp = (): Express => {
  const app = express()

  app.use(csp)
  app.use(cookieParser())
  app.use('/assets', express.static('assets'))
  app.set('view engine', 'ejs')

  // Health probe — registered first so it stays cheap and dependency-free.
  app.get('/healthz', healthz)

  // Browsers (and some tools) request /favicon.ico at the root; serve the
  // existing asset so it returns 200 instead of a 404 that pollutes the
  // Elastic Beanstalk 4xx health metric.
  app.get('/favicon.ico', (_req, res) => {
    res.sendFile('favicon.png', { root: 'assets' })
  })

  app.get('/', home)
  app.get('/callback', callback)
  app.get('/profile', profile)

  return app
}
