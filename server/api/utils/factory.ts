import { User, Ship } from '@prisma/client'
import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'

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
    theme: 0,
    image: '',
    played: 0,
  }

  return newUser
}

export function createNewShip(name: string, variant: number, userId: string, id?: string): Ship {
  const newShip: Ship = {
    id: id ? id : randomUUID(),
    name: name,
    userId: userId,
    level: 1,
    experience: 0,
    played: 0,
    variant: variant,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  return newShip
}
