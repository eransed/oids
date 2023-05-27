import type { Game } from "../../../../../lib/game"

export const startGame = (Game: Game) => {
  Game.startMultiplayer()
}

export const stopGame = (Game: Game) => {
  Game.stopGame()
}
