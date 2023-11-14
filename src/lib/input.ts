import type { GameState, KeyFunction, KeyFunctionMap, KeyFunctionStore, SpaceObject, TouchFunctionMap } from './interface'
import { applyEngineThrust, applySteer, fire } from './mechanics'
import { timeScale } from './constants'
import { dist2, newVec2, round2, round2dec, type Vec2 } from 'mathil'
import { writable, type Writable } from 'svelte/store'
import { menuOpen } from '../components/menu/MenuStore'
import { game } from '../pages/GamePage/components/Game/Utils/mainGame'

export const activeKeyStates: Writable<KeyFunction[]> = writable()
export const gameState: Writable<GameState> = writable()

const DefaultKeyMap: KeyFunctionMap = {
  thrust: { activators: ['w', 'ArrowUp'], keyStatus: false },
  reverseThrust: { activators: ['s', 'ArrowDown'], keyStatus: false },
  boost: { activators: ['b'], keyStatus: false },
  halt: { activators: ['h'], keyStatus: false, toggle: true },
  turnLeft: { activators: ['a', 'ArrowLeft'], keyStatus: false },
  turnRight: { activators: ['d', 'ArrowRight'], keyStatus: false },
  strafeLeft: { activators: ['q', 'PageUp'], keyStatus: false },
  strafeRight: { activators: ['e', 'PageDown'], keyStatus: false },
  fire: { activators: [' '], keyStatus: false },
  reload: { activators: ['r'], keyStatus: false },
  selfDestroy: { activators: ['k'], keyStatus: false },
  systemGraphs: { activators: ['g'], keyStatus: false, toggle: true },
  leaderBoard: { activators: ['p'], keyStatus: false, store: writable<boolean>(false), toggle: true },
  hotKeys: { activators: ['o'], keyStatus: false, store: writable<boolean>(false), toggle: true },
  shipSettings: { activators: ['i'], keyStatus: false, store: writable<boolean>(false), toggle: true },
  shipDetails: { activators: ['c'], keyStatus: false, store: writable<boolean>(false), toggle: true },
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
  return key
}

export function capitalFirstChar(str: string) {
  if (str.length === 0) return str
  if (str.length === 1) return str.charAt(0).toUpperCase()
  return str.charAt(0).toUpperCase() + str.slice(1)
}

Object.entries(DefaultKeyMap).forEach(([key, value]: [string, KeyFunction]) => {
  value.displayText = capitalFirstChar(key)
})

let ActiveKeyMap: KeyFunctionMap = DefaultKeyMap
const ActiveTouch: TouchFunctionMap = DefaultTouchMap

export function setKeyStateStore() {
  activeKeyStates.set(keyFuncArrayFromKeyFunctionMap(ActiveKeyMap))
}

setKeyStateStore()

export function setKeyMap(Keys: KeyFunctionMap) {
  ActiveKeyMap = Keys
}

export function getKeyMap(): KeyFunctionMap {
  return ActiveKeyMap
}

export function getKeyBindings(): KeyFunction[] {
  return keyFuncArrayFromKeyFunctionMap(ActiveKeyMap)
}

function keyFuncArrayFromKeyFunctionMap(kfm: KeyFunctionMap) {
  const keyValues: KeyFunction[] = []
  Object.values(kfm).forEach((value) => {
    keyValues.push(value)
  })
  return keyValues
}

function arrowControl(e: KeyboardEvent, keyUseState: boolean) {
  Object.values(ActiveKeyMap).forEach((keyFunction: KeyFunctionStore) => {
    keyFunction.activators.map((activator: string) => {
      if (activator === e.key) {
        if (keyFunction.toggle && keyUseState) {
          keyFunction.keyStatus = !keyFunction.keyStatus
        } else if (!keyFunction.toggle) {
          keyFunction.keyStatus = keyUseState
        }

        if (keyFunction.store) {
          keyFunction.store.set(keyFunction.keyStatus)
        }
      }
    })
  })
  setKeyStateStore()
}

function resetState() {
  Object.values(ActiveKeyMap).forEach((keyFunction) => {
    keyFunction.keyStatus = false
  })
}

function reloadSpaceObject(so: SpaceObject) {
  // so.canonCoolDown = 0
  so.ammo = 500
  so.health = 500
  so.batteryLevel = 1000
  so.booster = 5
  so.missileDamage = 10
  so.missileSpeed = 25
  so.inverseFireRate = 6
  so.shotsPerFrame = 2
}

export function spaceObjectKeyController(so: SpaceObject, dt = 1) {
  //so.afterBurnerEnabled = false

  const dts: number = dt * timeScale

  if (ActiveKeyMap.halt.keyStatus) {
    so.velocity = { x: 0, y: 0 }
    so.acceleration = { x: 0, y: 0 }
  }

  if (ActiveKeyMap.reload.keyStatus) {
    reloadSpaceObject(so)
  }

  if (ActiveKeyMap.boost.keyStatus) {
    //so.afterBurnerEnabled = true
    applyEngineThrust(so, 0, true)
  }

  if (ActiveKeyMap.thrust.keyStatus) {
    //so.afterBurnerEnabled = true
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

export function spaceTouchController(so: SpaceObject, dt = 1) {
  const dts: number = dt * timeScale

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
    const touch = touches[i]
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
