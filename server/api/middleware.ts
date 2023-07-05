import { Request, Response, NextFunction } from 'express'
const jwt = require('jsonwebtoken')
import { JWT_ACCESS_SECRET } from '../pub_config'

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
 const { authorization } = req.headers

 if (!authorization) {
  res.status(401)
  throw new Error('🚫 Un-Authorized 🚫')
 }

 try {
  const token = authorization.split(' ')[1]
  const payload = jwt.verify(token, JWT_ACCESS_SECRET)
  req.params = payload
 } catch (err) {
  res.status(401)
  throw new Error('🚫 Un-Authorized 🚫')
 }

 return next()
}

module.exports = {
 // ... other modules
 isAuthenticated,
}
