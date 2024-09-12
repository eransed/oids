import { game } from '../../../../pages/GamePage/components/Game/Utils/mainGame'
import { shouldCelebrateLevelUp, userStore } from '../../../../stores/stores'
import type { ServerUpdate, SpaceObject } from '../../../interface'

export function handleShipUpdate(su: ServerUpdate<SpaceObject>) {
  const oldLvl = game.localPlayer.ship.level
  const newLvl = su.dataObject.ship.level

  if (oldLvl < newLvl) {
    console.log('new lvl!')
    shouldCelebrateLevelUp.set(true)
  }

  game.localPlayer.ship.experience = su.dataObject.ship.experience
  game.localPlayer.ship.level = su.dataObject.ship.level

  userStore.update((user) => {
    if (!user) {
      console.error('No user to update')
      return
    }
    const chosenShip = user.ships.findIndex((ship) => ship.id === su.dataObject.ship.id)

    user.ships[chosenShip].experience = su.dataObject.ship.experience
    user.ships[chosenShip].level = su.dataObject.ship.level

    return user
  })
}
