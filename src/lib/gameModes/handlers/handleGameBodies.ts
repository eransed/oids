import { to_string2, add2, newVec2 } from 'mathil'
import { getCurrentTheme } from '../../../style/defaultColors'
import { explosionDuration } from '../../constants'
import type { Game } from '../../game'
import type { KeyFunctionMap, SpaceObject } from '../../interface'
import { handleDeathExplosion } from '../../mechanics'
import { getRemotePosition } from '../../physics/physics'
import { renderHitRadius } from '../../render/render2d'
import { renderExplosionFrame } from '../../render/renderFx'
import { renderMoon } from '../../render/renderMoon'
import { renderVec2, renderProgressBar } from '../../render/renderUI'

export function handleGameBodies(game: Game, activeKeyMap: KeyFunctionMap): SpaceObject[] {
  game.bodies.forEach((body) => {
    const bodyPos = getRemotePosition(body, game.localPlayer)

    if (body.health <= 0) {
      handleDeathExplosion(body, explosionDuration)
      if (!body.obliterated) {
        renderExplosionFrame(body, game.ctx, bodyPos)
      }
    } else {
      renderMoon(body, bodyPos, game.ctx, game.style)
      if (activeKeyMap.systemGraphs.keyStatus) {
        renderVec2(`camera: ${to_string2(body.cameraPosition)}`, add2(bodyPos, newVec2(-100, -100)), game.ctx, game.style)
        renderHitRadius(body, game.ctx)
      }

      if (body.health < body.startHealth) {
        const theme = getCurrentTheme()
        renderProgressBar(
          add2(bodyPos, newVec2(-body.hitRadius / 1.5, -body.hitRadius / 0.8)),
          'Hp',
          body.health,
          body.startHealth,
          game.ctx,
          0,
          false,
          '#fff',
          theme.accent,
          theme.text,
          body.hitRadius / 350,
        )
      }
    }
  })

  game.bodies = game.bodies.filter((body) => {
    return !body.obliterated
  })

  game.all = game.all.filter((body) => {
    return !body.obliterated
  })

  return game.bodies
}
