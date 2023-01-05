import type { Fireable, SpaceObject, Thrustable } from './types'
import { applyEngineThrust, applySteer, fire } from './mechanics'
import { timeScale } from './constants'

let boost: boolean = false
let upPressed: boolean = false
let downPressed: boolean = false
let rightPressed: boolean = false
let rightStrafePressed = false
let leftStrafePressed = false
let leftPressed: boolean = false
let spacePressed: boolean = false

function arrowControl(e: KeyboardEvent, value: boolean) {
  if (e.key === 'ArrowUp') {
    upPressed = value
  }
  if (e.key === 'q') {
    leftStrafePressed = value
  }
  if (e.key === 'e') {
    rightStrafePressed = value
  }
  if (e.key === 'w') {
    upPressed = value
  }
  if (e.key === 'ArrowDown') {
    downPressed = value
  }
  if (e.key === 's') {
    downPressed = value
  }
  if (e.key === 'ArrowLeft') {
    leftPressed = value
  }
  if (e.key === 'ArrowRight') {
    rightPressed = value
  }
  if (e.key === 'a') {
    leftPressed = value
  }
  if (e.key === 'd') {
    rightPressed = value
  }
  if (e.code === 'Space' || e.key === 'n') {
    // wtf code...
    spacePressed = value
  }
  if (e.key === 'b') {
    boost = value
  }
}

export function spaceObjectKeyController(so: SpaceObject, dt: number = 1) {
  //so.afterBurnerEnabled = false

  const dts: number = dt * timeScale

  if (boost) {
    //so.afterBurnerEnabled = true
    applyEngineThrust(so, 0, 4)
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
    applySteer(so, 1 * dts)
  }

  if (leftPressed) {
    applySteer(so, -1 * dts)
  }

  if (spacePressed) {
    fire(so)
    // for (let i = 0; i < 1; i++) {}
  }
}

export function initKeyControllers(): void {
  console.log('adds event listeners')
  document.addEventListener('keydown', (event) => arrowControl(event, true))
  document.addEventListener('keyup', (event) => arrowControl(event, false))
}
