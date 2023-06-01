import type { KeyFunction, KeyFunctionMap, SpaceObject } from "./interface"
import { applyEngineThrust, applySteer, fire } from "./mechanics"
import { timeScale } from "./constants"
import type { Vec2d } from "./math"

const DefaultKeyMap: KeyFunctionMap = {
  thrust: { activators: ["w", "ArrowUp"], keyStatus: false },
  reverseThrust: { activators: ["s", "ArrowDown"], keyStatus: false },
  boost: { activators: ["b"], keyStatus: false },
  halt: { activators: ["h"], keyStatus: false },
  turnLeft: { activators: ["a", "ArrowLeft"], keyStatus: false },
  turnRight: { activators: ["d", "ArrowRight"], keyStatus: false },
  strafeLeft: { activators: ["q", "PageUp"], keyStatus: false },
  strafeRight: { activators: ["e", "PageDown"], keyStatus: false },
  fire: { activators: [" "], keyStatus: false },
  reload: { activators: ["r"], keyStatus: false },
  selfDestroy: { activators: ["k"], keyStatus: false },
  leaderBoard: { activators: ["Tab"], keyStatus: false },
}

Object.entries(DefaultKeyMap).forEach(([key, value]: [string, KeyFunction]) => {
  value.displayText = key
})

export let ActiveKeyMap: KeyFunctionMap = DefaultKeyMap

export function setKeyMap(Keys: KeyFunctionMap) {
  ActiveKeyMap = Keys
}

function arrowControl(e: KeyboardEvent, keyInUse: boolean) {
  Object.values(ActiveKeyMap).forEach((keyFunction) => {
    keyFunction.activators.map((activator: string) => {
      if (activator === e.key) {
        keyFunction.keyStatus = keyInUse
      }
    })
  })
}

function resetState() {
  Object.values(ActiveKeyMap).forEach((keyFunction) => {
    keyFunction.keyStatus = false
  })
}

export function spaceObjectKeyController(so: SpaceObject, dt = 1) {
  //so.afterBurnerEnabled = false

  const dts: number = dt * timeScale

  if (ActiveKeyMap.halt.keyStatus) {
    so.velocity = { x: 0, y: 0 }
    so.acceleration = { x: 0, y: 0 }
  }

  if (ActiveKeyMap.reload.keyStatus) {
    // so.canonCoolDown = 0
    so.ammo = 1000000
    so.health = 250
    so.batteryLevel = 500
    so.booster = 5

    so.missileDamage = 4
    so.inverseFireRate = 12
    so.shotsPerFrame = 300
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
  console.log("Inits game key input control")
  document.addEventListener("keydown", keydownArrowControl)
  document.addEventListener("keyup", keyupArrowControl)
}

export function removeKeyControllers(): void {
  console.log("Removes game key input control")
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
