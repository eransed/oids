import { User, Ship } from '@prisma/client'
import bcrypt from 'bcrypt'
import { randomInt, randomUUID } from 'crypto'

export function createNewUser(email: string, name: string, password: string): User {
  const hashedPw = bcrypt.hashSync(password, 12)

  const newUser: User = {
    id: randomUUID(),
    email: email,
    password: hashedPw,
    name: name,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'player',
    darkMode: false,
    image: '',
    played: 0,
  }

  return newUser
}

export function createNewShip(name: string, userId: string): Ship {
  const newShip: Ship = {
    id: randomUUID(),
    name: name,
    userId: userId,
    level: 0,
    experience: 0,
    played: 0,
    image: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  return newShip
}
