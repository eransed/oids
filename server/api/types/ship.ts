import { User } from './user'

export interface Ship {
  id: number
  name: string
  level: number
  updatedAt: Date
  createdAt: Date
  experience: number
  owner: User
  userId: string
}

export interface newShip {
  name: string
  userId: string
}
