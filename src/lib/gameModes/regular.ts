import type { Game } from '../game'
import { setCanvasSize, getScreenRect, getScreenCenterPosition } from '../canvas_util'
import { initKeyControllers, spaceObjectKeyController } from '../input'
import { add, direction, rndfVec2d, rndi, sub } from '../math'
import { bounceSpaceObject } from '../mechanics'
import { friction, gravity, handleCollisions } from '../physics'
import { renderMoon, renderExplosionFrame, renderShip, renderSpaceObjectStatusBar, loadingText } from '../render'
import { fpsCounter } from '../time'
import { GameType, SpaceShape, type SpaceObject } from '../types'
import { getSerVer, initMultiplayer, registerServerUpdate } from '../webSocket'
import { randomAnyColor } from '../color'
import { test } from '../test'

export function initRegularGame(game: Game): void {
  if (game.isRunning()) {
    console.log('Game is already running')
    return
  }

  game.clearBodies()

  game.running = true
  console.log('starts multi')
  game.type = GameType.MultiPlayer
  if (!test()) {
    return
  }

  loadingText('Loading...', game.ctx)
  initKeyControllers()

  const offset = 500

  game.localPlayer.position = add(getScreenCenterPosition(game.ctx), rndfVec2d(-offset, offset))

  //Local player init
  game.reset()
  game.localPlayer.mass = 0.1
  game.localPlayer.angleDegree = -120
  game.localPlayer.health = 100
  game.localPlayer.batteryLevel = 1000
  game.localPlayer.steeringPower = 1.6
  game.localPlayer.enginePower = 0.25
  game.localPlayer.name = `P-${rndi(0, 900000)}`
  game.localPlayer.color = randomAnyColor()
  game.localPlayer.photonColor = '#f0f'
  game.localPlayer.isLocal = true
  game.localPlayer.hitRadius = 50
  console.log('Your ship name is: ' + game.localPlayer.name + '\nAnd your color is: ' + game.localPlayer.color)

  initMultiplayer()

  const padding = 0
  const pad = { x: padding, y: padding }
  const scr = sub(getScreenRect(game.ctx), pad)

  const bodies: SpaceObject[] = []

  game.all = game.all.concat(bodies)
  game.all.push(game.localPlayer)

  registerServerUpdate((so: SpaceObject) => {
    for (let i = 0; i < game.remotePlayers.length; i++) {
      if (so.name === game.remotePlayers[i].name) {
        if (!so.online) {
          console.log(`${so.name} went offline`)
        }
        game.remotePlayers[i] = so

        return
      }
    }
    if (so.name !== game.localPlayer.name) {
      game.remotePlayers.push(so)
      console.log(`New ship online: ${so.name}`)
    }
  })
}

export function renderFrame(game: Game, dt: number): void {
  const ctx = game.ctx
  setCanvasSize(game.ctx)
  game.lightSource.position = game.localPlayer.position
  game.lightSource.direction = direction(game.localPlayer.angleDegree)

  game.remotePlayers.forEach((so) => {
    if (so.shape === SpaceShape.Moon) {
      renderMoon(so, ctx)
    } else {
      if (so.health <= 0) {
        renderExplosionFrame(so.position, ctx)
        return
      } else {
        renderShip(so, ctx, false)
      }
    }
  })

  renderSpaceObjectStatusBar(game.remotePlayers, game.localPlayer, ctx)
  game.bodies.forEach((body) => {
    renderMoon(body, ctx)
  })

  fpsCounter(dt, getSerVer(), ctx)
  if (game.localPlayer.health <= 0) {
    //Local player is dead
    game.localPlayer.isDead = true
    game.callBackWrapper()
    renderExplosionFrame(game.localPlayer.position, ctx)
    return
  } else {
    renderShip(game.localPlayer, ctx, true)
  }
}

export function nextFrame(game: Game, dt: number): void {
  if (!game.localPlayer.isDead) {
    spaceObjectKeyController(game.localPlayer, dt)
  }
  bounceSpaceObject(game.localPlayer, getScreenRect(game.ctx), 0.4, 0, 0)
  friction(game.localPlayer)
  bounceSpaceObject(game.localPlayer, getScreenRect(game.ctx), 0.4, 0, 0)

  game.bodies.forEach((body) => {
    game.bodies.forEach((other) => {
      if (body !== other) {
        gravity(body, other)
      }
    })

    gravity(body, game.localPlayer)

    game.localPlayer.shotsInFlight.forEach((shot) => {
      gravity(body, shot)
    })

    friction(body)
    bounceSpaceObject(body, getScreenRect(game.ctx), 0.4, 0, 0)
  })

  game.remotePlayers = game.remotePlayers.filter((so) => {
    return so.online || so.isLocal
  })

  const currentSpaceObjects = game.all.concat(game.remotePlayers)

  handleCollisions(currentSpaceObjects, game.ctx)
}
