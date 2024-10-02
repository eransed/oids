import { add2, newVec2 } from 'mathil'
import { getCurrentTheme } from '../../style/defaultColors'
import { explosionDuration } from '../constants'
import type { Game } from '../game'
import type { KeyFunctionMap, SpaceObject } from '../interface'
import { handleDeathExplosion } from '../mechanics'
import { getRemotePosition } from '../physics/physics'
import { renderHitRadius } from './render2d'
import { renderExplosionFrame } from './renderFx'
import { renderShip } from './renderShip'
import { renderTrail } from './renderShipTrail'
import { renderViewport, renderProgressBar } from './renderUI'

export function renderRemotePlayerInSpaceMode(remotes: SpaceObject[], game: Game, activeKeyMap: KeyFunctionMap): void {
  remotes.forEach((remotePlayer) => {
    const remotePos = getRemotePosition(remotePlayer, game.localPlayer)

    // hack: should not be done here...

    if (remotePlayer.health <= 0) {
      handleDeathExplosion(remotePlayer, explosionDuration)
      if (!remotePlayer.obliterated) {
        renderExplosionFrame(remotePlayer, game.ctx, remotePos)
      }
      return
    } else {
      renderShip(remotePlayer, game.ctx, false, game.style, remotePos)

      if (remotePlayer.positionalTrace) {
        for (let i = remotePlayer.positionalTrace.length - 1; i >= 0; i--) {
          const trace = remotePlayer.positionalTrace[i]
          const tracePos = getRemotePosition(trace, game.localPlayer)
          if (remotePlayer.afterBurner) {
            renderTrail(remotePlayer.positionalTrace[i], game.ctx, true, game.style, tracePos)
          }
        }
      }

      if (activeKeyMap.systemGraphs.keyStatus) {
        // renderViewport(game.ctx, remotePlayer)
        renderHitRadius(remotePlayer, game.ctx)
      }
      if (remotePlayer.health < remotePlayer.startHealth) {
        const theme = getCurrentTheme()
        renderProgressBar(
          add2(remotePos, newVec2(-remotePlayer.hitRadius / 1, -remotePlayer.hitRadius / 0.65)),
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
  })
}
