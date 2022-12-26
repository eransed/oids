
import type { SpaceObject } from "./types"
import { applyEngineThrust, applySteer, fire } from "./mechanics"

let boost: boolean = false
let upPressed: boolean = false
let downPressed: boolean = false
let rightPressed: boolean = false
let rightStrafePressed = false
let leftStrafePressed = false
let leftPressed: boolean = false
let spacePressed: boolean = false

function arrowControl(e: any, value: boolean) {
  if (e.key === "ArrowUp") {
    upPressed = value
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
    leftStrafePressed = value
  }
  if (e.key === "d") {
    rightStrafePressed = value
  }
  if (e.code === "Space" || e.key === 'n') {
    // wtf code...
    spacePressed = value
  }
  if (e.key === 'b') {
    boost = value
  }
}

export function spaceObjectKeyController(so: SpaceObject) {
  //so.afterBurnerEnabled = false

  if (boost) {
    //so.afterBurnerEnabled = true
    applyEngineThrust(so, 0, 5)
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
    applySteer(so, 1)
  }

  if (leftPressed) {
    applySteer(so, -1)
  }

  if (spacePressed) {
    for(let i = 0; i < 2; i++) {
      fire(so)
    }
  }
}

export function initKeyControllers(): void {
  console.log("adds event listeners")
  document.addEventListener("keydown", (event) => arrowControl(event, true))
  document.addEventListener("keyup", (event) => arrowControl(event, false))
}
