import jwt from 'jsonwebtoken'

import type { User } from '../types/user'

import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from '../../pub_config'

//Token valid time
export const generateAccessToken = (user: User) => {
 return jwt.sign({ userId: user.id }, JWT_ACCESS_SECRET, {
  expiresIn: '5m',
 })
}

//How long a session will be until forced to login
export const generateRefreshToken = (user: User, jti: string) => {
 return jwt.sign(
  {
   userId: user.id,
   jti,
  },
  JWT_REFRESH_SECRET,
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
