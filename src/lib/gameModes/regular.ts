import type { Game } from "../game"
import { setCanvasSize, getScreenRect, getScreenCenterPosition } from "../canvas_util"
import { initKeyControllers, spaceObjectKeyController } from "../input"
import { add, direction, magnitude, rndfVec2d, rndi, round2dec, sub } from "../math"
import { bounceSpaceObject, handleDeathExplosion } from "../mechanics"
import { friction, gravity, handleCollisions } from "../physics"
import { renderMoon, renderExplosionFrame, renderShip, renderSpaceObjectStatusBar, loadingText, renderViewport, renderInfoText } from "../render"
import { fpsCounter } from "../time"
import { GameType, getRenderableObjectCount, SpaceShape, type ServerUpdate, type SpaceObject } from "../types"
import { getSerVer, initMultiplayer, registerServerUpdate } from "../webSocket"
import { randomAnyColor } from "../color"
import { test } from "../test"
import { explosionDuration } from "../constants"
import { addDataPoint, getLatestValue, GRAPHS, msPretty, newDataStats, renderGraph, type DataStats } from "../stats"
import { createSpaceObject, newPhotonLaser, reduceShotSize, reduceSoSize } from "../factory"

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

dataTest.baseUnit = "B"
dataTest.label = "Reduced So Size"

soSize.baseUnit = "B"
soSize.label = "SpaceObject Size"

shotSize.baseUnit = "B"
shotSize.label = "Shot size"

speedbuf.baseUnit = "m/s"
speedbuf.accUnit = "m"
speedbuf.label = "Speed"
// speedbuf.maxSize = 500

hpbuf.baseUnit = "hp"
hpbuf.label = "Hp"
// hpbuf.maxSize = 1000

// symbuf.maxSize = 500
packetSizeBuf.baseUnit = "B"
packetSizeBuf.label = "Packet"

rxByteDataBuf.baseUnit = "B"
rxByteDataBuf.label = "Data downloaded"
// rxByteDataBuf.maxSize = 1000

ppsbuf.baseUnit = "pps"
ppsbuf.label = "Packets/sec"
// ppsbuf.maxSize = 1000

// renderObjBuf.maxSize = 2000
renderObjBuf.baseUnit = "obj"
renderObjBuf.label = "Obj/frame"

timebuf.baseUnit = "s"
timebuf.prettyPrint = msPretty
timebuf.maxSize = 60
timebuf.label = "Time"

downloadBuf.label = "Download"
downloadBuf.baseUnit = "bit/s"
downloadBuf.accUnit = "bit"
downloadBuf.maxSize = 60

batbuf.label = "Battery"
batbuf.baseUnit = "%"

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

  loadingText("Loading...", game.ctx)
  initKeyControllers()

  const offset = 500

  game.localPlayer.position = add(getScreenCenterPosition(game.ctx), rndfVec2d(-offset, offset))

  //Local player init
  game.reset()
  game.localPlayer.mass = 0.1
  game.localPlayer.missileDamage = 5
  game.localPlayer.angleDegree = -120
  game.localPlayer.health = 100
  game.localPlayer.batteryLevel = 500
  game.localPlayer.steeringPower = 1.6
  game.localPlayer.enginePower = 0.25
  game.localPlayer.name = `P-${rndi(0, 900000)}`
  game.localPlayer.color = randomAnyColor()
  game.localPlayer.photonColor = "#f0f"
  game.localPlayer.isLocal = true
  game.localPlayer.hitRadius = 50

  console.log("Your ship name is: " + game.localPlayer.name + "\nAnd your color is: " + game.localPlayer.color)

  initMultiplayer()

  // const padding = 0
  // const pad = { x: padding, y: padding }
  // const scr = sub(getScreenRect(game.ctx), pad)

  const bodies: SpaceObject[] = []

  // game.remotePlayers = []
  game.all = game.all.concat(bodies)
  game.all.push(game.localPlayer)

  let startTime = 0

  registerServerUpdate((su: ServerUpdate) => {
    const so: SpaceObject = su.spaceObject
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
        }

        // Store every previously shots fired
        const cachePhotonLasers = game.remotePlayers[i].shotsInFlight

        // update the remote player data object
        game.remotePlayers[i] = so

        // Makes sure to return the previously shots fired on the copy of remote player
        game.remotePlayers[i].shotsInFlight = game.remotePlayers[i].shotsInFlight.concat(cachePhotonLasers)

        return
        // if (so.sessionId === game.localPlayer.sessionId) {
        //   game.remotePlayers[i] = so
        //   return
        // }
      }
    }
    if (so.name !== game.localPlayer.name && so.sessionId === game.localPlayer.sessionId) {
      game.remotePlayers.push(so)
      console.log(`New ship online: ${so.name}`)
    }
  })
}

function handleRemotePlayers(remotes: SpaceObject[], ctx: CanvasRenderingContext2D): SpaceObject[] {
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
      renderMoon(so, ctx)
    } else {
      if (so.health <= 0) {
        handleDeathExplosion(so, explosionDuration)
        if (!so.obliterated) {
          renderExplosionFrame(so, ctx)
        }
        return
      } else {
        renderViewport(ctx, so)
        renderShip(so, ctx, false)
      }
    }
  })

  return stillPlaying
}

export function renderFrame(game: Game, dt: number): void {
  const ctx = game.ctx
  setCanvasSize(game.ctx)
  game.localPlayer.viewport = getScreenRect(game.ctx)
  game.lightSource.position = game.localPlayer.position
  game.lightSource.direction = direction(game.localPlayer.angleDegree)

  game.remotePlayers = handleRemotePlayers(game.remotePlayers, ctx)

  // renderSpaceObjectStatusBar(game.remotePlayers, game.localPlayer, ctx)
  fpsCounter(ops, dt, getSerVer(), ctx)

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
  addDataPoint(shotSize, new TextEncoder().encode(JSON.stringify(Object.values(reduceShotSize(newPhotonLaser())))).length)
  addDataPoint(soSize, new TextEncoder().encode(JSON.stringify(createSpaceObject())).length)
  addDataPoint(dataTest, new TextEncoder().encode(JSON.stringify(reduceSoSize(createSpaceObject()))).length)

  GRAPHS.forEach((g, i) => {
    renderGraph(g, { x: 310, y: 110 + i * 142 }, { x: 200, y: 84 }, ctx)
  })

  game.bodies.forEach((body) => {
    renderMoon(body, ctx)
  })

  if (game.localPlayer.health <= 0) {
    //Local player is dead
    game.localPlayer.isDead = true

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
    renderShip(game.localPlayer, ctx, true)
  }
}

export function nextFrame(game: Game, dt: number): void {
  if (!game.localPlayer.isDead) {
    spaceObjectKeyController(game.localPlayer, dt)
  }
  bounceSpaceObject(game.localPlayer, getScreenRect(game.ctx), 0.5, 0, 0)
  friction(game.localPlayer)

  if (game.remotePlayers.length === 0) {
    ops = 0
    dataKeys = 0
    dataLen = 0
    symbolsPerSec = 0
    byteSpeed = 0
    bitSpeed = 0
  }

  // game.bodies.forEach((body) => {
  //   game.bodies.forEach((other) => {
  //     if (body !== other) {
  //       gravity(body, other)
  //     }
  //   })

  //   gravity(body, game.localPlayer)

  //   game.localPlayer.shotsInFlight.forEach((shot) => {
  //     gravity(body, shot)
  //   })

  //   friction(body)
  //   bounceSpaceObject(body, getScreenRect(game.ctx), 0.4, 0, 0)
  // })

  game.remotePlayers = game.remotePlayers.filter((so) => {
    return so.online || so.isLocal
  })

  const currentSpaceObjects = game.all.concat(game.remotePlayers)

  handleCollisions(currentSpaceObjects, game.ctx)
}
