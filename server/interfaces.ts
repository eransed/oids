import jwt from 'jsonwebtoken'

export interface DecodedJwt extends jwt.Jwt {
  payload: {
    jti: string
    userId: string
  }
}
