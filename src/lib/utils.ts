import type { SpaceObject, Vec2d } from "./types"
import { rndi, rndf } from "./math"
import { scaleFactor } from "./constants"

export function createSpaceObject(ctx: CanvasRenderingContext2D): SpaceObject {
  const initPos: Vec2d = {
    x: rndi(0, ctx.canvas.width),
    y: rndi(0, ctx.canvas.height),
  }

  const initVel: Vec2d = {
    x: 0,
    y: 0,
  }

  const spaceObject: SpaceObject = {
    lastPosition: initPos,
    mass: 1,
    size: { x: 24, y: 24 },
    color: "#f00",
    position: initPos,
    //velocity: { x: rndf(-maxSpeed, maxSpeed), y: rndf(-maxSpeed, maxSpeed) },
    velocity: initVel,
    acceleration: { x: 0, y: 0 },
    name: "SpaceObject",
    angleDegree: -90,
    health: 100,
    killCount: 0,
    fuel: 500,
    enginePower: 0.25,
    steeringPower: 2.5,
    ammo: 10,
    shotsInFlight: [],
    missileSpeed: 5, // 30
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
  console.log ({vw, vh})
}
