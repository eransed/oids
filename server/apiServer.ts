//API Setup
import http from 'http'
import express from 'express'
import type { Express } from 'express'
import morgan from 'morgan'
import routes from './api/routes/routes'
import cors from 'cors'
import { good, log } from 'mathil'
import session from 'express-session'
import passport from 'passport'
import { useGoogleStrategy } from './api/auth/passport.config'

export const apiServer = () => {
  const router: Express = express()

  /** Routes */

  const useGoogleAuth = false

  if (useGoogleAuth) {

    router.use(
      session({
        secret: process.env.SESSION_SECRET || '',
        resave: false,
        saveUninitialized: true,
      })
    )

    useGoogleStrategy()
    router.use(passport.initialize())
    router.use(passport.session())
  }

  router.use(cors())

  /** Logging */
  router.use(morgan('dev'))
  /** Parse the request */
  router.use(express.urlencoded({ extended: false }))
  /** Takes care of JSON data */
  router.use(express.json())

  router.use((req, res, next) => {
    // set the CORS policy
    res.header('Access-Control-Allow-Origin', '*')
    // set the CORS headers
    res.header('Access-Control-Allow-Headers', 'Origin, X-Api-Key, X-Requested-With,Content-Type,Accept, Authorization')

    // set the CORS method headers
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST OPTIONS')
      return res.status(200).json({})
    }
    next()
  })

  router.use('/api/v1', routes)
  /** Error handling */
  router.use((req, res, next) => {
    const error = new Error('not found')
    return res.status(404).json({
      message: error.message,
    })
  })

  /** Server */
  const httpServer = http.createServer(router)
  const PORT: string | number = process.env.PORT ?? 6060
  httpServer.listen(PORT, () => good(`API server is running on port ${PORT}`))
}
