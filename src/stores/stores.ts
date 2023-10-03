import { writable, type Writable } from 'svelte/store'
// import type { User } from '../interfaces/user'
import type { User } from '@prisma/client'
import { rndi } from 'mathil'
import type { ChatMessage, SpaceObject } from '../lib/interface'
import { createSpaceObject } from '../lib/factory'
import { OidsSocket } from '../lib/websocket/ws'
import { getWsUrl } from '../lib/websocket/ws'
import type { Settings } from '../style/styleInterfaces'
import { cnvTheme, DeepMidnight } from '../style/defaultColors'

export const isLoggedIn: Writable<boolean> = writable()

export const user: Writable<User> = writable()

export const userLoading: Writable<boolean> = writable()

const createdGuestName = `p-${rndi(1, 900000)}`
export const guestUserName: Writable<string> = writable(createdGuestName)

export const gUser: User = {
  id: createdGuestName,
  email: '',
  name: createdGuestName,
  createdAt: new Date(),
  updatedAt: new Date(),
  role: 'guest',
  darkMode: true,
  playTime: 0,
  image: ''
}

export const guestUser: Writable<User> = writable(gUser)

export const pageHasHeader: Writable<boolean> = writable(true)

export const gameSessionId: Writable<string | undefined> = writable('')

export const localPlayer: Writable<SpaceObject> = writable(createSpaceObject())

export const socket: Writable<OidsSocket> = writable(new OidsSocket(getWsUrl()))

export const chatMessageHistory: Writable<ChatMessage[]> = writable([])

export const settings: Writable<Settings> = writable({ uiStyle: cnvTheme(DeepMidnight), theme: DeepMidnight})
