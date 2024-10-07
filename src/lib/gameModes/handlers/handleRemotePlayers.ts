import { logInfo } from '../../../components/alert/alertHandler'
import type { Game } from '../../game'
import type { SpaceObject } from '../../interface'

export function handleRemotePlayers(remotes: SpaceObject[], game: Game): void {
  remotes.forEach((so) => {
    so.framesSinceLastServerUpdate++
  })

  const stillPlaying = remotes.filter((so) => {
    return so.isPlaying === true
  })

  // const stoppedPlaying = remotes.filter((so) => {
  //   return so.isPlaying === false
  // })

  // if (stoppedPlaying.length > 0) {
  //   stoppedPlaying.forEach((s) => {
  //     logInfo(`${s.name} exited the game`)
  //   })
  // }

  game.remotePlayers = stillPlaying
}
