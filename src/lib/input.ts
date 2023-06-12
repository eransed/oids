import type { GameState, KeyFunction, KeyFunctionMap, KeyFunctionStore, SpaceObject } from "./interface"
import { applyEngineThrust, applySteer, fire } from "./mechanics"
import { timeScale } from "./constants"
import type { Vec2d } from "./math"
import { writable, type Writable } from "svelte/store"

export const activeKeyStates: Writable<KeyFunction[]> = writable()
export const gameState: Writable<GameState> = writable()

const DefaultKeyMap: KeyFunctionMap = {
  thrust: { activators: ["w", "ArrowUp"], keyStatus: false },
  reverseThrust: { activators: ["s", "ArrowDown"], keyStatus: false },
  boost: { activators: ["b"], keyStatus: false },
  halt: { activators: ["h"], keyStatus: false, toggle: true },
  turnLeft: { activators: ["a", "ArrowLeft"], keyStatus: false },
  turnRight: { activators: ["d", "ArrowRight"], keyStatus: false },
  strafeLeft: { activators: ["q", "PageUp"], keyStatus: false },
  strafeRight: { activators: ["e", "PageDown"], keyStatus: false },
  fire: { activators: [" "], keyStatus: false },
  reload: { activators: ["r"], keyStatus: false },
  selfDestroy: { activators: ["k"], keyStatus: false },
  systemGraphs: { activators: ["g"], keyStatus: false, toggle: true },
  leaderBoard: { activators: ["p"], keyStatus: false, store: writable<boolean>(false), toggle: true },
  hotKeys: { activators: ["o"], keyStatus: false, store: writable<boolean>(false), toggle: true },
  shipSettings: { activators: ["i"], keyStatus: false, store: writable<boolean>(false), toggle: true },
}

// Input helper functions
export function keyDisplayName(key: string) {
  if (key === " ") return "Spacebar"
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
  so.ammo = 1000
  so.health = 1000
  so.batteryLevel = 1000
  so.booster = 5
  so.missileDamage = 1
  so.inverseFireRate = 3
  so.shotsPerFrame = 10
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
  document.addEventListener("keydown", keydownArrowControl)
  document.addEventListener("keyup", keyupArrowControl)
}

export function removeKeyControllers(): void {
  resetState()
  document.removeEventListener("keydown", keydownArrowControl)
  document.removeEventListener("keyup", keyupArrowControl)
}

export function getMousePosition(canvas: HTMLCanvasElement, mouseEvent: MouseEvent): Vec2d {
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height

  return {
    x: (mouseEvent.clientX - rect.left) * scaleX,
    y: (mouseEvent.clientY - rect.top) * scaleY,
  }
}
