import { writable, type Writable } from 'svelte/store'
// import { type User, Prisma } from '@prisma/client'
import type { ChatMessage, SpaceObject, User } from '../lib/interface'
import { createSpaceObject } from '../lib/factory'
import { OidsSocket } from '../lib/websocket/ws'
import { getWsUrl } from '../lib/websocket/ws'
import type { Settings } from '../lib/interface'
import { cnvTheme, DeepMidnight } from '../style/defaultColors'
import { gUser, createdGuestName } from '../utils/utils'

// export const userIncludes = Prisma.validator<Prisma.UserArgs>()({
//   include: { ships: true, gameHistory: true },
// })

export const userStore: Writable<User | undefined> = writable(undefined)

export const userLoadingStore: Writable<boolean> = writable()

export const guestUser: Writable<User> = writable(gUser)

export const pageHasHeaderStore: Writable<boolean> = writable(true)

export const localPlayerStore: Writable<SpaceObject> = writable(createSpaceObject(createdGuestName))

export const socketStore: Writable<OidsSocket> = writable(new OidsSocket(getWsUrl()))

export const chatMsgHistoryStore: Writable<ChatMessage[]> = writable([])

export const settingsStore: Writable<Settings> = writable({
  uiStyle: cnvTheme(DeepMidnight),
  theme: DeepMidnight,
  hotKeys: undefined,
})

export const shouldCelebrateLevelUp: Writable<boolean> = writable(false)
