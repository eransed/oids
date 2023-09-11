import { info, warn } from 'mathil'
import type { Game } from '../../../../../lib/game'
import type { Settings } from '../../../../../lib/interface'
export let game: Game
export function gameRef(g: Game): void {
  game = g
}

export function setGameSettings(settings: Settings): void {
  if (game) {
    console.log(`Applies game settings:`)
    console.log(settings)
    game.style = settings.uiStyle
  } else {
    console.log('No game instance!')
  }
}
