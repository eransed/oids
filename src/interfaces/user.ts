import type { GameHistory } from "./game"

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Profile {
  user: User
  gameHistory: GameHistory[]
}
