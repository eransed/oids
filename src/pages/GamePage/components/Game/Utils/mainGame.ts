import type { Game } from '../../../../../lib/game'
import type { Settings } from '../../../../../lib/interface'
import { logInfo, logWarning } from '../../../../../stores/alertHandler'

export let game: Game
export function gameRef(g: Game): void {
  game = g
}
export function getGame(): Game | null {
  if (game) return game
  logWarning('Game not set')
  return null
}

export function setGameSettings(settings: Settings): void {
  if (game) {
    logInfo(`Applies game settings:`)
    console.log(settings)
    game.style = settings.uiStyle
  }
}
