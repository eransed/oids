import type { SpaceObject, Vec2d } from "./types"
import { applyEngineThrust, applySteer, fire } from "./mechanics"
import { timeScale } from "./constants"

let boost = false
let halt = false
let reset = false
let upPressed = false
let downPressed = false
let rightPressed = false
let rightStrafePressed = false
let leftStrafePressed = false
let leftPressed = false
let spacePressed = false
let selfDestruct = false

function arrowControl(e: KeyboardEvent, value: boolean) {
  if (e.key === "ArrowUp") {
    upPressed = value
  }
  if (e.key === "q" || e.code === "PageUp") {
    leftStrafePressed = value
  }
  if (e.key === "e" || e.code === "PageDown") {
    rightStrafePressed = value
  }
  if (e.key === "w") {
    upPressed = value
  }
  if (e.key === "ArrowDown") {
    downPressed = value
  }
  if (e.key === "s") {
    downPressed = value
  }
  if (e.key === "ArrowLeft") {
    leftPressed = value
  }
  if (e.key === "ArrowRight") {
    rightPressed = value
  }
  if (e.key === "a") {
    leftPressed = value
  }
  if (e.key === "d") {
    rightPressed = value
  }
  if (e.code === "Space" || e.key === "n") {
    // wtf code...
    spacePressed = value
  }
  if (e.key === "b") {
    boost = value
  }
  if (e.key === "v") {
    halt = value
  }
  if (e.key === "r") {
    reset = value
  }
  if (e.key === "k") {
    selfDestruct = value
  }
}

export function spaceObjectKeyController(so: SpaceObject, dt = 1) {
  //so.afterBurnerEnabled = false

  const dts: number = dt * timeScale

  if (halt) {
    so.velocity = { x: 0, y: 0 }
    so.acceleration = { x: 0, y: 0 }
  }

  if (reset) {
    // so.canonCoolDown = 0
    so.ammo = 1000000
    so.health = 250
    so.batteryLevel = 500
    so.booster = 5

    so.missileDamage = 4
    so.inverseFireRate = 12
    so.shotsPerFrame = 100
  }

  if (boost) {
    //so.afterBurnerEnabled = true
    applyEngineThrust(so, 0, true)
  }

  if (upPressed) {
    //so.afterBurnerEnabled = true
    applyEngineThrust(so, 0)
  }

  if (downPressed) {
    applyEngineThrust(so, 180)
  }

  if (leftStrafePressed) {
    applyEngineThrust(so, -90)
  }

  if (rightStrafePressed) {
    applyEngineThrust(so, 90)
  }

  if (rightPressed) {
    applySteer(so, 1, dts)
  }

  if (leftPressed) {
    applySteer(so, -1, dts)
  }

  if (spacePressed) {
    fire(so)
  }
  if (selfDestruct) {
    let x = 0

    so.health = 0
  }
}

export function initKeyControllers(): void {
  document.addEventListener("keydown", (event) => arrowControl(event, true))
  document.addEventListener("keyup", (event) => arrowControl(event, false))
}

export function removeKeyControllers(): void {
  document.removeEventListener("keydown", (event) => arrowControl(event, true))
  document.removeEventListener("keyup", (event) => arrowControl(event, false))
}

export function getMousePosition(
  canvas: HTMLCanvasElement,
  mouseEvent: MouseEvent
): Vec2d {
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height

  return {
    x: (mouseEvent.clientX - rect.left) * scaleX,
    y: (mouseEvent.clientY - rect.top) * scaleY,
  }
}
