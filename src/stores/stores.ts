import { writable, type Writable } from "svelte/store"
import type { Button90Config } from "../interfaces/menu"
import type { User } from "../interfaces/user"
import { rndi } from "mathil"
import type { SpaceObject } from "../lib/interface"
import { createSpaceObject } from "../lib/factory"

export const menu: Writable<Button90Config[]> = writable()

export const isLoggedIn: Writable<boolean> = writable()

export const user: Writable<User> = writable()

export const userLoading: Writable<boolean> = writable()

export const guestUserName: Writable<string> = writable(`p-${rndi(1, 900000)}`)

export const pageHasHeader: Writable<boolean> = writable(true)

export const gameSessionId: Writable<string | undefined> = writable("")

export const localPlayer: Writable<SpaceObject> = writable(createSpaceObject())
