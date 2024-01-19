import passport, { DoneCallback } from 'passport'
import passportGoogle from 'passport-google-oauth20'

// import { User } from '../models/user.model'
import { createUser, findUserByEmail } from '../users/users.services'
import { createNewUser } from '../utils/factory'
import { env } from 'process'

const GoogleStrategy = passportGoogle.Strategy

export function useGoogleStrategy() {
  passport.use(
    new GoogleStrategy(
      {
        // clientID: '412167345851-4u0jgknloie16nmqj73lvc66ocuk58ld.apps.googleusercontent.com',
        clientID: env.GOOGLE_CLIENT_ID || '',
        clientSecret: env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: 'http://localhost:6060/api/v1/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          if (!profile._json.email) throw 'User does not have email'
          if (!profile._json.name) throw 'User does not have a name'

          let user = await findUserByEmail(profile._json.email)

          if (user) {
            done(null, user)
          } else {
            user = await createUser(createNewUser(profile._json.email, profile._json.name, ''))
            done(null, user)
          }
        } catch (err) {
          console.error(err)
          done()
        }
      }
    )
  )

  passport.serializeUser(function (user: Express.User, done) {
    done(null, user)
  })

  passport.deserializeUser(function (user: Express.User, done) {
    done(null, user)
  })
}
