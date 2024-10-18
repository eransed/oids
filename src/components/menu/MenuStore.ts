// store.ts
import { writable } from 'svelte/store'

// Create a writable store with an initial value (false for menu closed).
export const menuOpen = writable<boolean>(false)
