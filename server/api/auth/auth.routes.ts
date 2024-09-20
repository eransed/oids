import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcrypt'
import { generateTokens, getPayLoadFromJwT } from '../utils/jwt'
import { addRefreshTokenToWhitelist, deleteRefreshToken, findRefreshTokenById, revokeTokens } from './auth.services'
import { findUserById } from '../users/users.services'
import hashToken from '../utils/hashToken'
import passport from 'passport'

export const auth = express.Router()

import { createUser, findUserByEmail } from '../users/users.services'

import { createHashedPassword, createNewUser } from '../utils/factory'
import { User } from '@prisma/client'
import { Tokens } from '../../../src/lib/interface'
import { ApiError } from '../utils/apiError'
import { StatusCodes } from 'http-status-codes'
//Register endpoint
auth.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body
    if (!email || !password || !name) {
      res.status(400).send('You must provide a name, email and a password.')
      throw new ApiError('You must provide a name, email and a password.', StatusCodes.BAD_REQUEST)
    }

    const existingUser = await findUserByEmail(email)

    if (existingUser) {
      throw new ApiError('Email already in use.', StatusCodes.BAD_REQUEST)
    }

    const newUser = createNewUser(email, name)
    const hashedPassword = createHashedPassword(password)

    const user = await createUser(newUser, hashedPassword)
    const jti = uuidv4()
    const { accessToken, refreshToken } = generateTokens(user, jti)
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id })

    res.json({
      accessToken,
      refreshToken,
    })
  } catch (err) {
    next(err)
  }
})

//User login endpoint
auth.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      throw new ApiError('You must provide an email and a password.', StatusCodes.BAD_REQUEST)
    }

    //Find user by email
    const existingUser = await findUserByEmail(email)

    if (!existingUser) {
      throw new ApiError('Invalid login credentials.', StatusCodes.FORBIDDEN)
    }

    //Check incoming password against existing users password
    if (!existingUser.password?.hashedValue) {
      throw new ApiError('Invalid login credentials.', StatusCodes.FORBIDDEN)
    }

    const validPassword = await bcrypt.compare(password, existingUser.password.hashedValue)
    if (!validPassword) {
      throw new ApiError('Invalid login credentials.', StatusCodes.FORBIDDEN)
    }

    const jti = uuidv4()
    const { accessToken, refreshToken } = generateTokens(existingUser, jti)
    await addRefreshTokenToWhitelist({
      jti,
      refreshToken,
      userId: existingUser.id,
    })

    res.json({
      accessToken,
      refreshToken,
    })
  } catch (err) {
    next(err)
  }
})

//Refreshtoken
auth.post('/refreshToken', async (req, res, next) => {
  if (!process.env.JWT_REFRESH_SECRET) throw new Error('Missing Secret')

  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      throw new ApiError('Missing refresh token.', StatusCodes.BAD_REQUEST)
    }

    const payLoadFromJWt = await getPayLoadFromJwT(refreshToken, process.env.JWT_REFRESH_SECRET).catch((e) => {
      if (e) {
        res.status(401).send('Refreshtoken not valid')
      }
    })

    if (!payLoadFromJWt) return

    const savedRefreshToken = await findRefreshTokenById(payLoadFromJWt.payload.jti)

    if (!savedRefreshToken || savedRefreshToken.revoked === true) {
      throw new ApiError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    const hashedToken = hashToken(refreshToken)
    if (hashedToken !== savedRefreshToken.hashedToken) {
      throw new ApiError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    const user = await findUserById(payLoadFromJWt.payload.userId)
    if (!user) {
      throw new ApiError('Unauthorized', StatusCodes.UNAUTHORIZED)
    }

    await deleteRefreshToken(savedRefreshToken.id)
    const jti = uuidv4()
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user, jti)
    await addRefreshTokenToWhitelist({
      jti,
      refreshToken: newRefreshToken,
      userId: user.id,
    })

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    })
  } catch (err) {
    next(err)
  }
})

// This endpoint is only for demo purpose.
// Move this logic where you need to revoke the tokens( for ex, on password reset)
auth.post('/revokeRefreshTokens', async (req, res, next) => {
  try {
    const { userId } = req.body
    await revokeTokens(userId)
    res.json({ message: `Tokens revoked for user with id #${userId}` })
  } catch (err) {
    next(err)
  }
})

//The configuration of this is coming from passport.config.ts in function useGoogleStrategy()
auth.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

//Please fix failureRedirect to
auth.get('/google/callback', passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }), async (req, res) => {
  if (!req.user) {
    return
  }

  const user = req.user as User

  const jti = uuidv4()
  const { accessToken, refreshToken } = generateTokens(user, jti)
  await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id })

  // res.cookie('accesToken', accessToken)
  // res.cookie('refreshToken', refreshToken)

  res.redirect(`http://localhost:5173/auth-callback?accessToken=${accessToken}&refreshToken=${refreshToken}`)
})
