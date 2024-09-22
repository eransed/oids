import { logInfo } from '../../../stores/alertHandler'
import type { SpaceObject } from '../../interface'

export function handleRemotePlayers(remotes: SpaceObject[]): SpaceObject[] {
  remotes.forEach((so) => {
    so.framesSinceLastServerUpdate++
  })

  const stillPlaying = remotes.filter((so) => {
    return so.isPlaying === true
  })

  const stoppedPlaying = remotes.filter((so) => {
    return so.isPlaying === false
  })

  if (stoppedPlaying.length > 0) {
    stoppedPlaying.forEach((s) => {
      logInfo(`${s.name} exited the game`)
    })
  }

  return stillPlaying
}
