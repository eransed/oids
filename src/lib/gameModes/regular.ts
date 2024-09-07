import type { Game } from '../game'
import { setCanvasSizeToClientViewFrame, getScreenRect, getScreenFromCanvas } from '../canvas_util'
import { ActiveKeyMapStore, arcadeModeKeyController, gameState, initKeyControllers, initTouchControls, spaceObjectKeyController, spaceTouchController } from '../input'
import { add2, info, log, magnitude2, newVec2, rndfVec2, rndi, round2dec, siPretty, to_string2, type Vec2, warn, error } from 'mathil'
import { handleDeathExplosion } from '../mechanics'
import { friction, getRemotePosition } from '../physics/physics'
import { loadingText, renderHitRadius, renderInfoText, renderLine } from '../render/render2d'
import { Every, fpsCounter } from '../time'
import { GameType, getRenderableObjectCount, type SpaceObject, MessageType, type ServerUpdate, GameMode, type KeyFunctionMap } from '../interface'
import { test } from '../test'
import { explosionDuration, worldSize, worldStartPosition } from '../constants'
import { addDataPoint, getLatestValue, GRAPHS, msPretty, newDataStats, renderGraph } from '../stats'
import { newPhotonLaser } from '../factory'
import { reduceShotSize } from '../websocket/util'
import { renderMoon } from '../render/renderMoon'
import { renderShip } from '../render/renderShip'
import { renderProgressBar, renderSpaceObjectStatusBar, renderVec2, renderViewport } from '../render/renderUI'
import { renderExplosionFrame } from '../render/renderFx'
import { localPlayerStore } from '../../stores/stores'
import { spaceObjectUpdateAndShotReciverOptimizer } from '../websocket/shotOptimizer'
import { getCurrentTheme } from '../../style/defaultColors'
import { handleCollisions } from '../physics/handleCollisions'
import { renderTrail } from '../render/renderShipTrail'
import { renderCharacter } from '../render/renderCharacter'
import { handleShipUpdate } from './handlers/incomingDataHandlers/handleShipUpdate'
import { handleServerInformationUpdate } from './handlers/incomingDataHandlers/handleServerInformationUpdate'
import { handleChatUpdate } from './handlers/incomingDataHandlers/handleChatUpdate'
import { exists } from './handlers/incomingDataHandlers/handleNpcUpdate'
import { handleStarBackdrop } from './handlers/handleStarBackDrop'
import { handleMoveView } from './handlers/handleMoveView'
import { handleLocalPlayer, initLocalPlayer } from './handlers/handleLocalPlayer'
import { handleGameBodies } from './handlers/handleGameBodies'
import { handleRemotePlayers } from './handlers/handleRemotePlayers'
import { renderRemotePlayerInSpaceMode } from '../render/renderRemotePlayers'
import { initNetworkStats } from './handlers/handleNetStats'
//Stores

let activeKeyMap: KeyFunctionMap

ActiveKeyMapStore.subscribe((v) => {
  activeKeyMap = v
})

let numberOfServerObjects = 0
let ops = 0
let dataLen = 0
let dataKeys = 0
let symbolsPerSec = 0
let byteSpeed = 0
let bitSpeed = 0
let rxDataBytes = 0
let bytesRecievedLastSecond = 0
let startTime = 0

const symbolByteSize = 2
const byteSize = 8
const angularVelocityGraph = newDataStats()
const ammoGraph = newDataStats()
const dataTest = newDataStats()
const soSize = newDataStats()
const shotSize = newDataStats()
const speedbuf = newDataStats()
const hpbuf = newDataStats()
const packetSizeBuf = newDataStats()
const rxByteDataBuf = newDataStats()
const ppsbuf = newDataStats()
const renderObjBuf = newDataStats()
const timebuf = newDataStats()
const downloadBuf = newDataStats()
const batbuf = newDataStats()

// const packetSize = newDataStats()
// packetSize.maxSize = 1000
// packetSize.baseUnit = 'B'

function randomPositionInCurrentViewFrame(so: SpaceObject, screenSize: Vec2): Vec2 {
  return {
    x: rndi(so.cameraPosition.x, so.cameraPosition.x + screenSize.x),
    y: rndi(so.cameraPosition.y, so.cameraPosition.y + screenSize.y),
  }
}

export function resetStars(game: Game | null) {
  if (!game) {
    error('game is null')
    return
  }

  setTimeout(() => {
    game.stars.forEach((s) => {
      const r = randomPositionInCurrentViewFrame(game.localPlayer, getScreenFromCanvas(game.ctx))

      s.position.x = r.x
      s.position.y = r.y
    })
  }, 250)
  info('reset stars')
}

export function initRegularGame(game: Game): void {
  if (game.isRunning()) {
    warn(`Game already running`)
    return
  }

  game.reset()

  game.type = GameType.MultiPlayer
  if (!test()) {
    warn(`Test failed...`)
    return
  }

  loadingText('Loading...', game.ctx)
  initKeyControllers()
  initTouchControls()
  initNetworkStats(angularVelocityGraph, ammoGraph, dataTest, soSize, shotSize, speedbuf, hpbuf, packetSizeBuf, rxByteDataBuf, ppsbuf, renderObjBuf, timebuf, downloadBuf, batbuf)

  setCanvasSizeToClientViewFrame(game.ctx)

  //Local player init
  initLocalPlayer(game)

  for (let i = 0; i < 400; i++) {
    // create stars
    const star = { position: rndfVec2(0, 0), speedFactor: 1, size: rndi(2, 5) }
    game.stars.push(star)
  }

  console.log('Your ship name is: ' + game.localPlayer.name + '\nAnd your color is: ' + game.localPlayer.color)

  game.all = game.all.concat(game.bodies)
  game.all.push(game.localPlayer)
  game.serverVersion = game.localPlayer.serverVersion

  info('Setting game socket listener...')

  function handleNetworkStatisticUpdates(su: ServerUpdate<SpaceObject>) {
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
  }

  function handleGameUpdate(su: ServerUpdate<SpaceObject>) {
    const so: SpaceObject = su.dataObject
    handleNetworkStatisticUpdates(su)
    for (let i = 0; i < game.remotePlayers.length; i++) {
      if (so.name === game.remotePlayers[i].name) {
        if (!so.online) {
          console.log(`${so.name} went offline`)
          game.remotePlayers.splice(i)
          continue
        }

        game.remotePlayers[i] = spaceObjectUpdateAndShotReciverOptimizer(so, game.remotePlayers[i])

        return
      }
    }
    if (so.name !== game.localPlayer.name) {
      game.remotePlayers.push(so)
      log(`New ship online: ${so.name}`)
    }
  }

  function playerUpdate(so: ServerUpdate<SpaceObject>) {
    switch (so.dataObject.messageType) {
      case MessageType.SHIP_UPDATE:
        handleShipUpdate(so)
        break
      case MessageType.SERVICE:
        handleServerInformationUpdate(so, game)
        break
      case MessageType.CHAT_MESSAGE:
        handleChatUpdate(so)
        break
      default:
        if (so.dataObject) {
          handleGameUpdate(so)
        }
        break
    }
  }

  function handleNpcUpdate(npcUpdate: ServerUpdate<SpaceObject>) {
    // this is the handler for non spaceobjects (npc) ex asteroids created on the server.
    if (!exists(npcUpdate.dataObject, game.bodies)) {
      // info(`Adding ${su.dataObject.name}`)
      game.bodies.push(npcUpdate.dataObject)
    } else {
      game.bodies.forEach((b, i) => {
        game.bodies[i] = spaceObjectUpdateAndShotReciverOptimizer(npcUpdate.dataObject, game.bodies[i])
      })
    }
  }

  game.websocket.addListener(playerUpdate, handleNpcUpdate)
}

const every = new Every(25)

export function renderFrame(game: Game, dt: number): void {
  // Heads up stuff

  every.tick(() => {
    game.localPlayer.viewport = getScreenRect(game.ctx)
    setCanvasSizeToClientViewFrame(game.ctx)
    const remotePlayers: SpaceObject[] = []

    game.remotePlayers.forEach((player) => {
      remotePlayers.push(player)
    })

    localPlayerStore.update((s) => ({ ...s, ship: s.ship }))

    gameState.set({
      scoreScreenData: {
        player: game.localPlayer,
        remotePlayers: remotePlayers,
        serverObjects: game.bodies,
      },
    })
  })

  if (activeKeyMap.systemGraphs.keyStatus) {
    fpsCounter(ops, dt, game, game.ctx)
  }

  if (game.localPlayer.gameMode === GameMode.ARCADE_MODE) {
    // Render arcade style game
    renderCharacter(game.localPlayer, game.ctx)
  } else {
    // Render space style game
    handleStarBackdrop(game)
    game.remotePlayers = handleRemotePlayers(game.remotePlayers)
    renderRemotePlayerInSpaceMode(game.remotePlayers, game, activeKeyMap)
    handleGameBodies(game, activeKeyMap)
    handleLocalPlayer(game, activeKeyMap)
  }

  // Stats - G
  let objCount = 0
  game.remotePlayers.forEach((p) => {
    objCount += getRenderableObjectCount(p)
  })

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
    // addDataPoint(soSize, new TextEncoder().encode(JSON.stringify(game.localPlayer)).length)
    // addDataPoint(dataTest, new TextEncoder().encode(JSON.stringify(reduceSoSize(game.localPlayer))).length)
  } catch (e) {
    warn(`${e}`)
  }

  if (activeKeyMap.systemGraphs.keyStatus) {
    GRAPHS.forEach((g, i) => {
      const half = Math.floor(GRAPHS.length / 2)
      const h = 130
      const w = 250
      const space = 200
      const startx = 110
      if (i < half) renderGraph(g, { x: 400, y: startx + i * space }, { x: w, y: h }, game.ctx)
      else renderGraph(g, { x: 1300, y: startx + (i - half) * space }, { x: w, y: h }, game.ctx)
    })

    renderInfoText(`packets/sec: ${ops}`, 450, game.ctx)
    renderInfoText(`packet symbol count: ${dataLen}`, 500, game.ctx)
    renderInfoText(`object key count: ${dataKeys}`, 550, game.ctx)
    renderInfoText(`sym/sec: ${symbolsPerSec}`, 600, game.ctx)
    renderInfoText(`rx byte speed: ${siPretty(byteSpeed, 'B/s')}`, 650, game.ctx)
    renderInfoText(`rx bit speed: ${siPretty(bitSpeed, 'bit/s')}`, 700, game.ctx)
    renderInfoText(`rx data: ${siPretty(rxDataBytes, 'B')}`, 750, game.ctx)

    renderSpaceObjectStatusBar(game.remotePlayers, game.localPlayer, game.ctx)

    // Position info for debugging
    renderVec2(`camera: ${to_string2(game.localPlayer.cameraPosition)}`, add2(game.localPlayer.viewFramePosition, newVec2(-100, -100)), game.ctx, game.style)
    renderVec2(`view: ${to_string2(game.localPlayer.viewFramePosition)}`, add2(game.localPlayer.viewFramePosition, newVec2(200, -150)), game.ctx, game.style)
    renderVec2(`position: ${to_string2(game.localPlayer.position)}`, add2(game.localPlayer.viewFramePosition, newVec2(-400, -200)), game.ctx, game.style)
    renderVec2(`world: ${to_string2(add2(game.localPlayer.viewFramePosition, game.localPlayer.cameraPosition))}`, add2(game.localPlayer.viewFramePosition, newVec2(0, 100)), game.ctx, game.style)
    renderVec2(`velocity: ${to_string2(game.localPlayer.velocity)}`, add2(game.localPlayer.viewFramePosition, newVec2(300, 200)), game.ctx, game.style)
  }
}

export function nextFrame(game: Game, dt: number): void {
  if (!game.localPlayer.isDead) {
    if (game.localPlayer.gameMode === GameMode.SPACE_MODE) {
      spaceObjectKeyController(game.localPlayer, dt)
      spaceTouchController(game.localPlayer)
    } else {
      arcadeModeKeyController(game.localPlayer, dt)
      // arcadeTouchController(game.localPlayer, dt)
    }
  }

  friction(game.localPlayer)

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

  const currentSpaceObjects = game.all.concat(game.remotePlayers).concat(game.bodies)

  handleCollisions(game.localPlayer.cameraPosition, currentSpaceObjects, game.ctx)
}
