import bcrypt from 'bcrypt'
import db from '../utils/db'

// import { User, newUser } from '../types/user'
import { User } from '@prisma/client'
import { randomUUID } from 'crypto'

// Exclude keys from user
function exclude(user: any, keys: any) {
  return Object.fromEntries(Object.entries(user).filter(([key]) => !keys.includes(key)))
}

export const findUserByEmail = (email: string) => {
  return db.user.findUnique({
    where: {
      email,
    },
  })
}

export const createUser = (user: User) => {
  user.id = randomUUID()

  return db.user.create({
    data: user,
  })
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

export const updateUser = async (user: User) => {
  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      role: user.role,
      name: user.name,
      email: user.email,
    },
  })
}

export const getUsers = async () => {
  const users = await db.user.findMany({})
  const filtered: any[] = []
  users.forEach((u) => {
    filtered.push(exclude(u, ['password']))
  })
  return filtered
  // return users
}

/**
 * WARNING: User will be deleted forever!
 */
export const deleteUser = async (user: User): Promise<string> => {
  const response = await db.user
    .delete({
      where: {
        id: user.id,
      },
    })
    .then(() => {
      return `User ${user.email} is now deleted.`
    })
    .catch((err) => {
      return err
    })

  return response
}
