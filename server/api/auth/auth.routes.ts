import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcrypt'
import { generateTokens, getPayLoadFromJwT } from '../utils/jwt'
import { addRefreshTokenToWhitelist, deleteRefreshToken, findRefreshTokenById, revokeTokens } from './auth.services'
import { findUserById } from '../users/users.services'
import hashToken from '../utils/hashToken'
import passport from 'passport'
import jwt from 'jsonwebtoken'

export const auth = express.Router()

import { createUser, findUserByEmail } from '../users/users.services'

import { createNewUser } from '../utils/factory'
import { jwtAuth } from '../middleware'
import { User } from '@prisma/client'
//Register endpoint
auth.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body
    if (!email || !password || !name) {
      res.status(400).send('You must provide a name, email and a password.')
      throw new Error('You must provide a name, email and a password.')
    }

    const existingUser = await findUserByEmail(email)

    if (existingUser) {
      res.status(400).send('Email already in use!')
      throw new Error('Email already in use.')
    }

    const newUser = createNewUser(email, name, password)

    const user = await createUser(newUser)
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
      res.status(400)
      throw new Error('You must provide an email and a password.')
    }

    //Find user by email
    const existingUser = await findUserByEmail(email)

    if (!existingUser) {
      res.status(403)
      throw new Error('Invalid login credentials.')
    }

    //Check incoming password against existing users password
    const validPassword = await bcrypt.compare(password, existingUser.password)
    if (!validPassword) {
      res.status(403)
      throw new Error('Invalid login credentials.')
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
      res.status(400)
      throw new Error('Missing refresh token.')
    }

    const payLoadFromJWt = await getPayLoadFromJwT(refreshToken, process.env.JWT_REFRESH_SECRET).catch((e) => {
      if (e) {
        res.status(401).send('Refreshtoken not valid')
      }
    })

    if (!payLoadFromJWt) return

    const savedRefreshToken = await findRefreshTokenById(payLoadFromJWt.payload.jti)

    if (!savedRefreshToken || savedRefreshToken.revoked === true) {
      res.status(401)
      throw new Error('Unauthorized')
    }

    const hashedToken = hashToken(refreshToken)
    if (hashedToken !== savedRefreshToken.hashedToken) {
      res.status(401)
      throw new Error('Unauthorized')
    }

    const user = await findUserById(payLoadFromJWt.payload.userId)
    if (!user) {
      res.status(401)
      throw new Error('Unauthorized')
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

  res.cookie('accesToken', accessToken)
  res.cookie('refreshToken', refreshToken)

  res.redirect('http://localhost:5173')
})
