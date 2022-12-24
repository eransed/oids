import type { SpaceObject, Vec2d } from "./types"
import { rndi, rndf, floor } from "./math"
import { scaleFactor, maxRandomDefaultSpaceObjectVelocity as maxVel, frictionFactor } from "./constants"

export function createSpaceObject(): SpaceObject {

  const initVel: Vec2d = { x: rndf(-maxVel, maxVel), y: rndf(-maxVel, maxVel) }
  const initPos: Vec2d = {
    x: rndi(0, 100),
    y: rndi(0, 100),
  }

  // const initVel: Vec2d = {x: 0, y: 0}
  // const initPos: Vec2d = {
  //   x: rndi(0, ctx.canvas.width),
  //   y: rndi(0, ctx.canvas.height),
  // }

  const spaceObject: SpaceObject = {
    lastPosition: initPos,
    mass: 1,
    size: { x: 24, y: 24 },
    color: "#fff",
    position: initPos,
    velocity: initVel,
    acceleration: { x: 0, y: 0 },
    name: "SpaceObject",
    angleDegree: -90,
    health: 100,
    killCount: 0,
    fuel: 50000,
    enginePower: 0.2,
    steeringPower: 2.5,
    ammo: 50000,
    shotsInFlight: [],
    missileSpeed: 20, // 30
    missileDamage: 10,
    canonCoolDown: 0,
    canonOverHeat: false,
    canonHeatAddedPerShot: 25,
    canonCoolDownSpeed: 8,
    shieldPower: 100,
    colliding: false,
    collidingWith: [],
    damage: 5,
    armedDelay: 1,
    bounceCount: 0,
    didHit: false,
    shotBlowFrame: 16,
    afterBurnerEnabled: false,
    frictionFactor: frictionFactor,
  }

  return spaceObject
}

export const getScreenRect = (ctx: CanvasRenderingContext2D): Vec2d => {
  return { x: ctx.canvas.width, y: ctx.canvas.height }
}

export function setCanvasSize(ctx: CanvasRenderingContext2D): void {
  const vw: number = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
  const vh: number = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
  ctx.canvas.width = vw * scaleFactor
  ctx.canvas.height = vh * scaleFactor
  console.log({ vw, vh })
}

export function getScreenCenterPosition(ctx: CanvasRenderingContext2D): Vec2d {
  return floor({ x: ctx.canvas.width/2, y: ctx.canvas.height/2 })
}
