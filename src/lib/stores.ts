import { writable, type Writable } from "svelte/store"
import type { Button90Config } from "../components/interface"
import type { User } from "../components/interface"

export const menu: Writable<Button90Config[]> = writable()
export const showMenu: Writable<boolean> = writable()
export const showLoginPage: Writable<boolean> = writable()
export const isLoggedIn: Writable<boolean> = writable()
export const user: Writable<User | undefined> = writable()
export const userLoading: Writable<boolean> = writable()
