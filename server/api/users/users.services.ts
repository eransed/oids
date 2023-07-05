import bcrypt from 'bcrypt'
import db from '../utils/db'

import { User } from '../types/user'

export const findUserByEmail = (email: string) => {
 return db.user.findUnique({
  where: {
   email,
  },
 })
}

export const createUser = (user: User) => {
 if (user.password) {
  user.password = bcrypt.hashSync(user.password, 12)
 }

 return db.user.create({
  data: user,
 })
}

export const findUserById = (id: string) => {
 return db.user.findUnique({
  where: {
   id,
  },
 })
}

export const getGameHistory = (id: string) => {
 return db.game.findMany({
  where: {
   userId: id,
  },
 })
}

export const saveGame = (id: string, win: boolean) => {
 return db.game.create({
  data: {
   userId: id,
   win: win,
  },
 })
}
