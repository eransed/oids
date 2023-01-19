import { writable, type Writable } from 'svelte/store'
import type { Button90Config } from '../components/interface'

export const menu: Writable<Button90Config[]> = writable()
export const showMenu: Writable<boolean> = writable()
export const showWelcomeScreen: Writable<boolean> = writable()
