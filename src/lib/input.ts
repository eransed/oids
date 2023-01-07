import type { SpaceObject } from './types'
import { applyEngineThrust, applySteer, fire } from './mechanics'
import { timeScale } from './constants'
import { createSpaceObject } from './utils'

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

function arrowControl(e: KeyboardEvent, value: boolean) {
  if (e.key === 'ArrowUp') {
    upPressed = value
  }
  if (e.key === 'q' || e.code === 'PageUp') {
    leftStrafePressed = value
  }
  if (e.key === 'e' || e.code === 'PageDown') {
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
  if (e.key === 'v') {
    halt = value
  }
  if (e.key === 'r') {
    reset = value
  }
}

export function spaceObjectKeyController(so: SpaceObject, dt = 1) {
  //so.afterBurnerEnabled = false

  const dts: number = dt * timeScale

  if (halt) {
    so.velocity = {x: 0, y: 0}
    so.acceleration = {x: 0, y: 0}
  }

  if (reset) {
    so.ammo = 1000
    so.health = 250
    so.fuel = 500
    so.canonCoolDown = 0
    so.missileDamage = 4
    so.booster = 5
    so.inverseFireRate = 14
    so.shotsPerFrame = 8
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
}

export function initKeyControllers(): void {
  console.log('adds event listeners')
  document.addEventListener('keydown', (event) => arrowControl(event, true))
  document.addEventListener('keyup', (event) => arrowControl(event, false))
}
