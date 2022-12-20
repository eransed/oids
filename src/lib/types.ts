export interface Vec2d {
  x: number
  y: number
}

export interface SpaceObject {
  lastPosition: Vec2d
  mass: number
  size: Vec2d
  color: string
  position: Vec2d
  velocity: Vec2d
  acceleration: Vec2d
  angleDegree: number
  name: string
  health: number
  killCount: number
  fuel: number
  enginePower: number
  steeringPower: number
  ammo: number
  shotsInFlight: SpaceObject[]
  missileSpeed: number
  missileDamage: number
  canonCoolDown: number
  canonOverHeat: boolean
  canonHeatAddedPerShot: number
  canonCoolDownSpeed: number
  shieldPower: number
  colliding: boolean
  collidingWith: SpaceObject[]
  damage: number
  armedDelay: number
  bounceCount: number
  didHit: boolean
  shotBlowFrame: number
  afterBurnerEnabled: boolean
}
