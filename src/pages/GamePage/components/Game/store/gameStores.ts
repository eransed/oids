import { writable, type Writable } from "svelte/store"

import type { GameState } from "../../../../../lib/interface"

export const showScoreScreen: Writable<boolean> = writable(false)
export const showHotKeys: Writable<boolean> = writable(false)
export const activeKey: Writable<string> = writable()
export const gameState: Writable<GameState> = writable()
