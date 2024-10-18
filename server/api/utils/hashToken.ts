import crypto from 'crypto'
import { ApiError } from './apiError'
import { StatusCodes } from 'http-status-codes'

const hashToken = (token: string) => {
  try {
    const hashedToken = crypto.createHash('sha512').update(token).digest('hex')
    return hashedToken
  } catch (err) {
    throw new ApiError('Error trying to create hashed token', StatusCodes.INTERNAL_SERVER_ERROR)
  }
}

export default hashToken
