import { writable, type Writable } from 'svelte/store'
import { type User, Prisma } from '@prisma/client'
import { rndi } from 'mathil'
import type { ChatMessage, SpaceObject } from '../lib/interface'
import { createSpaceObject } from '../lib/factory'
import { OidsSocket } from '../lib/websocket/ws'
import { getWsUrl } from '../lib/websocket/ws'
import type { Settings } from '../style/styleInterfaces'
import { cnvTheme, DeepMidnight } from '../style/defaultColors'

export const isLoggedIn: Writable<boolean> = writable()

export const userIncludes = Prisma.validator<Prisma.UserArgs>()({
  include: { ships: true, gameHistory: true },
})

export const user: Writable<User & Prisma.UserGetPayload<typeof userIncludes>> = writable()

export const userLoading: Writable<boolean> = writable()

const createdGuestName = `p-${rndi(1, 900000)}`
export const guestUserName: Writable<string> = writable(createdGuestName)

export const gUser: User & Prisma.UserGetPayload<typeof userIncludes> = {
  id: createdGuestName,
  email: '',
  name: createdGuestName,
  password: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  role: 'guest',
  darkMode: true,
  played: 0,
  image: '',
  ships: [],
  gameHistory: [],
}

export const guestUser: Writable<User> = writable(gUser)

export const pageHasHeader: Writable<boolean> = writable(true)

export const gameSessionId: Writable<string | undefined> = writable('')

export const localPlayer: Writable<SpaceObject> = writable(createSpaceObject())

export const socket: Writable<OidsSocket> = writable(new OidsSocket(getWsUrl()))

export const chatMessageHistory: Writable<ChatMessage[]> = writable([])

export const settings: Writable<Settings> = writable({ uiStyle: cnvTheme(DeepMidnight), theme: DeepMidnight })
