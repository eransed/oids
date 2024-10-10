import type { Game } from '../../game'
import type { SpaceObject } from '../../interface'
import { updateShots } from '../../physics/updateShots'

export function handleRemotePlayers(remotes: SpaceObject[], game: Game): void {
  remotes.forEach((so) => {
    so.framesSinceLastServerUpdate++
  })

  const stillPlaying = game.remotePlayers.filter((so) => {
    return so.isPlaying === true
  })

  game.remotePlayers = stillPlaying
}
