import { writable, type Writable } from 'svelte/store'
import type { User } from '../interfaces/user'
import { rndi } from 'mathil'
import type { ChatMessage, SpaceObject } from '../lib/interface'
import { createSpaceObject } from '../lib/factory'
import { OidsSocket } from '../lib/websocket/ws'
import { getWsUrl } from '../lib/websocket/ws'

export const isLoggedIn: Writable<boolean> = writable()

export const user: Writable<User> = writable()

export const userLoading: Writable<boolean> = writable()

const createdGuestName = `p-${rndi(1, 900000)}`
export const guestUserName: Writable<string> = writable(createdGuestName)

const gUser: User = {
 id: createdGuestName,
 email: '',
 name: createdGuestName,
 createdAt: new Date().toDateString(),
 updatedAt: new Date().toDateString(),
}
export const guestUser: Writable<User> = writable(gUser)

export const pageHasHeader: Writable<boolean> = writable(true)

export const gameSessionId: Writable<string | undefined> = writable('')

export const localPlayer: Writable<SpaceObject> = writable(createSpaceObject())

export const socket: Writable<OidsSocket> = writable(new OidsSocket(getWsUrl()))

export const  chatMessageHistory: Writable<ChatMessage[]> = writable([])
