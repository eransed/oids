import { Request, Response, NextFunction } from 'express'
import { getPayLoadFromJwT } from './utils/jwt'
import jwt from 'jsonwebtoken'

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  if (!process.env.JWT_ACCESS_SECRET) throw new Error('No JWT_ACCESS_SECRET')
  const { authorization } = req.headers

  if (!authorization) {
    res.status(401)
    throw new Error('🚫 Un-Authorized 🚫')
  }

  try {
    const token = authorization.split(' ')[1]
    const payLoadFromJWt = await getPayLoadFromJwT(token, process.env.JWT_ACCESS_SECRET).catch(() => {
      res.status(401).send('Error on getting payload from JwT')
    })
    if (!payLoadFromJWt) return
    req.params = payLoadFromJWt.payload
  } catch (err) {
    res.status(401)
    throw new Error('🚫 Un-Authorized 🚫')
  }

  return next()
}

export const jwtAuth = (req: Request, next: NextFunction) => {
  const token = req.header('Authorization')
  if (!token) {
    throw new Error('Authorization token is missing')
  }
  if (token.startsWith('Bearer ') == false) {
    throw new Error('Authorization token should start with Bearer')
  }
  const jwtToken = token.substring(7, token.length)
  try {
    const decoded = jwt.verify(jwtToken, process.env.JWT_ACCESS_SECRET || '')
    req.user = decoded
  } catch (err) {
    throw new Error('Invalid token')
  }

  next()
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err)
  if (err.message) {
    res.status(500).send({ errors: [{ message: err.message }] })
  } else {
    res.status(500).send({ errors: [{ message: 'Something went wrong' }] })
  }
}

module.exports = {
  // ... other modules
  isAuthenticated,
  errorHandler,
}
