//imports
import type { Vec2d, SpaceObject } from "./types"
import { add } from "./math"
import { applyEngine, applySteer } from "./mechanics"

let upPressed: boolean = false
let downPressed: boolean = false
let rightPressed: boolean = false
let rightStrafePressed = false
let leftStrafePressed = false
let leftPressed: boolean = false
let spacePressed: boolean = false

export function spaceObjectKeyController(so: SpaceObject) {
  //so.afterBurnerEnabled = false
  if (upPressed) {
    //so.afterBurnerEnabled = true
    let angleRadians: number = (so.angleDegree * Math.PI) / 180
    let engine = applyEngine(so)
    add(so.velocity, {
      x: engine * Math.cos(angleRadians),
      y: engine * Math.sin(angleRadians),
    })
  }

  if (downPressed) {
    let angleRadians: number = (so.angleDegree * Math.PI) / 180
    let engine = applyEngine(so)
    add(so.velocity, {
      x: -engine * Math.cos(angleRadians),
      y: -engine * Math.sin(angleRadians),
    })
  }

  if (leftStrafePressed) {
    let angleRadians: number = ((so.angleDegree - 90) * Math.PI) / 180
    let engine = applyEngine(so)
    add(so.velocity, {
      x: engine * Math.cos(angleRadians),
      y: engine * Math.sin(angleRadians),
    })
  }

  if (rightStrafePressed) {
    let angleRadians: number = ((so.angleDegree + 90) * Math.PI) / 180
    let engine = applyEngine(so)
    add(so.velocity, {
      x: engine * Math.cos(angleRadians),
      y: engine * Math.sin(angleRadians),
    })
  }

  if (leftPressed) {
    so.angleDegree -= applySteer(so)
  }

  if (rightPressed) {
    so.angleDegree += applySteer(so)
  }

  //   if (spacePressed) {
  //     fire(so)
  //   }
}

export function arrowControl(e: any, value: boolean) {
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
  if (e.code === "Space") {
    // wtf code...
    spacePressed = value
  }
  //   if (e.key === "b" && value) {
  //     bounce = !bounce
  //     console.log({ bounce })
  //   }
  //   if (e.key === "i") {
  //     console.log({ allSpaceObjects })
  //     console.log({ myShip })
  //   }
}
