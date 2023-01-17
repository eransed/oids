import type { SpaceObject } from './types'
import { getPlayerShip } from './game'

export const getMenu = (init?: boolean): string => {
  let ship = getPlayerShip()

  let menu = ''

  if (init) {
    menu = 'Startup'
  }

  if (ship) {
    if (ship.ExistingGame) {
      if (ship.GameTypes.SinglePlayer) {
        menu = 'Singleplayer'
      } else if (ship.GameTypes.MultiPlayer) {
        menu = 'MultiPlayer'
      }
    }
  }

  return menu
}
