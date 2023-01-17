import type { SpaceObject } from './types'

export const getMenu = (ship: SpaceObject, init?: boolean): string => {
  let menu = ''

  if (init) {
    menu = 'Startup'
  }

  if (ship.ExistingGame) {
    if (ship.GameTypes.SinglePlayer) {
      menu = 'Singleplayer'
    } else if (ship.GameTypes.MultiPlayer) {
      menu = 'MultiPlayer'
    }
  }

  return menu
}
