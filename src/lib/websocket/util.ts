import type { PhotonLaser, SpaceObject } from '../interface'
import { round2, round2dec } from 'mathil'
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
