import { GameType } from './types'
import type { Game } from './game'

export class Menu {

  show(): void {
    // logic to show the correct menu...
  }

}

export function getSomeMenu(game: Game) {
  if (game.type === GameType.MultiPlayer) {
    if (game.shouldQuit() === false) {
      // game is still running in multiplayer mode
      // return some ButtonConfig90[]
    }
  }
}

// export const getMenu = (ship: SpaceObject, init?: boolean): string => {

//   let menu = ''

//   if (init) {
//     menu = 'Startup'
//   }

//   if (ship) {
//     if (ship.ExistingGame) {
//       if (ship.GameTypes.SinglePlayer) {
//         menu = 'Singleplayer'
//       } else if (ship.GameTypes.MultiPlayer) {
//         menu = 'MultiPlayer'
//       }
//     }
//   }

//   return menu
// }
