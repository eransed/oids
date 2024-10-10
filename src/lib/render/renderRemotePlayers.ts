import { add2, dist2, equal2, newVec2, type Vec2 } from 'mathil'
import { getCurrentTheme } from '../../style/defaultColors'
import { explosionDuration } from '../constants'
import type { Game } from '../game'
import type { KeyFunctionMap } from '../interface'
import { handleDeathExplosion } from '../mechanics'
import { getRemotePosition } from '../physics/physics'
import { renderHitRadius } from './render2d'
import { renderExplosionFrame } from './renderFx'
import { renderShip } from './renderShip'

import { renderProgressBar } from './renderUI'
import { getFps } from '../time'

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

let previousPositions: Map<string, Vec2> = new Map()
let previosViewFramePos: Map<string, Vec2> = new Map()

export function renderRemotePlayerInSpaceMode(game: Game, activeKeyMap: KeyFunctionMap, dt: number): void {
  for (let i = 0; i < game.remotePlayers.length; i++) {
    const remotePlayer = game.remotePlayers[i]

    // console.log(remotePlayer.framesSinceLastServerUpdate)

    const currentPos = getRemotePosition(remotePlayer, game.localPlayer)

    let prevpos = previousPositions.get(remotePlayer.name)
    let prevViewFramePos = previosViewFramePos.get(remotePlayer.name)

    if (!prevViewFramePos) {
      previosViewFramePos.set(remotePlayer.name, remotePlayer.viewFramePosition)
    }

    if (!prevpos) {
      prevpos = newVec2(currentPos.x, currentPos.y)
      previousPositions.set(remotePlayer.name, prevpos)
    }

    // Calculate the distance between the current position and previous position

    // Only update positions if the player has moved beyond the stationary threshold

    const maxFrames = Math.max(1, Math.floor(100 / getFps(dt))) // Adjust based on your frame rate
    const t = Math.min(1, remotePlayer.framesSinceLastServerUpdate / maxFrames)
    const smoothingFactor = 0.5
    const cappedT = Math.min(t * smoothingFactor, 0.1)

    const interpolatedPosX = lerp(prevpos.x, currentPos.x, cappedT)
    const interpolatedPosY = lerp(prevpos.y, currentPos.y, cappedT)

    const interpolatedPos = newVec2(interpolatedPosX, interpolatedPosY)

    // Update the previous position to the interpolated position after rendering
    previousPositions.set(remotePlayer.name, interpolatedPos)
    previosViewFramePos.set(remotePlayer.name, remotePlayer.viewFramePosition)

    if (remotePlayer.health <= 0) {
      console.log(remotePlayer.name, ' is dead')
      handleDeathExplosion(remotePlayer, explosionDuration)
      if (!remotePlayer.obliterated) {
        renderExplosionFrame(remotePlayer, game.ctx, interpolatedPos)
      }
      return
    } else {
      renderShip(remotePlayer, game.ctx, false, game.style, interpolatedPos)

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
        renderHitRadius(remotePlayer, game.ctx)
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
