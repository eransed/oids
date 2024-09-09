import { rndi } from 'mathil'
import { guestUserStore, localPlayerStore, userStore } from '../stores/stores'
// import type { Prisma, User } from '@prisma/client'
import { createSpaceObject } from '../lib/factory'
import type { User } from '../lib/interface'

export function getLocationURL() {
  if (typeof window !== 'undefined') {
    return window.location.hostname
  } else {
    return 'localhost'
  }
}

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
  userStore.set(undefined)
  guestUserStore.set(gUser)
  localPlayerStore.set(createSpaceObject(gUser.name))
  localStorage.clear()
}

export const createdGuestName = `p-${rndi(1, 900000)}`

export const gUser: User = {
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
