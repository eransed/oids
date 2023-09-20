import type { Game } from '../game'
import { setCanvasSizeToClientViewFrame, getScreenRect, getScreenCenterPosition, getScreenFromCanvas } from '../canvas_util'
import { gameState, initKeyControllers, spaceObjectKeyController } from '../input'
import { add, direction, dist2, info, log, magnitude, newVec2, rndf, rndfVec2, rndi, round2dec, smul, sub, to_string2, wrap } from 'mathil'
import { handleDeathExplosion } from '../mechanics'
import { friction, gravity, gravityStars, handleCollisions, offScreen, offScreen_mm, vec2Bound, wrap_mm } from '../physics'
import { loadingText, renderPoint } from '../render/render2d'
import { fpsCounter } from '../time'
import { GameType, getRenderableObjectCount, SpaceShape, type SpaceObject, MessageType, type NonPlayerCharacter } from '../interface'
import { randomAnyColor } from '../color'
import { test } from '../test'
import { explosionDuration, screenScale, worldSize } from '../constants'
import { addDataPoint, getLatestValue, GRAPHS, msPretty, newDataStats, renderGraph } from '../stats'
import { createNpc, newPhotonLaser } from '../factory'
import { reduceShotSize, reduceSoSize } from '../websocket/util'
import { renderMoon } from '../render/renderDebris'
import { renderShip } from '../render/renderShip'
import { renderVec2 } from '../render/renderUI'
import { renderExplosionFrame } from '../render/renderFx'

//Stores

let numberOfServerObjects = 0
let ops = 0
let dataLen = 0
let dataKeys = 0
let symbolsPerSec = 0
let byteSpeed = 0
let bitSpeed = 0
let rxDataBytes = 0
const symbolByteSize = 2
const byteSize = 8
let bytesRecievedLastSecond = 0

const timebuf = newDataStats()
const downloadBuf = newDataStats()
const packetSizeBuf = newDataStats()
const rxByteDataBuf = newDataStats()
const renderObjBuf = newDataStats()
const ppsbuf = newDataStats()

const speedbuf = newDataStats()
const batbuf = newDataStats()
const hpbuf = newDataStats()
const shotSize = newDataStats()
const soSize = newDataStats()
const dataTest = newDataStats()
const angularVelocityGraph = newDataStats()
angularVelocityGraph.baseUnit = 'mdeg/f'
angularVelocityGraph.label = 'Angular Vel.'
const ammoGraph = newDataStats()
ammoGraph.label = 'Ammo'
ammoGraph.baseUnit = ''

dataTest.baseUnit = 'B'
dataTest.label = 'Reduced So Size'

soSize.baseUnit = 'B'
soSize.label = 'SpaceObject Size'

shotSize.baseUnit = 'B'
shotSize.label = 'Shot size'

speedbuf.baseUnit = 'm/s'
speedbuf.accUnit = 'm'
speedbuf.label = 'Speed'
// speedbuf.maxSize = 500

hpbuf.baseUnit = 'hp'
hpbuf.label = 'Hp'
// hpbuf.maxSize = 1000

// symbuf.maxSize = 500
packetSizeBuf.baseUnit = 'B'
packetSizeBuf.label = 'Packet'

rxByteDataBuf.baseUnit = 'B'
rxByteDataBuf.label = 'Data downloaded'
// rxByteDataBuf.maxSize = 1000

ppsbuf.baseUnit = 'pps'
ppsbuf.label = 'Packets/sec'
// ppsbuf.maxSize = 1000

// renderObjBuf.maxSize = 2000
renderObjBuf.baseUnit = 'obj'
renderObjBuf.label = 'Obj/frame'

timebuf.baseUnit = 's'
timebuf.prettyPrint = msPretty
timebuf.maxSize = 60
timebuf.label = 'Time'

downloadBuf.label = 'Download'
downloadBuf.baseUnit = 'bit/s'
downloadBuf.accUnit = 'bit'
downloadBuf.maxSize = 60

batbuf.label = 'Battery'
batbuf.baseUnit = '%'

// const packetSize = newDataStats()
// packetSize.maxSize = 1000
// packetSize.baseUnit = 'B'

export function initRegularGame(game: Game): void {
  if (game.isRunning()) {
    return
  }

  // game.clearBodies()
  game.reset()

  game.type = GameType.MultiPlayer
  if (!test()) {
    return
  }

  loadingText('Loading...', game.ctx)
  initKeyControllers()

  const offset = 500

  setCanvasSizeToClientViewFrame(game.ctx)

  game.localPlayer.position = add(getScreenCenterPosition(game.ctx), rndfVec2(-offset, offset))

  //Local player init
  game.reset()
  game.localPlayer.mass = 1
  game.localPlayer.missileDamage = 1
  game.localPlayer.missileSpeed = 19
  game.localPlayer.armedDelay = 10
  game.localPlayer.shotsPerFrame = 1
  game.localPlayer.ammo = 1000000
  game.localPlayer.angleDegree = -120
  game.localPlayer.health = 100
  game.localPlayer.batteryLevel = 50000
  game.localPlayer.steeringPower = 1.4
  game.localPlayer.enginePower = 1
  game.localPlayer.color = randomAnyColor()
  game.localPlayer.photonColor = '#f0f'
  game.localPlayer.isLocal = true
  game.localPlayer.hitRadius = 120
  game.localPlayer.color = '#db8'
  game.localPlayer.worldSize = worldSize // server sends size of world
  game.localPlayer.cameraPosition = newVec2(0, 0)

  for (let i = 0; i < 400; i++) {
    // create starts
    const star = rndfVec2(0, 0)
    star.x = rndi(0, getScreenFromCanvas(game.ctx).x)
    star.y = rndi(0, getScreenFromCanvas(game.ctx).y)
    game.stars.push(star)
  }

  // game.stars.push(newVec2())
  // game.stars.push(smul(worldSize, 0.5))

  console.log('Your ship name is: ' + game.localPlayer.name + '\nAnd your color is: ' + game.localPlayer.color)

  //Shootable non-player objects
  // const asteroidCount = 1
  // for (let i = 0; i < asteroidCount; i++) {
  //   const asteroid = createSpaceObject()
  //   asteroid.position = rndfVec2(0, 1200)
  //   asteroid.health = 1000
  //   asteroid.name = 'asteroid-' + i
  //   asteroid.hitRadius = 220
  //   asteroid.size = newVec2(200, 200)
  //   asteroid.mass = 10
  //   game.bodies.push(asteroid)
  // }

  // game.remotePlayers = []
  game.all = game.all.concat(game.bodies)
  game.all.push(game.localPlayer)
  game.serverVersion = game.localPlayer.serverVersion

  let startTime = 0

  info('Setting game socket listener...')

  game.websocket.addListener(
    (su) => {
      // console.log(su)
      //   info(`${so.name} shot count: ${so.shotsInFlight?.length}`)
      if (su.dataObject.messageType === MessageType.SERVICE) {
        game.serverVersion = su.dataObject.serverVersion
        info(`Service message: server version: ${su.dataObject.serverVersion}`)
        return
      } else if (su.dataObject) {
        const so: SpaceObject = su.dataObject
        dataLen = su.unparsedDataLength
        bytesRecievedLastSecond += dataLen
        dataKeys = su.numberOfSpaceObjectKeys
        rxDataBytes += dataLen * symbolByteSize
        // addDataPoint(packetSize, su.spaceObjectByteSize)
        if (performance.now() - startTime >= 1000) {
          addDataPoint(timebuf, getLatestValue(timebuf) + (performance.now() - startTime))
          ops = numberOfServerObjects
          startTime = performance.now()
          if (numberOfServerObjects > 0) {
            symbolsPerSec = round2dec(bytesRecievedLastSecond / numberOfServerObjects, 1)
            byteSpeed = round2dec(symbolsPerSec * symbolByteSize, 1)
            bitSpeed = round2dec(byteSpeed * byteSize, 1)
            addDataPoint(downloadBuf, bitSpeed)
          }
          numberOfServerObjects = 0
          bytesRecievedLastSecond = 0
        } else {
          numberOfServerObjects++
        }
        for (let i = 0; i < game.remotePlayers.length; i++) {
          if (so.name === game.remotePlayers[i].name) {
            if (!so.online) {
              console.log(`${so.name} went offline`)
              game.remotePlayers.splice(i)
              continue
            }

            // Store every previously shots fired
            const cachePhotonLasers = game.remotePlayers[i].shotsInFlight

            const newShotsThisUpdate = so.shotsInFlight

            // update the remote player data object
            game.remotePlayers[i] = so

            // if (so.shotsFiredThisFrame) {
            game.remotePlayers[i].shotsInFlight = [...cachePhotonLasers, ...newShotsThisUpdate]
            // }

            // Makes sure to return the previously shots fired on the copy of remote player
            // game.remotePlayers[i].shotsInFlight = game.remotePlayers[i].shotsInFlight.concat(cachePhotonLasers)
            // console.log (`Remote player: ${i}: ` +  game.remotePlayers[i].shotsInFlight.length)

            return
          }
        }
        if (so.name !== game.localPlayer.name) {
          game.remotePlayers.push(so)
          log(`New ship online: ${so.name}`)
        }
      }
    },
    (su) => {
      // console.log (su.dataObject)
      // info(`Number of server obj: ${game.bodies.length}`)
      // console.log(su.dataObject)
      if (!exists(su.dataObject, game.bodies)) {
        // info(`Adding ${su.dataObject.name}`)
        game.bodies.push(su.dataObject)
      } else {
        game.bodies.forEach((b, i) => {
          if (b.name === su.dataObject.name) {
            game.bodies[i] = su.dataObject
          }
        })
      }
    }
  )
}

function exists(entity: NonPlayerCharacter, entities: NonPlayerCharacter[]): boolean {
  for (let i = 0; i < entities.length; i++) {
    const b = entities[i]
    // info(`bname: ${b.name}, ename ${entity.name} equal: ${b.name === entity.name}`)
    if (b.name === entity.name) {
      return true
    }
  }
  return false
}

function handleRemotePlayers(remotes: SpaceObject[], game: Game): SpaceObject[] {
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
      console.log(`${s.name} exited the game`)
    })
  }

  stillPlaying.forEach((so) => {
    if (so.shape === SpaceShape.Moon) {
      renderMoon(so, game.ctx)
    } else {
      if (so.health <= 0) {
        handleDeathExplosion(so, explosionDuration)
        if (!so.obliterated) {
          renderExplosionFrame(so, game.ctx)
        }
        return
      } else {
        // renderViewport(game.ctx, so)
        // const renderPos = add(so.viewFramePosition, so.cameraPosition)
        const remotePos = sub(add(so.viewFramePosition, so.cameraPosition), smul(game.localPlayer.cameraPosition, 1))

        renderShip(so, game.ctx, false, game.style, remotePos)
      }
    }
  })

  return stillPlaying
}

export class Every {
  private currentTick = 0
  maxTicks = 1

  constructor(maxTicks: number) {
    this.maxTicks = maxTicks
  }

  tick(callback: () => void) {
    this.currentTick++
    if (this.currentTick >= this.maxTicks) {
      callback()
      this.currentTick = 0
    }
  }
}

const every = new Every(25)

function moveView(game: Game) {
  // bound ship to viewframe
  const pad = newVec2(250, 250)

  const center = getScreenCenterPosition(game.ctx)
  const distanceToCenter = dist2(game.localPlayer.position, center)
  const offsetCenter = 400

  const camBound = sub(smul(game.localPlayer.worldSize, 0.5), getScreenRect(game.ctx))
  // console.log (camBound)
  game.localPlayer.cameraPosition = add(game.localPlayer.cameraPosition, game.localPlayer.velocity)
  game.localPlayer.cameraPosition = vec2Bound(game.localPlayer.cameraPosition, camBound)

  // game.localPlayer.viewFramePosition = smul(center, .1*dist2(game.localPlayer.velocity, newVec2(0, 0)))
  game.localPlayer.viewFramePosition = add(center, smul(game.localPlayer.velocity, 10))
  // game.localPlayer.viewFramePosition = center

  // game.localPlayer.position = vec2Bound_mm(game.localPlayer.position, pad, sub(getScreenRect(game.ctx), pad), () => {
  //   if (game.localPlayer.position.x + game.localPlayer.viewFramePosition.x > game.localPlayer.worldSize.x - 250) {
  //     game.localPlayer.velocity.x = -game.localPlayer.velocity.x * 0.5
  //   }
  //   if (game.localPlayer.position.y + game.localPlayer.viewFramePosition.y > game.localPlayer.worldSize.y - 250) {
  //     game.localPlayer.velocity.y = -game.localPlayer.velocity.y * 0.5
  //   }
  // })

  // const padInner = newVec2(200, 200)
  // game.localPlayer.position = vec2Bound_mm(game.localPlayer.position, padInner, sub(game.localPlayer.worldSize, padInner), () => {
  //   game.localPlayer.velocity = newVec2()
  // })

  // const padNum = 0

  // // move viewframe on x axis with ship velocity
  // if (game.localPlayer.viewFramePosition.x >= padNum || game.localPlayer.viewFramePosition.x <= game.localPlayer.worldSize.x - getScreenRect(game.ctx).x) {
  //   game.localPlayer.viewFramePosition = add(game.localPlayer.viewFramePosition, game.localPlayer.velocity)
  // }

  // // Bound left x to zero
  // if (game.localPlayer.viewFramePosition.x < padNum) {
  //   game.localPlayer.viewFramePosition.x = padNum
  // }

  // // Bound right x to world size - view rect
  // if (game.localPlayer.viewFramePosition.x > game.localPlayer.worldSize.x - getScreenRect(game.ctx).x) {
  //   game.localPlayer.viewFramePosition.x = game.localPlayer.worldSize.x - getScreenRect(game.ctx).x
  // }

  // // move viewframe on y axis with ship velocity
  // if (game.localPlayer.viewFramePosition.y >= padNum || game.localPlayer.viewFramePosition.y <= game.localPlayer.worldSize.y - getScreenRect(game.ctx).y) {
  //   game.localPlayer.viewFramePosition = add(game.localPlayer.viewFramePosition, game.localPlayer.velocity)
  // }

  // // Bound top y axis to world size - view rect
  // if (game.localPlayer.viewFramePosition.y < padNum) {
  //   game.localPlayer.viewFramePosition.y = padNum
  // }

  // // Bound bottom y axis to world size - view rect
  // if (game.localPlayer.viewFramePosition.y > game.localPlayer.worldSize.y - getScreenRect(game.ctx).y) {
  //   game.localPlayer.viewFramePosition.y = game.localPlayer.worldSize.y - getScreenRect(game.ctx).y
  // }
}

export function renderFrame(game: Game, dt: number): void {
  every.tick(() => {
    game.localPlayer.viewport = getScreenRect(game.ctx)
    setCanvasSizeToClientViewFrame(game.ctx)
    const remotePlayers: SpaceObject[] = []

    game.remotePlayers.forEach((player) => {
      remotePlayers.push(player)
    })

    gameState.set({ scoreScreenData: { player: game.localPlayer, remotePlayers: remotePlayers } })
  })

  const ctx = game.ctx
  game.lightSource.position = game.localPlayer.position
  game.lightSource.direction = direction(game.localPlayer.angleDegree)

  game.testShapes.forEach((s) => {
    s.render(ctx)
  })

  game.remotePlayers = handleRemotePlayers(game.remotePlayers, game)

  // renderSpaceObjectStatusBar(game.remotePlayers, game.localPlayer, ctx)

  if (game.keyFuncMap.systemGraphs.keyStatus) {
    fpsCounter(ops, dt, game, ctx)
  }

  // renderInfoText(`packets/sec: ${ops}`, 450, ctx)
  // renderInfoText(`packet symbol count: ${dataLen}`, 500, ctx)
  // renderInfoText(`object key count: ${dataKeys}`, 550, ctx)
  // renderInfoText(`sym/sec: ${symbolsPerSec}`, 600, ctx)
  // renderInfoText(`rx byte speed: ${siPretty(byteSpeed, 'B/s')}`, 650, ctx)
  // renderInfoText(`rx bit speed: ${siPretty(bitSpeed, 'bit/s')}`, 700, ctx)
  // renderInfoText(`rx data: ${siPretty(rxDataBytes, 'B')}`, 750, ctx)

  let objCount = 0
  game.remotePlayers.forEach((p) => {
    objCount += getRenderableObjectCount(p)
  })

  addDataPoint(renderObjBuf, objCount + getRenderableObjectCount(game.localPlayer))
  addDataPoint(ppsbuf, ops)
  addDataPoint(rxByteDataBuf, rxDataBytes)
  addDataPoint(speedbuf, 100 * magnitude(game.localPlayer.velocity))
  addDataPoint(hpbuf, game.localPlayer.health)
  addDataPoint(packetSizeBuf, dataLen)
  addDataPoint(batbuf, game.localPlayer.batteryLevel)
  addDataPoint(angularVelocityGraph, game.localPlayer.angularVelocity * 1000)
  addDataPoint(ammoGraph, game.localPlayer.ammo)
  try {
    addDataPoint(shotSize, new TextEncoder().encode(JSON.stringify(Object.values(reduceShotSize(newPhotonLaser())))).length)
    addDataPoint(soSize, new TextEncoder().encode(JSON.stringify(game.localPlayer)).length)
    addDataPoint(dataTest, new TextEncoder().encode(JSON.stringify(reduceSoSize(game.localPlayer))).length)
  } catch (e) {
    /* empty */
  }

  if (game.keyFuncMap.systemGraphs.keyStatus) {
    GRAPHS.forEach((g, i) => {
      const half = Math.floor(GRAPHS.length / 2)
      const h = 130
      const w = 250
      const space = 200
      const startx = 110
      if (i < half) renderGraph(g, { x: 400, y: startx + i * space }, { x: w, y: h }, ctx)
      else renderGraph(g, { x: 1300, y: startx + (i - half) * space }, { x: w, y: h }, ctx)
    })
  }

  game.bodies.forEach((body) => {
    if (body.health < 1) {
      handleDeathExplosion(body, explosionDuration)
      if (!body.obliterated) {
        renderExplosionFrame(body, ctx)
      }
    } else {
      renderMoon(body, ctx)
    }
  })

  game.bodies = game.bodies.filter((body) => {
    return !body.obliterated
  })

  game.all = game.all.filter((body) => {
    return !body.obliterated
  })

  // move star ref with inverted view frame position and factor
  for (let i = 0; i < game.stars.length; i++) {

    if (offScreen_mm(game.stars[i], game.localPlayer.cameraPosition, add(game.localPlayer.cameraPosition, getScreenFromCanvas(game.ctx)))) {
      // start bunch up behind the ship when using new random positions for stars:
      // game.stars[i].x = rndi(game.localPlayer.cameraPosition.x, game.localPlayer.cameraPosition.x + getScreenFromCanvas(game.ctx).x)
      // game.stars[i].y = rndi(game.localPlayer.cameraPosition.y, game.localPlayer.cameraPosition.y + getScreenFromCanvas(game.ctx).y)

      // just wrapping the stars looks better:
      // but this causes the stars to bunch up in a line or grid pattern after flying around some
      // so add some randomness when wrapping and regenerate them outside of the screen...
      const minRand = 0
      const maxRand = 300
      wrap_mm(game.stars[i], sub(game.localPlayer.cameraPosition, rndfVec2(minRand, maxRand)), add(add(game.localPlayer.cameraPosition, getScreenFromCanvas(game.ctx)), rndfVec2(minRand, maxRand)))
    }


    const starpos = sub(game.stars[i], smul(game.localPlayer.cameraPosition, 1))
    renderPoint(game.ctx, starpos, game.style.starColor, screenScale * 1.5)
  }

  if (game.localPlayer.health <= 0) {
    //Local player is dead

    handleDeathExplosion(game.localPlayer, explosionDuration)
    if (!game.localPlayer.obliterated) {
      renderExplosionFrame(game.localPlayer, ctx)
    } else {
      setTimeout(() => {
        game.callBackWrapper()
      }, 1000)
    }

    return
  } else {
    renderShip(game.localPlayer, ctx, true, game.style)
  }

  // renderRect(game.ctx,game.localPlayer.worldSize, newVec2(), '#aaa', 50)
  // renderVec2(`camera: ${to_string2(game.localPlayer.cameraPosition)}`, add(game.localPlayer.viewFramePosition, newVec2(-100, -100)), ctx)
  // renderVec2(`view: ${to_string2(game.localPlayer.viewFramePosition)}`, add(game.localPlayer.viewFramePosition, newVec2(200, -100)), ctx)
  renderVec2(`world: ${to_string2(add(game.localPlayer.viewFramePosition, game.localPlayer.cameraPosition))}`, add(game.localPlayer.viewFramePosition, newVec2(0, 100)), ctx, game.style)
  // renderVec2(`v: ${to_string2(game.localPlayer.velocity)}`, add(game.localPlayer.viewFramePosition, newVec2(100, 100)), ctx)

  const scrollPad = 500

  // if (game.localPlayer.position.x > game.localPlayer.viewport.x - scrollPad ||
  //     game.localPlayer.position.y > game.localPlayer.viewport.y - scrollPad ||
  //     game.localPlayer.position.x < 0 + scrollPad ||
  //     game.localPlayer.position.y < 0 + scrollPad) {
  //     } else {
  //       // game.localPlayer.viewFramePosition = newVec2()
  //     }
  moveView(game)
}



export function nextFrame(game: Game, dt: number): void {
  if (!game.localPlayer.isDead) {
    spaceObjectKeyController(game.localPlayer, dt)
  }
  // bounceSpaceObject(game.localPlayer, getScreenRect(game.ctx), bounceFactor, 0, 0)
  // bounceSpaceObject(game.localPlayer, game.localPlayer.worldSize, bounceFactor, 0, 0)
  friction(game.localPlayer)
  game.testShapes.forEach((s) => {
    friction(s)
  })

  if (game.remotePlayers.length === 0) {
    ops = 0
    dataKeys = 0
    dataLen = 0
    symbolsPerSec = 0
    byteSpeed = 0
    bitSpeed = 0
  }

  game.bodies.forEach((body) => {
    // bounceSpaceObject(body, getScreenRect(game.ctx), 0.4, 0, 0)
    // game.bodies.forEach((other) => {
    //   if (body !== other) {
    //     gravity(body, other)
    //   }
    // })
    // game.localPlayer.shotsInFlight.forEach((shot) => {
    //   gravity(body, shot)
    // })e
    // friction(body)
  })

  game.remotePlayers.forEach((so) => {
    gravity(so, game.localPlayer, 3)
  })

  game.remotePlayers = game.remotePlayers.filter((so) => {
    return so.online || so.isLocal
  })

  const currentSpaceObjects = game.all.concat(game.remotePlayers)

  handleCollisions(game.localPlayer.cameraPosition, currentSpaceObjects, game.ctx)
}
