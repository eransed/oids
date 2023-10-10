import { rndi } from 'mathil'
import { isLoggedIn, user, userIncludes } from '../stores/stores'
import type { Prisma, User } from '@prisma/client'

export function createSessionId(): string {
  return `s-${rndi(1, 10000)}`
}

export function formatDate(date: Date | string) {
  if (typeof date === 'string') {
    date = new Date(date)
  }

  const f = new Intl.DateTimeFormat('en-SE', {
    dateStyle: 'full',
    timeStyle: 'medium',
  })

  return f.format(date)
}

export const handleLogout = (): void => {
  localStorage.clear()
  isLoggedIn.set(false)
  user.set(gUser)
}

export const createdGuestName = `p-${rndi(1, 900000)}`

export const gUser: User & Prisma.UserGetPayload<typeof userIncludes> = {
  id: createdGuestName,
  email: '',
  name: createdGuestName,
  password: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  role: 'guest',
  theme: 0,
  played: 0,
  image: '',
  ships: [],
  gameHistory: [],
}
