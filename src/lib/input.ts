import type { GameModeHotkeys, GameState, KeyFunction, KeyFunctionMap, KeyFunctionStore, SpaceObject, TouchFunctionMap } from './interface'
import { applyEngineThrust, applySteer, fire } from './mechanics'
import { timeScale } from './constants'
import { dist2, newVec2, type Vec2 } from 'mathil'
import { writable, type Writable } from 'svelte/store'
import { menuOpen } from '../components/menu/MenuStore'
import { GameMode } from './interface'

export const activeHotKeys: Writable<KeyFunctionStore[]> = writable()
export const gameState: Writable<GameState> = writable()

export const savedHotkeysStore: Writable<GameModeHotkeys> = writable()
let savedHotkeys: GameModeHotkeys
savedHotkeysStore.subscribe((v) => (savedHotkeys = v))

export const DefaultSpaceModeKeyMap: KeyFunctionMap = {
  thrust: { activators: ['w', 'ArrowUp'], keyStatus: false, displayText: 'Thrust' },
  reverseThrust: { activators: ['s', 'ArrowDown'], keyStatus: false, displayText: 'Reverse Thrust' },
  boost: { activators: ['b'], keyStatus: false, displayText: 'Boost' },
  halt: { activators: ['h'], keyStatus: false, toggle: true, displayText: 'Halt' },
  turnLeft: { activators: ['a', 'ArrowLeft'], keyStatus: false, displayText: 'Turn Left' },
  turnRight: { activators: ['d', 'ArrowRight'], keyStatus: false, displayText: 'Turn Right' },
  strafeLeft: { activators: ['q', 'PageUp'], keyStatus: false, displayText: 'Strafe Left' },
  strafeRight: { activators: ['e', 'PageDown'], keyStatus: false, displayText: 'Strafe Right' },
  fire: { activators: [' '], keyStatus: false, displayText: 'Fire' },
  reload: { activators: ['r'], keyStatus: false, displayText: 'Reload' },
  selfDestroy: { activators: ['k'], keyStatus: false, displayText: 'Self Destroy' },
  systemGraphs: { activators: ['g'], keyStatus: false, toggle: true, displayText: 'System Graphs' },
  leaderBoard: {
    activators: ['p'],
    keyStatus: false,
    store: false,
    toggle: true,
    displayText: 'Leader Board',
  },
  hotKeys: {
    activators: ['o'],
    keyStatus: false,
    store: false,
    toggle: true,
    displayText: 'Hot Keys',
  },
  shipSettings: {
    activators: ['i'],
    keyStatus: false,
    store: false,
    toggle: true,
    displayText: 'Ship Settings',
  },
  shipDetails: {
    activators: ['y'],
    keyStatus: false,
    store: false,
    toggle: true,
    displayText: 'Ship Details',
  },
  chat: {
    activators: ['c'],
    keyStatus: true,
    store: true,
    toggle: true,
    displayText: 'Chat',
  },
  menu: {
    activators: ['Escape'],
    keyStatus: false,
    store: false,
    toggle: true,
    displayText: 'Menu',
  },
  jump: {
    activators: ['j'],
    keyStatus: false,
    store: false,
    toggle: false,
    displayText: 'Jump',
  },
  changeMode: {
    activators: ['m'],
    keyStatus: false,
    store: false,
    toggle: false,
    displayText: 'Change Mode',
  },
  tractorBeam: {
    activators: ['t'],
    keyStatus: false,
    store: false,
    toggle: true,
    displayText: 'Tractor Beam',
  },
  name: 'DefaultSpace',
}

export const DefaultArcadeModeKeyMap: KeyFunctionMap = {
  thrust: { activators: ['w', 'ArrowUp'], keyStatus: false, displayText: 'Thrust' },
  reverseThrust: { activators: ['s', 'ArrowDown'], keyStatus: false, displayText: 'Reverse Thrust' },
  boost: { activators: ['b'], keyStatus: false, displayText: 'Boost' },
  halt: { activators: ['h'], keyStatus: false, toggle: true, displayText: 'Halt' },
  turnLeft: { activators: ['a', 'ArrowLeft'], keyStatus: false, displayText: 'Turn Left' },
  turnRight: { activators: ['d', 'ArrowRight'], keyStatus: false, displayText: 'Turn Right' },
  strafeLeft: { activators: ['q', 'PageUp'], keyStatus: false, displayText: 'Strafe Left' },
  strafeRight: { activators: ['e', 'PageDown'], keyStatus: false, displayText: 'Strafe Right' },
  fire: { activators: ['ctrl'], keyStatus: false, displayText: 'Fire' },
  reload: { activators: ['r'], keyStatus: false, displayText: 'Reload' },
  selfDestroy: { activators: ['k'], keyStatus: false, displayText: 'Self Destroy' },
  systemGraphs: { activators: ['g'], keyStatus: false, toggle: true, displayText: 'System Graphs' },
  leaderBoard: {
    activators: ['p'],
    keyStatus: false,
    store: false,
    toggle: true,
    displayText: 'Leader Board',
  },
  hotKeys: {
    activators: ['o'],
    keyStatus: false,
    store: false,
    toggle: true,
    displayText: 'Hot Keys',
  },
  shipSettings: {
    activators: ['i'],
    keyStatus: false,
    store: false,
    toggle: true,
    displayText: 'Ship Settings',
  },
  shipDetails: {
    activators: ['y'],
    keyStatus: false,
    store: false,
    toggle: true,
    displayText: 'Ship Details',
  },
  chat: {
    activators: ['c'],
    keyStatus: true,
    store: true,
    toggle: true,
    displayText: 'Chat',
  },
  menu: {
    activators: ['Escape'],
    keyStatus: false,
    store: false,
    toggle: true,
    displayText: 'Menu',
  },
  jump: {
    activators: [' '],
    keyStatus: false,
    store: false,
    toggle: false,
    displayText: 'Jump',
  },
  changeMode: {
    activators: ['m'],
    keyStatus: false,
    store: false,
    toggle: false,
    displayText: 'Change Mode',
  },
  tractorBeam: {
    activators: ['t'],
    keyStatus: false,
    store: false,
    toggle: true,
    displayText: 'Tractor Beam',
  },
  name: 'DefaultArcade',
}

const DefaultTouchMap: TouchFunctionMap = {
  thrust: false,
  reverseThrust: false,
  fire: false,
  menu: false,
}

// Input helper functions
export function keyDisplayName(key: string) {
  if (key === ' ') return 'Spacebar'

  // Making sure to return first letter as uppercased
  return key.charAt(0).toUpperCase() + key.substring(1)
}

export function capitalFirstChar(str: string) {
  if (str.length === 0) return str
  if (str.length === 1) return str.charAt(0).toUpperCase()
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const ActiveKeyMapStore: Writable<KeyFunctionMap> = writable(DefaultSpaceModeKeyMap)
const ActiveTouch: TouchFunctionMap = DefaultTouchMap

let ActiveKeyMap: KeyFunctionMap

ActiveKeyMapStore.subscribe((v) => (ActiveKeyMap = v))

export function setKeyStateStore() {
  ActiveKeyMapStore.set(ActiveKeyMap)
  activeHotKeys.set(keyFuncArrayFromKeyFunctionMap(ActiveKeyMap))
}

setKeyStateStore()

export function getKeyBindings(): KeyFunction[] {
  return keyFuncArrayFromKeyFunctionMap(ActiveKeyMap)
}

export function keyFuncArrayFromKeyFunctionMap(kfm: KeyFunctionMap) {
  const keyValues: KeyFunctionStore[] = []
  Object.values(kfm).forEach((value) => {
    if (typeof value !== 'string') {
      keyValues.push(value)
    }
  })
  return keyValues
}

function arrowControl(e: KeyboardEvent, keyUseState: boolean) {
  Object.values(ActiveKeyMap).forEach((keyFunction: KeyFunctionStore) => {
    if (typeof keyFunction !== 'string') {
      keyFunction.activators.map((activator: string) => {
        if (activator === e.key) {
          if (keyFunction.toggle && keyUseState && e.type === 'keydown') {
            keyFunction.keyStatus = !keyFunction.keyStatus
          } else if (!keyFunction.toggle) {
            keyFunction.keyStatus = keyUseState
          }

          keyFunction.store = keyFunction.keyStatus
        }
      })
    }
  })
  setKeyStateStore()
}

function resetState() {
  Object.values(ActiveKeyMap).forEach((keyFunction: KeyFunction | string) => {
    if (typeof keyFunction !== 'string') {
      keyFunction.keyStatus = false
    }
  })
}

function reloadSpaceObject(so: SpaceObject) {
  // so.canonCoolDown = 0
  so.ammo = 5000
  so.health = 10000
  so.startHealth = so.health
  so.batteryLevel = 1000
  so.batteryCapacity = 1000
  so.booster = 5
  // so.missileDamage = 20
  // so.missileSpeed = 20
  // so.inverseFireRate = 2
  // so.shotsPerFrame = 2
  so.armedDelay = 0
}

export function arcadeModeKeyController(so: SpaceObject, dt = 1) {
  if (ActiveKeyMap.turnRight.keyStatus) {
    so.characterGlobalPosition.x += 1 * dt
    so.acceleration.x = 0.0005 * dt
  }

  if (ActiveKeyMap.turnLeft.keyStatus) {
    so.characterGlobalPosition.x -= 1 * dt
    so.acceleration.x = -0.0005 * dt
  }

  if (ActiveKeyMap.jump.keyStatus) {
    if (!so.isJumping) {
      so.isJumping = true
      so.acceleration.y = -2.3
      so.characterGlobalPosition.y -= 1
    }
  }

  if (ActiveKeyMap.changeMode.keyStatus) {
    console.log(ActiveKeyMap.changeMode.keyStatus)

    ActiveKeyMap.changeMode.keyStatus = false
    so.gameMode = GameMode.SPACE_MODE
    if (savedHotkeys?.spaceMode) {
      ActiveKeyMapStore.set(savedHotkeys.spaceMode)
      activeHotKeys.set(keyFuncArrayFromKeyFunctionMap(savedHotkeys.spaceMode))
    } else {
      ActiveKeyMapStore.set(DefaultSpaceModeKeyMap)
      activeHotKeys.set(keyFuncArrayFromKeyFunctionMap(DefaultSpaceModeKeyMap))
    }
  }
}

export function spaceObjectKeyController(so: SpaceObject, dt = 1) {
  const dts: number = dt * timeScale

  if (ActiveKeyMap.changeMode.keyStatus) {
    ActiveKeyMap.changeMode.keyStatus = false
    so.gameMode = GameMode.ARCADE_MODE
    if (savedHotkeys?.arcadeMode) {
      ActiveKeyMapStore.set(savedHotkeys.arcadeMode)
      activeHotKeys.set(keyFuncArrayFromKeyFunctionMap(savedHotkeys.arcadeMode))
    } else {
      ActiveKeyMapStore.set(DefaultArcadeModeKeyMap)
      activeHotKeys.set(keyFuncArrayFromKeyFunctionMap(DefaultArcadeModeKeyMap))
    }
  }

  if (ActiveKeyMap.halt.keyStatus) {
    so.velocity = { x: 0, y: 0 }
    so.acceleration = { x: 0, y: 0 }
  }

  if (ActiveKeyMap.reload.keyStatus) {
    reloadSpaceObject(so)
  }

  if (ActiveKeyMap.boost.keyStatus) {
    applyEngineThrust(so, 0, true)
  }

  //Mockingbird the status for thrusters
  so.afterBurner = ActiveKeyMap.thrust.keyStatus

  if (ActiveKeyMap.thrust.keyStatus) {
    applyEngineThrust(so, 0)
  }

  if (ActiveKeyMap.reverseThrust.keyStatus) {
    applyEngineThrust(so, 180)
  }

  if (ActiveKeyMap.strafeLeft.keyStatus) {
    applyEngineThrust(so, -90)
  }

  if (ActiveKeyMap.strafeRight.keyStatus) {
    applyEngineThrust(so, 90)
  }

  if (ActiveKeyMap.turnRight.keyStatus) {
    applySteer(so, 1, dts)
  }

  if (ActiveKeyMap.turnLeft.keyStatus) {
    applySteer(so, -1, dts)
  }

  if (ActiveKeyMap.fire.keyStatus) {
    fire(so)
  }
  if (ActiveKeyMap.selfDestroy.keyStatus) {
    so.health = 0
    so.isDead = true
  }
}

function keydownArrowControl(event: KeyboardEvent) {
  arrowControl(event, true)
}

function keyupArrowControl(event: KeyboardEvent) {
  arrowControl(event, false)
}

export function initKeyControllers(): void {
  document.addEventListener('keydown', keydownArrowControl)
  document.addEventListener('keyup', keyupArrowControl)
}

export function removeKeyControllers(): void {
  resetState()
  document.removeEventListener('keydown', keydownArrowControl)
  document.removeEventListener('keyup', keyupArrowControl)
}

export function getMousePosition(canvas: HTMLCanvasElement, mouseEvent: MouseEvent): Vec2 {
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height

  return {
    x: (mouseEvent.clientX - rect.left) * scaleX,
    y: (mouseEvent.clientY - rect.top) * scaleY,
  }
}
export function initTouchControls() {
  document.addEventListener('touchstart', touchStartHandler)
  document.addEventListener('touchend', touchEndHandler)
  document.addEventListener('touchmove', touchMoveHandler)
}
export function removeTouchControls() {
  document.removeEventListener('touchstart', touchStartHandler)
  document.removeEventListener('touchend', touchEndHandler)
  document.removeEventListener('touchmove', touchMoveHandler)
}

export function spaceTouchController(so: SpaceObject) {
  if (ActiveTouch.thrust) {
    applyEngineThrust(so, 0, false)
  }

  if (ActiveTouch.reverseThrust) {
    applyEngineThrust(so, 180)
  }

  if (ActiveTouch.fire) {
    fire(so)
  }

  if (ActiveTouch.menu) {
    menuOpen.set(true)
    ActiveTouch.menu = false
  }
}

interface TouchAreas {
  Thrust: Vec2
  ReverseThrust: Vec2
  Fire: Vec2
  Menu: Vec2
}

let touchPos: Vec2 = { x: 0, y: 0 }

const touchPoints: TouchAreas = {
  Thrust: newVec2(90, 90),
  ReverseThrust: newVec2(70, 90),
  Fire: newVec2(20, 90),
  Menu: newVec2(50, 0),
}

function setTouchPos(pos: Vec2): void {
  const windowSize: Vec2 = { x: window.innerWidth, y: window.innerHeight }

  const touchPosition: Vec2 = {
    x: (pos.x / windowSize.x) * 100,
    y: (pos.y / windowSize.y) * 100,
  }

  touchPos = touchPosition
}

function touchStartHandler(event: TouchEvent) {
  const touches = event.touches

  //Handle multi-touch scenarios here if needed
  for (let i = 0; i < touches.length; i++) {
    const touch = touches[i]

    setTouchPos({ x: touch.clientX, y: touch.clientY })
    handleTouch()
  }
}

function touchEndHandler(event: TouchEvent) {
  const touches = event.changedTouches

  // Handle touch end
  for (let i = 0; i < touches.length; i++) {
    ActiveTouch.thrust = false
    ActiveTouch.reverseThrust = false
    ActiveTouch.fire = false
  }
}

function touchMoveHandler(event: TouchEvent) {
  const touches = event.touches

  // Handle touch move
  for (let i = 0; i < touches.length; i++) {
    const touch = touches[i]
    console.log('moving')
    setTouchPos({ x: touch.clientX, y: touch.clientY })
    handleTouch()
  }
}

function resetActiveTouch() {
  ActiveTouch.reverseThrust = false
  ActiveTouch.thrust = false
  ActiveTouch.fire = false
}

function handleTouch() {
  resetActiveTouch()

  console.log(touchPos)

  if (dist2(touchPos, touchPoints.Thrust) < 10) {
    ActiveTouch.thrust = true
  }

  if (dist2(touchPos, touchPoints.ReverseThrust) < 10) {
    ActiveTouch.reverseThrust = true
  }
  if (dist2(touchPos, touchPoints.Fire) < 10) {
    ActiveTouch.fire = true
  }

  if (dist2(touchPos, touchPoints.Menu) < 15) {
    ActiveTouch.menu = true
  }
}
