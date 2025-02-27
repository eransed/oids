import { add2, newVec2, rndfVec2 } from 'mathil'
import { explosionDuration, worldSize, worldStartPosition } from '../../constants'
import type { Game } from '../../game'
import type { KeyFunctionMap, SpaceObject } from '../../interface'
import { handleDeathExplosion } from '../../mechanics'
import { getRemotePosition } from '../../physics/physics'
import { renderLine } from '../../render/render2d'
import { renderExplosionFrame } from '../../render/renderFx'
import { renderShip } from '../../render/renderShip'
import { renderTrail } from '../../render/renderShipTrail'
import { handleMoveView } from './handleMoveView'
import { logWarning } from '../../../components/alert/alertHandler'
import { localPlayerStore } from '../../../stores/stores'
import { getCurrentTheme } from '../../../style/defaultColors'
import { renderProgressBar } from '../../render/renderUI'

interface WelcomeToPlanet {
  showInfo: boolean
  planet: SpaceObject
}

let welcomePlanet: WelcomeToPlanet | undefined

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
    //     add2(localPlayer.viewFramePosition, newVec2(-localPlayer.hitRadius / 0.42, -localPlayer.hitRadius * 1.65)),
    //     'Hp',
    //     localPlayer.health,
    //     localPlayer.startHealth,
    //     game.ctx,
    //     0,
    //     false,
    //     '#fff',
    //     theme.accent,
    //     theme.text,
    //     localPlayer.hitRadius / 100,
    //   )
    // }
    if (activeKeyMap.systemGraphs.keyStatus) {
      renderShip(localPlayer, game.ctx, true, game.style, null, true)
    } else {
      renderShip(localPlayer, game.ctx, true, game.style, null)
    }

    // if (localPlayer.positionalTrace) {
    //   for (let i = localPlayer.positionalTrace.length - 1; i >= 0; i--) {
    //     const trace = localPlayer.positionalTrace[i]
    //     const tracePos = getRemotePosition(trace, game.localPlayer)
    //     if (localPlayer.afterBurner) {
    //       renderTrail(localPlayer.positionalTrace[i], game.ctx, true, game.style, tracePos)
    //     }
    //   }
    // }
  }

  //Track other players with beam!
  if (activeKeyMap.tractorBeam.keyStatus) {
    for (let i = 0; i < game.bodies.length; i++) {
      const body = game.bodies[i]

      const actualPos = add2(body.viewFramePosition, body.cameraPosition)

      renderLine(
        game.ctx,
        {
          p1: getRemotePosition(actualPos, game.localPlayer),
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
  logWarning(`Resets local player position`)
  game.reset()
  initALocalPlayer(game.localPlayer)
  localPlayerStore.set(game.localPlayer)
}

export function initALocalPlayer(localPlayer: SpaceObject) {
  logWarning(`Resets local player`)
  localPlayer.mass = 1
  localPlayer.missileDamage = 1
  localPlayer.missileSpeed = 19
  localPlayer.armedDelay = 10
  localPlayer.shotsPerFrame = 1
  localPlayer.ammo = 1000000
  localPlayer.angleDegree = -120
  localPlayer.health = 350
  localPlayer.startHealth = localPlayer.health
  localPlayer.batteryLevel = 5000
  localPlayer.batteryCapacity = 5000
  localPlayer.steeringPower = 1.5
  localPlayer.enginePower = 0.25
  localPlayer.photonColor = '#f00'
  localPlayer.isLocal = true
  localPlayer.isDead = false
  localPlayer.isPlaying = true
  localPlayer.color = '#db8'
  localPlayer.worldSize = worldSize // server sends size of world
  localPlayer.cameraPosition = worldStartPosition
  localPlayer.viewFramePosition = rndfVec2(0, 0)
  localPlayer.position = rndfVec2(0, 0)
}
