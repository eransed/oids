import type { Ship } from '@prisma/client'
import type { GameHistory } from './game'

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
  gameHistory: GameHistory[]
  role: string
  darkMode: boolean
  ships: Ship[]
}

export interface Tokens {
  accessToken: string
  refreshToken: string
}
