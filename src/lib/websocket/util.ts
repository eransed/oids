import type { PhotonLaser, SpaceObject } from '../interface'
import { round2, round2dec } from 'mathil'
import { createSpaceObject, newPhotonLaser } from '../factory'
import { copyObject } from '../time'

//In this util we find functions that convert and iterate through data to save space when sending / recieving data through websocket

export function reduceSoSize(so: SpaceObject, dec = 0): SpaceObject {
  const so_copy = <SpaceObject>copyObject(so)
  so_copy.canonCoolDown = round2dec(so_copy.canonCoolDown, dec)
  so_copy.acceleration = round2(so_copy.acceleration, dec)
  so_copy.velocity = round2(so_copy.velocity, dec)
  so_copy.position = round2(so_copy.position, dec)
  so_copy.angleDegree = round2dec(so_copy.angleDegree, dec)
  so_copy.shotsInFlight.forEach((shot) => {
    shot = reduceShotSize(shot, dec)
  })
  so_copy.shotsInFlightNew.forEach((shot) => {
    shot = reduceShotSize(shot, dec)
  })
  return so_copy
}

export function reduceShotSize(photonLaser: PhotonLaser, dec = 1): PhotonLaser {
  photonLaser.acceleration = round2(photonLaser.acceleration, dec)
  photonLaser.velocity = round2(photonLaser.velocity, dec)
  photonLaser.position = round2(photonLaser.position, dec)
  return photonLaser
}

//Incoming messages
export function soFromValueArray(value: never[]): SpaceObject {
  const so = createSpaceObject()
  Object.keys(so).forEach((v, i) => {
    if ((v as keyof SpaceObject) === 'shotsInFlightNew') {
      // if ((value[i] as any[]).length > 0) {
      //   debugger
      // }
      // console.log ('Test value [i]:')
      // console.log(typeof value[i])
      // console.log(value[i])
      // console.log ('Test end:');
      (value[i] as any[]).forEach((shot) => {
        so.shotsInFlight.push(photonLaserFromValueArray(shot))
      })
    } else {
      so[v as keyof SpaceObject] = value[i]
    }
  })
  so.shotsInFlightNew = []
  return so
}

export function moveShotsToShotsFiredThisFrame(so: SpaceObject) {
  if (!so.shotsFiredThisFrame) {
    so.shotsInFlight = []
  }
}

//Creates one shot from valuearray
export function photonLaserFromValueArray(values: []): PhotonLaser {
  const pl = newPhotonLaser()

  Object.keys(pl).forEach((v, i) => {
    pl[v as keyof PhotonLaser] = values[i]
  })

  return pl
}

//Outgoing messages
export function soToValueArray(so: SpaceObject): any[] {
  const soValues = Object.values(so)

  Object.keys(so).forEach((key, i) => {
    if (key === 'shotsInFlightValues' && so.shotsFiredThisFrame) {
      soValues[i] = soShotsInFlightValueArray(so)
    }
    if (key === 'shotsInFlight') {
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
