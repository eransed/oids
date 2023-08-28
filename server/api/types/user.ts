export interface User {
  name: string
  id: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export type Game = {
  win: boolean
  played: Date
}

export interface GameHistory {
  gameHistory: Game[]
}

export interface UserProfile extends User, GameHistory {}
