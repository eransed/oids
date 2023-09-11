import { randomAnyLightColor } from '../color'
import type { Damageable } from '../interface'
import { newVec2 } from 'mathil'
import type { Shape } from './Shape'

export interface Ship extends Shape, Damageable {}

export function newShip(): Ship {
 const ship: Ship = {
  render: () => {
   console.log('render')
  },
  mass: 1,
  size: newVec2(),
  velocity: newVec2(),
  acceleration: newVec2(),
  position: newVec2(),
  color: randomAnyLightColor(),
  health: 0,
  isDead: false,
  deadFrameCount: 0,
  obliterated: false,
  angleDegree: 0,
  angularVelocity: 0,
  lastDamagedByName: '',
  killedByName: '',
 }

 return ship
}
