import type { Vec2d } from 'mathil'

export const frontVersion = '0.1.0'
export const screenScale = 3
export const linearFriction: Vec2d = { x: 0.998, y: 0.99 }
export const canvasBackgroundColor = '#000'
export const maxRandomDefaultSpaceObjectVelocity = 1
export const timeScale = 0.09
export const maxHeat = 100
export const shotHitReversFactor = 0.6
export const collisionFrameDamage = 1
export const missileDamageVelocityTransferFactor = 0.1
export const purple1 = '#90d'
export const purple2 = '#b0e'

// number of frames that so expolosion will be rendered
export const explosionDuration = 60

// shots will decay dirctly at screen edge if 1
export const screenPaddingFactor = 1

// add thrust to so direction - so will keep turning until opposite force
export const thrustSteer = true

// factor of thrust when using thrust steering
export const thrustSteerPowerFactor = 0.05

export const angularFriction = 0.985
