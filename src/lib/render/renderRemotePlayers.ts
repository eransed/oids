import { add2, dist2, equal2, magnitude2, newVec2, smul2, wrap2_mm, type Vec2 } from 'mathil'
import { getCurrentTheme } from '../../style/defaultColors'
import { explosionDuration, timeScale } from '../constants'
import type { Game } from '../game'
import type { KeyFunctionMap, SpaceObject } from '../interface'
import { handleDeathExplosion } from '../mechanics'
import { getRemotePosition } from '../physics/physics'
import { renderHitRadius } from './render2d'
import { renderExplosionFrame } from './renderFx'
import { renderShip } from './renderShip'

import { renderProgressBar } from './renderUI'

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

let previousPositions: Map<string, Vec2> = new Map()

function interpolate(remotePlayer: SpaceObject, currentPos: Vec2, dt: number): Vec2 {
  let prevpos = previousPositions.get(remotePlayer.name)

  if (!prevpos) {
    prevpos = newVec2(currentPos.x, currentPos.y)
    previousPositions.set(remotePlayer.name, prevpos)
  }

  // Should be dynamic I guess
  const interpolatedPosX = lerp(prevpos.x, currentPos.x, 0.1)
  const interpolatedPosY = lerp(prevpos.y, currentPos.y, 0.1)
  const interpolatedPos = newVec2(interpolatedPosX, interpolatedPosY)
  previousPositions.set(remotePlayer.name, interpolatedPos)

  return interpolatedPos
}

export function renderRemotePlayerInSpaceMode(game: Game, activeKeyMap: KeyFunctionMap, dt: number): void {
  for (let i = 0; i < game.remotePlayers.length; i++) {
    const remotePlayer = game.remotePlayers[i]

    // console.log(remotePlayer.framesSinceLastServerUpdate)

    const interpolatedPos = interpolate(remotePlayer, add2(remotePlayer.viewFramePosition, remotePlayer.cameraPosition), remotePlayer.dt)

    const currentPos = getRemotePosition(interpolatedPos, game.localPlayer)

    if (remotePlayer.health <= 0) {
      console.log(remotePlayer.name, ' is dead')
      handleDeathExplosion(remotePlayer, explosionDuration)
      if (!remotePlayer.obliterated) {
        renderExplosionFrame(remotePlayer, game.ctx, currentPos)
      }
      return
    } else {
      renderShip(remotePlayer, game.ctx, false, game.style, currentPos)

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
