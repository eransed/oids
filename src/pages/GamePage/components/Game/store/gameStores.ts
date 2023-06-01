import { writable, type Writable } from "svelte/store"

export const showModal: Writable<boolean> = writable(false)
