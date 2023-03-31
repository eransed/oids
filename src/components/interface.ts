export interface Button90Config {
  buttonText: string
  clickCallback: () => void
  selected: boolean
}

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface GameHistory {
  id: string
  userId: string
  win: boolean
}

export interface Profile {
  user: User
  gameHistory: GameHistory[]
}
