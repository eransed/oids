import { writable } from "svelte/store"
import type { Game } from "../../../../../lib/game"
import type { SpaceObject } from "../../../../../lib/interface"

export const startGame = (Game: Game) => {
  Game.startMultiplayer()
}

export const stopGame = (Game: Game) => {
  Game.stopGame()
}

export const localPlayerStore = writable<SpaceObject>();
