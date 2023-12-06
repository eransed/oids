import { newVec2, rndfVec2, type Vec2 } from 'mathil'

export const frontVersion = '0.1.0'
export const screenScale = 3
export const linearFriction: Vec2 = { x: 0.998, y: 0.99 }
export const canvasBackgroundColor = '#000'
export const maxRandomDefaultSpaceObjectVelocity = 1
export const timeScale = 0.15 // 0.09
export const maxHeat = 100
export const shotHitReversFactor = 0.6
export const collisionFrameDamage = 1
export const missileDamageVelocityTransferFactor = 0.005
export const purple1 = '#90d'
export const purple2 = '#b0e'

// number of frames that so expolosion will be rendered
export const explosionDuration = 120

// shots will decay dirctly at screen edge if 1
export const screenPaddingFactor = 1

// add thrust to so direction - so will keep turning until opposite force
export const thrustSteer = true

// factor of thrust when using thrust steering
export const thrustSteerPowerFactor = 0.06

export const angularFriction = 0.945

export const bounceFactor = 0.8

export let graphLineColor = '#fff'

export function setGraphLineColor(color: string): void {
  graphLineColor = color
}

export function getGraphLineColor(): string {
  return graphLineColor
}

export const worldSize = newVec2(1e308, 1e308)

export const worldStartPosition = rndfVec2(1e6, 1e6)

export const maxShotAge = 70000

export const basicPhotonLaserSpeedScaleFactor = .6

interface xpRequirements {
  [level: number]: number
}

export const xpRequirements: xpRequirements = {
  1: 100,
  2: 150,
  3: 225,
  4: 340,
  5: 510,
  6: 765,
  7: 1150,
  8: 1725,
  9: 2590,
  10: 3885,
  11: 5830,
  12: 8745,
  13: 13120,
  14: 19680,
  15: 29520,
  16: 44280,
  17: 66420,
  18: 99630,
  19: 149445,
  20: 224170,
  21: 336255,
  22: 504385,
  23: 756580,
  24: 1134870,
  25: 1702305,
  26: 2553455,
  27: 3830180,
  28: 5745270,
  29: 8617905,
  30: 12926960,
}
