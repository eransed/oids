import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcrypt'
import { generateTokens } from '../utils/jwt'
import { addRefreshTokenToWhitelist, deleteRefreshToken, findRefreshTokenById, revokeTokens } from './auth.services'
import { findUserById } from '../users/users.services'
import hashToken from '../utils/hashToken'
import { JWT_REFRESH_SECRET } from '../../pub_config'
import { warn } from 'mathil'

export const auth = express.Router()

import { createUser, findUserByEmail } from '../users/users.services'

import jwt from 'jsonwebtoken'
import { createNewUser } from '../utils/factory'
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

    const existingUser = await findUserByEmail(email)

    if (!existingUser) {
      res.status(403)
      throw new Error('Invalid login credentials.')
    }

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
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      res.status(400)
      throw new Error('Missing refresh token.')
    }

    const payload: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err: any, decoded: any) => {
      if (err) {
        res.status(401)
        warn('Refreshtoken is not valid')

        throw new Error('Refreshtoken is not valid')
      } else if (decoded) return decoded
    })

    if (!payload) return

    const savedRefreshToken = await findRefreshTokenById(payload.jti)

    if (!savedRefreshToken || savedRefreshToken.revoked === true) {
      res.status(401)
      throw new Error('Unauthorized')
    }

    const hashedToken = hashToken(refreshToken)
    if (hashedToken !== savedRefreshToken.hashedToken) {
      res.status(401)
      throw new Error('Unauthorized')
    }

    const user = await findUserById(payload.userId)
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
