import { info, warn } from 'mathil'
import type { Game } from '../../../../../lib/game'
import type { Settings } from '../../../../../style/styleInterfaces'
export let game: Game
export function gameRef(g: Game): void {
  game = g
}

export function setGameSettings(settings: Settings): void {
  if (game) {
    info(`Applies game settings:`)
    console.log(settings)
    game.style = settings.uiStyle
  } else {
    warn('No game instance!')
  }
}
