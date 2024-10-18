import jwt from 'jsonwebtoken'

import { DecodedJwt } from '../../interfaces'

import { warn } from 'mathil'
import { User } from '@prisma/client'
import { ApiError } from './apiError'
import { StatusCodes } from 'http-status-codes'

//Token valid time
export const generateAccessToken = (user: User) => {
  if (!process.env.JWT_ACCESS_SECRET) throw new ApiError('No JWT_ACCESS_SECRET', StatusCodes.UNAUTHORIZED)

  return jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '8h',
  })
}

//How long a session will be until forced to login
export const generateRefreshToken = (user: User, jti: string) => {
  if (!process.env.JWT_REFRESH_SECRET) throw new ApiError('No JWT_REFRESH_SECRET', StatusCodes.UNAUTHORIZED)

  return jwt.sign(
    {
      userId: user.id,
      jti,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: '8h', //Set to 8 hour to gimmick a working day!
    },
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

export const getPayLoadFromJwT = async (token: string, secret: string) => {
  let p: DecodedJwt | undefined

  try {
    const decodedPayload = jwt.verify(token, secret, { complete: true })

    p = decodedPayload as DecodedJwt
    return p
  } catch (err: any) {
    throw new ApiError('Token not valid', 403, 'JWT payload could not be decoded')
  }
}
