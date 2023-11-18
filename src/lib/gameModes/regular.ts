import type { Game } from '../game'
import { setCanvasSizeToClientViewFrame, getScreenRect, getScreenCenterPosition, getScreenFromCanvas } from '../canvas_util'
import { gameState, initKeyControllers, initTouchControls, spaceObjectKeyController, spaceTouchController } from '../input'
import {
  add2,
  direction2,
  info,
  log,
  magnitude2,
  newVec2,
  rndfVec2,
  rndi,
  round2dec,
  siPretty,
  smul2,
  sub2,
  to_string2,
  vec2Array,
  type Vec2,
  dist2,
  warn,
  error,
} from 'mathil'
import { handleDeathExplosion } from '../mechanics'
import { friction, handleCollisions, offScreen_mm, wrap_mm } from '../physics'
import { loadingText, renderInfoText, renderPoint } from '../render/render2d'
import { fpsCounter } from '../time'
import { GameType, getRenderableObjectCount, SpaceShape, type SpaceObject, MessageType, type NonPlayerCharacter } from '../interface'
import { randomAnyColor } from '../color'
import { test } from '../test'
import { explosionDuration, screenScale, worldSize, worldStartPosition } from '../constants'
import { addDataPoint, getLatestValue, GRAPHS, msPretty, newDataStats, renderGraph } from '../stats'
import { newPhotonLaser } from '../factory'
import { reduceShotSize, reduceSoSize } from '../websocket/util'
import { renderMoon } from '../render/renderDebris'
import { renderShip } from '../render/renderShip'
import { renderSpaceObjectStatusBar, renderVec2, renderViewport } from '../render/renderUI'
import { renderExplosionFrame } from '../render/renderFx'
import { chatMessageHistory } from '../../stores/stores'

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

function randomPositionInCurrentViewFrame(so: SpaceObject, screenSize: Vec2): Vec2 {
  return {
    x: rndi(so.cameraPosition.x, so.cameraPosition.x + screenSize.x),
    y: rndi(so.cameraPosition.y, so.cameraPosition.y + screenSize.y)
  }
}

export function resetStars(game: Game | null) {
  if (!game) {
    error('game is null')
    return
  }
  game.stars.forEach((s) => {
    const r = randomPositionInCurrentViewFrame(game.localPlayer, getScreenFromCanvas(game.ctx))
    s.x = r.x
    s.y = r.y
  })
  info('reset stars')
}

export function initRegularGame(game: Game): void {
  if (game.isRunning()) {
    warn(`Game already running`)
    return
  }

  // game.clearBodies()
  game.reset()

  game.type = GameType.MultiPlayer
  if (!test()) {
    warn(`Test failed...`)
    return
  }

  loadingText('Loading...', game.ctx)
  initKeyControllers()
  initTouchControls()

  const offset = 500

  setCanvasSizeToClientViewFrame(game.ctx)

  //Local player init
  warn(`Resets local player position`)
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
  game.localPlayer.steeringPower = 1.5
  game.localPlayer.enginePower = 0.25
  game.localPlayer.color = randomAnyColor()
  game.localPlayer.photonColor = '#f0f'
  game.localPlayer.isLocal = true
  game.localPlayer.hitRadius = 120
  game.localPlayer.color = '#db8'
  game.localPlayer.worldSize = worldSize // server sends size of world
  game.localPlayer.cameraPosition = worldStartPosition
  game.localPlayer.viewFramePosition = rndfVec2(0, 0)
  game.localPlayer.position = rndfVec2(0, 0)
  // game.localPlayer.position = add2(getScreenCenterPosition(game.ctx), rndfVec2(-offset, offset))

  for (let i = 0; i < 400; i++) {
    // create starts
    const star = rndfVec2(0, 0)
    game.stars.push(star)
  }

  resetStars(game)

  function handleResize() {
    resetStars(game)
  }

  info(`sets up event listener for window resize`)
  removeEventListener("resize", handleResize);
  addEventListener("resize", handleResize);

  // game.stars.push(newVec2())
  // game.stars.push(smul2(worldSize, 0.5))

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
      } else if (su.dataObject.messageType === MessageType.CHAT_MESSAGE) {
        chatMessageHistory.update((previousMessages) => [
          ...previousMessages,
          { message: su.dataObject.lastMessage, timeDate: new Date(), user: su.dataObject },
        ])
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
    const remotePos = sub2(add2(so.viewFramePosition, so.cameraPosition), game.localPlayer.cameraPosition)
    if (so.shape === SpaceShape.Moon) {
      renderMoon(so, game.ctx)
    } else {
      if (so.health <= 0) {
        handleDeathExplosion(so, explosionDuration)
        if (!so.obliterated) {
          renderExplosionFrame(so, game.ctx, remotePos)
        }
        return
      } else {
        if (game.keyFuncMap.systemGraphs.keyStatus) {
          renderViewport(game.ctx, so)
        }

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
const every30 = new Every(60)

const cameraLagSize = 1
const cameraLag = vec2Array(cameraLagSize, 0, 0)

function last(arr: Vec2[]): Vec2 {
  return arr[arr.length - 1]
}

export function moveView(game: Game) {
  // bound ship to viewframe
  const center = getScreenCenterPosition(game.ctx)
  // const camBound = sub2(smul2(game.localPlayer.worldSize, 0.5), getScreenRect(game.ctx))
  // game.localPlayer.cameraPosition = add2(game.localPlayer.cameraPosition, game.localPlayer.velocity)
  // game.localPlayer.cameraPosition = vec2Bound(game.localPlayer.cameraPosition, camBound)
  const d = dist2(center, game.localPlayer.position)
  cameraLag.push(game.localPlayer.velocity)
  if (cameraLag.length > cameraLagSize) {
    game.localPlayer.viewFramePosition = add2(center, smul2(cameraLag[0], 5))
  }
  cameraLag.shift()
  // every30.tick(() => {
  //   console.log({ cameraLag, d })
  // })
}

export function renderFrame(game: Game, dt: number): void {
  every.tick(() => {
    game.localPlayer.viewport = getScreenRect(game.ctx)
    setCanvasSizeToClientViewFrame(game.ctx)
    const remotePlayers: SpaceObject[] = []

    game.remotePlayers.forEach((player) => {
      remotePlayers.push(player)
    })

    gameState.set({ scoreScreenData: { player: game.localPlayer, remotePlayers: remotePlayers, serverObjects: game.bodies } })
  })

  const ctx = game.ctx
  game.lightSource.position = game.localPlayer.position
  game.lightSource.direction = direction2(game.localPlayer.angleDegree)

  game.testShapes.forEach((s) => {
    s.render(ctx)
  })

  game.remotePlayers = handleRemotePlayers(game.remotePlayers, game)

  if (game.keyFuncMap.systemGraphs.keyStatus) {
    fpsCounter(ops, dt, game, ctx)
  }

  let objCount = 0
  game.remotePlayers.forEach((p) => {
    objCount += getRenderableObjectCount(p)
  })

  handleStarBackdrop(game)

  addDataPoint(renderObjBuf, objCount + getRenderableObjectCount(game.localPlayer))
  addDataPoint(ppsbuf, ops)
  addDataPoint(rxByteDataBuf, rxDataBytes)
  addDataPoint(speedbuf, 100 * magnitude2(game.localPlayer.velocity))
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

    renderInfoText(`packets/sec: ${ops}`, 450, ctx)
    renderInfoText(`packet symbol count: ${dataLen}`, 500, ctx)
    renderInfoText(`object key count: ${dataKeys}`, 550, ctx)
    renderInfoText(`sym/sec: ${symbolsPerSec}`, 600, ctx)
    renderInfoText(`rx byte speed: ${siPretty(byteSpeed, 'B/s')}`, 650, ctx)
    renderInfoText(`rx bit speed: ${siPretty(bitSpeed, 'bit/s')}`, 700, ctx)
    renderInfoText(`rx data: ${siPretty(rxDataBytes, 'B')}`, 750, ctx)

    // renderRoundIndicator()

    renderSpaceObjectStatusBar(game.remotePlayers, game.localPlayer, ctx)

    // Position info for debugging
    renderVec2(`camera: ${to_string2(game.localPlayer.cameraPosition)}`, add2(game.localPlayer.viewFramePosition, newVec2(-100, -100)), ctx, game.style)
    renderVec2(`view: ${to_string2(game.localPlayer.viewFramePosition)}`, add2(game.localPlayer.viewFramePosition, newVec2(200, -150)), ctx, game.style)
    renderVec2(`position: ${to_string2(game.localPlayer.position)}`, add2(game.localPlayer.viewFramePosition, newVec2(-400, -200)), ctx, game.style)
    renderVec2(
      `world: ${to_string2(add2(game.localPlayer.viewFramePosition, game.localPlayer.cameraPosition))}`,
      add2(game.localPlayer.viewFramePosition, newVec2(0, 100)),
      ctx,
      game.style
    )
    renderVec2(`velocity: ${to_string2(game.localPlayer.velocity)}`, add2(game.localPlayer.viewFramePosition, newVec2(300, 200)), ctx, game.style)
  }

  game.bodies.forEach((body) => {
    const bodyPos = sub2(add2(body.viewFramePosition, body.cameraPosition), smul2(game.localPlayer.cameraPosition, 1))
    if (body.health < 1) {
      handleDeathExplosion(body, explosionDuration)
      if (!body.obliterated) {
        renderExplosionFrame(body, ctx, bodyPos)
      }
    } else {
      // fix the body position in world relative to player...

      if (game.keyFuncMap.systemGraphs.keyStatus) {
        renderVec2(`camera: ${to_string2(body.cameraPosition)}`, add2(bodyPos, newVec2(-100, -100)), ctx, game.style)
      }

      renderMoon(body, ctx, bodyPos)
    }
  })

  game.bodies = game.bodies.filter((body) => {
    return !body.obliterated
  })

  game.all = game.all.filter((body) => {
    return !body.obliterated
  })

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
    if (game.keyFuncMap.systemGraphs.keyStatus) {
      renderShip(game.localPlayer, ctx, true, game.style, null, true)
    } else {
      renderShip(game.localPlayer, ctx, true, game.style)
    }
  }

  moveView(game)
}

function handleStarBackdrop(game: Game): void {
  // move star ref with inverted view frame position and factor
  for (let i = 0; i < game.stars.length; i++) {
    if (offScreen_mm(game.stars[i], game.localPlayer.cameraPosition, add2(game.localPlayer.cameraPosition, getScreenFromCanvas(game.ctx)))) {
      // just wrapping the stars looks better:
      // but this causes the stars to bunch up in a line or grid pattern after flying around some
      // so add some randomness when wrapping and regenerate them outside of the screen...
      const minRand = 0
      const maxRand = 500
      wrap_mm(
        game.stars[i],
        sub2(game.localPlayer.cameraPosition, rndfVec2(minRand, maxRand)),
        add2(add2(game.localPlayer.cameraPosition, getScreenFromCanvas(game.ctx)), rndfVec2(minRand, maxRand))
      )
    }

    const starpos = sub2(game.stars[i], smul2(game.localPlayer.cameraPosition, 1))
    renderPoint(game.ctx, starpos, game.style.starColor, screenScale * 1.5)
  }
}

export function nextFrame(game: Game, dt: number): void {
  if (!game.localPlayer.isDead) {
    spaceObjectKeyController(game.localPlayer, dt)
    spaceTouchController(game.localPlayer, dt)
  }

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

  game.remotePlayers = game.remotePlayers.filter((so) => {
    return so.online || so.isLocal
  })

  const currentSpaceObjects = game.all.concat(game.remotePlayers)

  handleCollisions(game.localPlayer.cameraPosition, currentSpaceObjects, game.ctx)
}
