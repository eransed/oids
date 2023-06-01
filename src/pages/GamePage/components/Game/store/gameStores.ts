import { writable, type Writable } from "svelte/store"

export const showScoreScreen: Writable<boolean> = writable(false)
export const showHotKeys: Writable<boolean> = writable(false)
