import { rndfVec2, warn } from 'mathil'
import { explosionDuration, worldSize, worldStartPosition } from '../../constants'
import type { Game } from '../../game'
import type { KeyFunctionMap } from '../../interface'
import { handleDeathExplosion } from '../../mechanics'
import { getRemotePosition } from '../../physics/physics'
import { renderLine } from '../../render/render2d'
import { renderExplosionFrame } from '../../render/renderFx'
import { renderShip } from '../../render/renderShip'
import { renderTrail } from '../../render/renderShipTrail'
import { handleMoveView } from './handleMoveView'

export function handleLocalPlayer(game: Game, activeKeyMap: KeyFunctionMap) {
  const localPlayer = game.localPlayer

  if (localPlayer.health <= 0) {
    //Local player is dead

    handleDeathExplosion(localPlayer, explosionDuration)
    if (!localPlayer.obliterated) {
      renderExplosionFrame(localPlayer, game.ctx)
    } else {
      setTimeout(() => {
        game.callBackWrapper()
      }, 1000)
    }

    return
  } else {
    //Take away comment to activate health bar floating with ship
    // if (localPlayer.health < localPlayer.startHealth) {
    //   const theme = getCurrentTheme()
    //   renderProgressBar(
    //     add2(localPlayer.viewFramePosition, newVec2(-localPlayer.hitRadius / 0.5, localPlayer.hitRadius / 0.65)),
    //     'Hp',
    //     localPlayer.health,
    //     localPlayer.startHealth,
    //     game.ctx,
    //     0,
    //     false,
    //     '#fff',
    //     theme.accent,
    //     theme.text,
    //     localPlayer.hitRadius / 100
    //   )
    // }
    if (activeKeyMap.systemGraphs.keyStatus) {
      renderShip(localPlayer, game.ctx, true, game.style, null, true)
    } else {
      renderShip(localPlayer, game.ctx, true, game.style, null)
    }

    if (localPlayer.positionalTrace) {
      for (let i = localPlayer.positionalTrace.length - 1; i >= 0; i--) {
        const trace = localPlayer.positionalTrace[i]
        const tracePos = getRemotePosition(trace, game.localPlayer)
        if (localPlayer.afterBurner) {
          renderTrail(localPlayer.positionalTrace[i], game.ctx, true, game.style, tracePos)
        }
      }
    }
  }

  //Track other players with beam!
  if (activeKeyMap.tractorBeam.keyStatus) {
    for (let i = 0; i < game.remotePlayers.length; i++) {
      const remotePlayer = game.remotePlayers[i]

      renderLine(
        game.ctx,
        {
          p1: getRemotePosition(remotePlayer, game.localPlayer),
          p2: game.localPlayer.viewFramePosition,
        },
        game.style.starColor,
        1,
      )
    }
  }
  handleMoveView(game)
}

export function initLocalPlayer(game: Game) {
  warn(`Resets local player position`)
  game.reset()
  game.localPlayer.mass = 1
  game.localPlayer.missileDamage = 1
  game.localPlayer.missileSpeed = 19
  game.localPlayer.armedDelay = 10
  game.localPlayer.shotsPerFrame = 1
  game.localPlayer.ammo = 1000000
  game.localPlayer.angleDegree = -120
  game.localPlayer.health = 350
  game.localPlayer.startHealth = game.localPlayer.health
  game.localPlayer.batteryLevel = 5000
  game.localPlayer.batteryCapacity = 5000
  game.localPlayer.steeringPower = 1.5
  game.localPlayer.enginePower = 0.25
  game.localPlayer.photonColor = '#f00'
  game.localPlayer.isLocal = true
  game.localPlayer.color = '#db8'
  game.localPlayer.worldSize = worldSize // server sends size of world
  game.localPlayer.cameraPosition = worldStartPosition
  game.localPlayer.viewFramePosition = rndfVec2(0, 0)
  game.localPlayer.position = rndfVec2(0, 0)
}
