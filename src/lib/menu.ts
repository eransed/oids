import { GameType } from './types'
import type { Game } from './game'
import type { Button90Config } from '../components/interface'
import { menu } from './stores'

export function getMenu(game: Game, handleStartMultiplayerClick: () => void) {
  let startUpMenu: Button90Config[] = [
    {
      buttonText: 'Singleplayer',
      clickCallback: () => {
        console.log('Singleplayer')
      },
      selected: true,
    },
    {
      buttonText: 'Multiplayer',
      clickCallback: () => {
        handleStartMultiplayerClick()
        menu.set(inGameMenu)
      },
      selected: false,
    },
    {
      buttonText: 'Settings',
      clickCallback: () => {
        console.log('Settings')
      },
      selected: false,
    },
  ]

  let inGameMenu: Button90Config[] = [
    {
      buttonText: 'Settings',
      clickCallback: () => {
        console.log('Settings')
      },
      selected: false,
    },
    {
      buttonText: 'Exit game',
      clickCallback: () => {
        console.log('stops game')
        game.stopGame()
        menu.set(startUpMenu)
      },
      selected: false,
    },
  ]

  if (game) {
    if (game.isRunning()) {
      return inGameMenu
    }
  }

  return startUpMenu
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
