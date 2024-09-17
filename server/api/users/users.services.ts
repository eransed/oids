import db from '../utils/db'

// import { User, newUser } from '../types/user'
import { Prisma, User, Password } from '@prisma/client'
import { randomUUID } from 'crypto'

// Exclude keys from user

export const findUserByEmail = (email: string) => {
  return db.user.findUnique({
    where: {
      email,
    },
    include: { password: true },
  })
}

export const createUser = async (user: User, password: string) => {
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
}

export const findUserById = (id: string) => {
  return db.user.findUnique({
    where: {
      id,
    },
    include: {
      gameHistory: true,
      ships: true,
    },
  })
}

export const saveGame = async (id: string, win: boolean, played: Date, sessionId: string) => {
  await db.game.create({
    data: {
      userId: id,
      win: win,
      played: played,
      sessionId: sessionId,
    },
  })
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
