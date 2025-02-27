import { add2, dist2, equal2, lintra, mag2, magnitude2, newVec2, norm, smul2, wrap2_mm, type Vec2 } from 'mathil'
import { getCurrentTheme } from '../../style/defaultColors'
import { explosionDuration, timeScale } from '../constants'
import type { Game } from '../game'
import type { KeyFunctionMap, SpaceObject } from '../interface'
import { handleDeathExplosion } from '../mechanics'
import { getRemotePosition } from '../physics/physics'
import { renderHitRadius, renderInfoText } from './render2d'
import { renderExplosionFrame } from './renderFx'
import { renderShip } from './renderShip'

import { renderProgressBar } from './renderUI'
import { interpolate } from './interpolate'

let previousPositions: Map<string, Vec2> = new Map()

export function renderRemotePlayerInSpaceMode(game: Game, activeKeyMap: KeyFunctionMap, dt: number, renderActualPos = false): void {
  for (let i = 0; i < game.remotePlayers.length; i++) {
    const remotePlayer = game.remotePlayers[i]

    // console.log(remotePlayer.framesSinceLastServerUpdate)
    const actualPos = add2(remotePlayer.viewFramePosition, remotePlayer.cameraPosition)
    const actualRemotePos = getRemotePosition(actualPos, game.localPlayer)

    const interpolatedPos = interpolate(remotePlayer, actualPos, previousPositions)

    const currentPos = getRemotePosition(interpolatedPos.interpolatedPos, game.localPlayer)

    if (remotePlayer.isDead) {
      console.log(remotePlayer.name, ' is dead')
      handleDeathExplosion(remotePlayer, explosionDuration)
      if (!remotePlayer.obliterated) {
        renderExplosionFrame(remotePlayer, game.ctx, currentPos)
      }
      return
    } else {
      //Add lerpinfo to the renderShip function as a param to show info.
      const lerpInfo = `Blend: ${interpolatedPos.lerpAlphaBlending.toFixed(2)}, Speed: ${interpolatedPos.remoteSpeed.toFixed(1)}`

      renderShip(remotePlayer, game.ctx, false, game.style, currentPos, false)

      if (renderActualPos) {
        renderShip(remotePlayer, game.ctx, false, game.style, actualRemotePos)
      }

      // if (remotePlayer.positionalTrace) {
      //   for (let i = remotePlayer.positionalTrace.length - 1; i >= 0; i--) {
      //     const trace = remotePlayer.positionalTrace[i]
      //     const tracePos = getRemotePosition(trace, game.localPlayer)
      //     if (remotePlayer.afterBurner) {
      //       renderTrail(remotePlayer.positionalTrace[i], game.ctx, true, game.style, tracePos)
      //     }
      //   }
      // }

      if (activeKeyMap.systemGraphs.keyStatus) {
        // renderViewport(game.ctx, remotePlayer)
        renderHitRadius(remotePlayer, currentPos, game.ctx)
      }

      if (remotePlayer.health < remotePlayer.startHealth) {
        const theme = getCurrentTheme()
        renderProgressBar(
          add2(currentPos, newVec2(-remotePlayer.hitRadius / 1, -remotePlayer.hitRadius / 0.65)),
          'Hp',
          remotePlayer.health,
          remotePlayer.startHealth,
          game.ctx,
          0,
          false,
          '#fff',
          theme.accent,
          theme.text,
          remotePlayer.hitRadius / 200,
        )
      }
    }
  }
}
