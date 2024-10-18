import { getScreenCenterPosition, add2, smul2, vec2Array, dist2 } from 'mathil'
import type { Game } from '../../game'

export function handleMoveView(game: Game) {
  // const cameraLagSize = 30

  // const cameraLag = vec2Array(cameraLagSize, 0, 0)
  // bound ship to viewframe
  const center = getScreenCenterPosition(game.ctx)

  // const d = dist2(center, game.localPlayer.viewFramePosition)
  // cameraLag.push(game.localPlayer.velocity)
  // if (cameraLag.length > cameraLagSize) {
  //   game.localPlayer.viewFramePosition = add2(center, smul2(cameraLag[0], 60))
  // }
  game.localPlayer.viewFramePosition = add2(center, smul2(game.localPlayer.velocity, 1))
  // cameraLag.shift()
  // every30.tick(() => {
  //   console.log({ cameraLag, d })
  // })
}
