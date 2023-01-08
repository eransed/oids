import { SpaceShape, type SpaceObject, type Vec2d } from './types'
import { rndi, rndf, floor, round2dec } from './math'
import { screenScale, maxRandomDefaultSpaceObjectVelocity as maxVel } from './constants'

export function createSpaceObject(): SpaceObject {
  const initVel: Vec2d = { x: rndf(-maxVel, maxVel), y: rndf(-maxVel, maxVel) }
  const initPos: Vec2d = {
    x: rndi(0, 100),
    y: rndi(0, 100),
  }

  const spaceObject: SpaceObject = {
    mass: 1,
    size: { x: 100, y: 100 },
    color: '#90d', // cool purple
    position: initPos,
    velocity: initVel,
    acceleration: { x: 0, y: 0 },
    name: 'SpaceObject',
    angleDegree: -90,
    angularVelocity: 0,
    health: 100,
    killCount: 0,
    batteryLevel: 500,
    enginePower: 0.2,
    steeringPower: 1.2,
    ammo: 1000,
    shotsInFlight: [],
    missileDamage: 2,
    canonCoolDown: 0,
    canonOverHeat: false,
    colliding: false,
    collidingWith: [],
    damage: 5,
    armedDelay: 2,
    bounceCount: 0,
    didHit: false,
    shotBlowFrame: 16,
    steer: function (direction: number, deltaTime: number): void {
      throw new Error('Steer not implemented.')
    },
    motivatorBroken: false,
    motivationLevel: 100,
    online: false,
    isLocal: false,
    shape: SpaceShape.SmallShip,
    hitRadius: 60,
    serverVersion: '',
    booster: 2,
    framesSinceLastShot: 0,
    missileSpeed: 20,
    canonCoolDownSpeed: 1.4,
    canonHeatAddedPerShot: 2.5,
    inverseFireRate: 8,
    shotsPerFrame: 1,
  }

  return spaceObject
}

export const getScreenRect = (ctx: CanvasRenderingContext2D): Vec2d => {
  return { x: ctx.canvas.width, y: ctx.canvas.height }
}

export function setCanvasSize(ctx: CanvasRenderingContext2D): void {
  const vw: number = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
  const vh: number = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
  ctx.canvas.width = vw * screenScale
  ctx.canvas.height = vh * screenScale
  console.log({ vw, vh })
}

export function getScreenCenterPosition(ctx: CanvasRenderingContext2D): Vec2d {
  return floor({ x: ctx.canvas.width / 2, y: ctx.canvas.height / 2 })
}

export function getScreenFromCanvas(ctx: CanvasRenderingContext2D): Vec2d {
  return { x: ctx.canvas.width, y: ctx.canvas.height }
}

export function to_string(v: Vec2d, dec = 0): string {
  return '(' + round2dec(v.x, dec) + ', ' + round2dec(v.y, dec) + ')'
}
