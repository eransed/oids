import jwt from 'jsonwebtoken'

import { DecodedJwt } from '../../interfaces'

import { warn } from 'mathil'
import { User } from '@prisma/client'

//Token valid time
export const generateAccessToken = (user: User) => {
  if (!process.env.JWT_ACCESS_SECRET) throw new Error('No JWT_ACCESS_SECRET')

  return jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '8h',
  })
}

//How long a session will be until forced to login
export const generateRefreshToken = (user: User, jti: string) => {
  if (!process.env.JWT_REFRESH_SECRET) throw new Error('No JWT_REFRESH_SECRET')

  return jwt.sign(
    {
      userId: user.id,
      jti,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: '8h', //Set to 8 hour to gimmick a working day!
    }
  )
}

export const generateTokens = (user: User, jti: string) => {
  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user, jti)

  return {
    accessToken,
    refreshToken,
  }
}

export const getPayLoadFromJwT = async (token: string, secret: string): Promise<DecodedJwt | undefined> => {
  let p: DecodedJwt | undefined

  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, { complete: true }, (error, decoded) => {
      if (error) {
        warn('Token not valid')
        reject(error)
      } else if (decoded) {
        p = decoded as DecodedJwt
        resolve(p)
      }
    })
  })
}
