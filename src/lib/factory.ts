import type { PhotonLaser, SpaceObject, Vec2d } from "./types"
import { SpaceShape } from "./types"
import { rndf, rndi, round, round2dec } from "./math"
import { maxRandomDefaultSpaceObjectVelocity as maxVel } from "./constants"
import type { Button90Config } from "../components/interface"
import type { Physical } from "./traits/Physical"

export function reduceSoSize(so: SpaceObject): SpaceObject {
  const dec = 2

  so.acceleration = round(so.acceleration, dec)
  so.velocity = round(so.velocity, dec)
  so.position = round(so.position, dec)

  return so
}

export function reduceShotSize(photonLaser: PhotonLaser): PhotonLaser {
  const dec = 2

  photonLaser.acceleration = round(photonLaser.acceleration, dec)
  photonLaser.velocity = round(photonLaser.velocity, dec)
  photonLaser.position = round(photonLaser.position, dec)

  return photonLaser
}

export function soFromValueArray(value: []): SpaceObject {
  let so = createSpaceObject()
  Object.keys(so).forEach((v, i) => {
    if ((v as keyof SpaceObject) === "shotsInFlightValues") {
      console.log(value[i])
      ;(value[i] as any[]).forEach((shot) => {
        so.shotsInFlight.push(photonLaserFromValueArray(shot))
      })
    } else {
      so[v as keyof SpaceObject] = value[i]
    }
  })
  return so
}

export function photonLaserFromValueArray(values: []): PhotonLaser {
  let pl = newPhotonLaser()

  Object.keys(pl).forEach((v, i) => {
    pl[v as keyof PhotonLaser] = values[i]
  })

  return pl
}

export function soShotsInFlightValueArray(so: SpaceObject): any[] {
  const shotList: any[] = []

  so.shotsInFlight.forEach((shot) => {
    shotList.push(Object.values(shot))
  })

  return shotList
}

export function soToValueArray(so: SpaceObject): any[] {
  const soValues = Object.values(so)

  Object.keys(so).forEach((key, i) => {
    if (key === "shotsInFlightValues") {
      soValues[i] = soShotsInFlightValueArray(so)
    }
  })

  return soValues
}

export function newPhotonLaser(): PhotonLaser {
  const shot = {
    acceleration: { x: 0, y: 0 },
    angleDegree: -90,
    angularVelocity: 0,
    armedDelay: 6,
    color: "#90d",
    damage: 5,
    deadFrameCount: 0,
    didHit: false,
    health: 100,
    isDead: false,
    mass: 1,
    obliterated: false,
    position: { x: 0, y: 0 },
    shotBlowFrame: 16,
    size: { x: 100, y: 100 },
    velocity: { x: 0, y: 0 },
  }

  return shot
}

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
    shotsInFlightValues: [],
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
