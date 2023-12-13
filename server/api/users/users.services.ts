import db from '../utils/db'

// import { User, newUser } from '../types/user'
import { Prisma, User } from '@prisma/client'
import { randomUUID } from 'crypto'

// Exclude keys from user
function exclude(user: User, keys: string[]): UserNoPassword {
  const userNoPw: UserNoPassword = {} as UserNoPassword

  Object.entries(user).forEach(([key, value]) => {
    if (!keys.includes(key)) {
      userNoPw[key as keyof UserNoPassword] = value as never
    }
  })

  return userNoPw
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

type UserNoPassword = Omit<User, 'password'>

export const getUsers = async () => {
  const users = await db.user.findMany({})
  const filtered: UserNoPassword[] = []
  users.forEach((u) => {
    filtered.push(exclude(u, ['password']))
  })
  return filtered
  // return users
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
