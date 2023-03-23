import type { SpaceObject, Vec2d } from "./types"
import { SpaceShape } from "./types"
import { rndf, rndi } from "./math"
import { maxRandomDefaultSpaceObjectVelocity as maxVel } from "./constants"
import type { Button90Config } from "../components/interface"

export function createSpaceObject(name = "SpaceObject"): SpaceObject {
  const initVel: Vec2d = { x: rndf(-maxVel, maxVel), y: rndf(-maxVel, maxVel) }
  const initPos: Vec2d = {
    x: rndi(0, 100),
    y: rndi(0, 100),
  }

  const spaceObject: SpaceObject = {
    viewport: { x: 0, y: 0 },
    sessionId: undefined,
    acceleration: { x: 0, y: 0 },
    ammo: 1000,
    angleDegree: -90,
    angularVelocity: 0,
    armedDelay: 6,
    batteryLevel: 500,
    booster: 2,
    bounceCount: 0,
    canonCoolDown: 0,
    canonCoolDownSpeed: 1.4,
    canonHeatAddedPerShot: 1.7,
    canonOverHeat: false,
    colliding: false,
    collidingWith: [],
    color: "#90d",
    damage: 5,
    deadFrameCount: 0,
    didHit: false,
    enginePower: 0.2,
    framesSinceLastServerUpdate: 0,
    framesSinceLastShot: 0,
    health: 100,
    hitRadius: 60,
    inverseFireRate: 6,
    isDead: false,
    isLocal: false,
    isPlaying: false,
    killCount: 0,
    mass: 1,
    missileDamage: 2,
    missileSpeed: 20,
    motivationLevel: 100,
    motivatorBroken: false,
    name: name,
    obliterated: false,
    online: false,
    photonColor: "#0f0",
    position: initPos,
    serverVersion: "",
    shape: SpaceShape.SmallShip,
    shotBlowFrame: 16,
    shotsInFlight: [],
    shotsPerFrame: 1,
    size: { x: 100, y: 100 },
    steer: function (direction: number, deltaTime: number): void {
      throw new Error("Steer not implemented.")
    },
    steeringPower: 1.2,
    velocity: initVel,
  }

  return spaceObject
}

export function createButton90Config(
  buttonText = "Button90",
  clickCallback = () => {
    console.log(`${buttonText} selected`)
  },
  selected = false
): Button90Config {
  return {
    buttonText: buttonText,
    clickCallback: clickCallback,
    selected: selected,
  }
}
