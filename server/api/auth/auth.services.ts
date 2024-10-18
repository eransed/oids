import { StatusCodes } from 'http-status-codes'
import { ApiError } from '../utils/apiError'
import db from '../utils/db'
import hashToken from '../utils/hashToken'

interface addRefreshTokenToWhitelistTypes {
  jti: string
  refreshToken: string
  userId: string
}

// used when we create a refresh token.
export const addRefreshTokenToWhitelist = async ({ jti, refreshToken, userId }: addRefreshTokenToWhitelistTypes) => {
  try {
    const createdTokens = await db.refreshToken.create({
      data: {
        id: jti,
        hashedToken: hashToken(refreshToken),
        userId,
      },
    })

    return createdTokens
  } catch (err) {
    throw new ApiError('A problem occured saving refreshToken to db', StatusCodes.INTERNAL_SERVER_ERROR)
  }
}

// used to check if the token sent by the client is in the database.
export const findRefreshTokenById = async (id: string) => {
  try {
    const foundRefreshToken = await db.refreshToken.findUnique({
      where: {
        id,
      },
    })
    return foundRefreshToken
  } catch (err) {
    throw new ApiError('Refreshtoken sent by client is not in the db', StatusCodes.NOT_FOUND)
  }
}

// soft delete tokens after usage.
export const deleteRefreshToken = async (id: string) => {
  try {
    const deletedRefreshToken = await db.refreshToken.update({
      where: {
        id,
      },
      data: {
        revoked: true,
      },
    })
    return deletedRefreshToken
  } catch (err) {
    throw new ApiError('Could not delete refreshtoken', StatusCodes.INTERNAL_SERVER_ERROR)
  }
}

export const revokeTokens = async (userId: string) => {
  try {
    const revokedtokens = await db.refreshToken.updateMany({
      where: {
        userId,
      },
      data: {
        revoked: true,
      },
    })

    return revokedtokens
  } catch (err) {
    throw new ApiError('Could not revoke tokens', StatusCodes.INTERNAL_SERVER_ERROR)
  }
}
