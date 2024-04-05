import passport, { DoneCallback } from 'passport'
import passportGoogle from 'passport-google-oauth20'

// import { User } from '../models/user.model'
import { createUser, findUserByEmail } from '../users/users.services'
import { createNewUser } from '../utils/factory'
import { env } from 'process'

const GoogleStrategy = passportGoogle.Strategy

interface googleUser {
  email: string
  id: string
}

export function useGoogleStrategy() {
  const clientID = env.GOOGLE_CLIENT_ID
  const clientSecret = env.GOOGLE_CLIENT_SECRET

  if (!clientID || !clientSecret) {
    throw new Error('Google Client ID not found')
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: 'http://localhost:6060/api/v1/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          if (!profile._json.email) throw 'User does not have email'
          if (!profile._json.given_name) throw 'User does not have a name'

          const foundUser = await findUserByEmail(profile._json.email)
          if (foundUser) {
            if (!foundUser) throw 'No user found with that email'
            const user: googleUser = {
              email: foundUser.email,
              id: foundUser.id,
            }
            console.log('User found: ', user)
            done(null, user)
          } else {
            const newUser = await createUser(createNewUser(profile._json.email, profile._json.given_name, ''))
            console.log('Created new user: ', newUser)
            done(null, newUser)
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
