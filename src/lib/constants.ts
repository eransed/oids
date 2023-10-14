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

export const maxShotAge = 40000
