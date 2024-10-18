import db from '../utils/db'

// import { User, newUser } from '../types/user'
import { Prisma, User, Password } from '@prisma/client'
import { randomUUID } from 'crypto'
import { ApiError } from '../utils/apiError'
import { StatusCodes } from 'http-status-codes'

// Exclude keys from user

export const findUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
      include: { password: true },
    })
    return user
  } catch (err) {
    throw new ApiError('A problem occured fetching user by email from db', StatusCodes.INTERNAL_SERVER_ERROR)
  }
}

export const createUser = async (user: User, password: string) => {
  try {
    const newUser = await db.user.create({
      data: user,
    })
    await db.password.create({
      data: {
        id: randomUUID(),
        hashedValue: password,
        userId: newUser.id,
      },
    })
    return newUser
  } catch (err: any) {
    // Handle specific database errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        // P2002 is a Prisma error for uniqueness constraint violation
        throw new ApiError('Email already exists. Please use another.', StatusCodes.BAD_REQUEST, 'Unique constraint error')
      }
    }

    // If it's another error, rethrow it
    throw new ApiError('Failed to create user', StatusCodes.INTERNAL_SERVER_ERROR)
  }
}

export const findUserById = async (id: string) => {
  try {
    const foundUserById = await db.user.findUnique({
      where: {
        id,
      },
      include: {
        gameHistory: true,
        ships: true,
      },
    })
    return foundUserById
  } catch (err) {
    throw new ApiError('A problem occured fetching user by id from db', StatusCodes.INTERNAL_SERVER_ERROR)
  }
}

export const updateUser = async (user: User): Promise<User> => {
  return await db.user
    .update({
      where: {
        id: user.id,
      },
      data: {
        id: user.id,
        email: user.email,
        image: user.image,
        name: user.name,
        role: user.role,
        played: user.played,
        theme: user.theme,
      },
    })
    .then((d) => {
      return d
    })
    .catch((err) => {
      throw new Error(err)
    })
}

export const getUsers = async () => {
  const users = await db.user.findMany({})

  return users
}

/**
 * WARNING: User will be deleted forever!
 */
export const deleteUser = async (user: User): Promise<User> => {
  const response = await db.user
    .delete({
      where: {
        id: user.id,
      },
    })
    .then(() => {
      return user
    })
    .catch((err) => {
      return err
    })

  return response
}
