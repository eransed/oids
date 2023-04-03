import type { PhotonLaser, SpaceObject } from "..//types"
import { round, round2dec } from "../math"
import { createSpaceObject, newPhotonLaser } from "../factory"

//In this util we find functions that convert and iterate through data to save space when sending / recieving data through websocket

export function reduceSoSize(so: SpaceObject): SpaceObject {
  const dec = 2

  so.canonCoolDown = round2dec(so.canonCoolDown, dec)
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

//Incoming messages
export function soFromValueArray(value: []): SpaceObject {
  let so = createSpaceObject()
  Object.keys(so).forEach((v, i) => {
    if ((v as keyof SpaceObject) === "shotsInFlightValues") {
      // if ((value[i] as any[]).length > 0) {
      //   debugger
      // }
      ;(value[i] as any[]).forEach((shot) => {
        so.shotsInFlight.push(photonLaserFromValueArray(shot))
      })
    } else {
      so[v as keyof SpaceObject] = value[i]
    }
  })
  so.shotsInFlightValues = []
  return so
}

//Creates one shot from valuearray
export function photonLaserFromValueArray(values: []): PhotonLaser {
  let pl = newPhotonLaser()

  Object.keys(pl).forEach((v, i) => {
    pl[v as keyof PhotonLaser] = values[i]
  })

  return pl
}

//Outgoing messages
export function soToValueArray(so: SpaceObject): any[] {
  const soValues = Object.values(so)

  Object.keys(so).forEach((key, i) => {
    if (key === "shotsInFlightValues" && so.shotsFiredThisFrame) {
      soValues[i] = soShotsInFlightValueArray(so)
    }
    if (key === "shotsInFlight") {
      soValues[i] = []
    }
  })

  // if (so.shotsInFlight.length > 0) debugger

  return soValues
}

//Creates an value array from shotsInFlight on space object
export function soShotsInFlightValueArray(so: SpaceObject): any[] {
  const shotList: any[] = []

  so.shotsInFlight.forEach((shot) => {
    shotList.push(Object.values(shot))
  })

  return shotList
}
