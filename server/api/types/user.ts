export interface User {
  name: string
  id: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
  role: string
  darkMode?: boolean
}

export type Game = {
  win: boolean
  played: Date
  sessionId: string
  players?: Player[]
}

export interface GameHistory {
  gameHistory: Game[]
}

export interface Player {
  name: string
}

export interface newUser {
  name: string
  email: string
  password: string
}
