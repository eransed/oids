import { writable, type Writable } from "svelte/store"
import type { Button90Config } from "../interfaces/menu"
import type { User } from "../interfaces/user"

export const menu: Writable<Button90Config[]> = writable()

export const showMenu: Writable<boolean> = writable()

export const showLoginPage: Writable<boolean> = writable()

export const isLoggedIn: Writable<boolean> = writable()

export const user: Writable<User | undefined> = writable()

export const userLoading: Writable<boolean> = writable()

export const showLobby: Writable<boolean> = writable(true)

export const showLoginModal: Writable<boolean> = writable(false)

export const pageHasHeader: Writable<boolean> = writable(true)

export const currentLocation = writable("")

export const gameSessionId: Writable<string | undefined> = writable("")
