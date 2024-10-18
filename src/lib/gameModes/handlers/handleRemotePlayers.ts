import type { Game } from '../../game'
import type { SpaceObject } from '../../interface'
import { updateShots } from '../../physics/updateShots'

export function handleRemotePlayers(game: Game): void {
  const stillPlaying = game.remotePlayers.filter((so) => {
    return so.isPlaying === true
  })

  game.remotePlayers = stillPlaying
}
