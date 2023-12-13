import { Request, Response, NextFunction } from 'express'
import { JWT_ACCESS_SECRET } from '../pub_config'
import { getPayLoadFromJwT } from './utils/jwt'

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers

  if (!authorization) {
    res.status(401)
    throw new Error('🚫 Un-Authorized 🚫')
  }

  try {
    const token = authorization.split(' ')[1]
    const payLoadFromJWt = await getPayLoadFromJwT(token, JWT_ACCESS_SECRET).catch(() => {
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

module.exports = {
  // ... other modules
  isAuthenticated,
}
