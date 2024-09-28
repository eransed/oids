import type { Vec2 } from 'mathil'
import { MessageType, type Collidable, type PhotonLaser, type Ship, type SpaceObject, type ThrustFlameAtom } from '../interface'

type NullableSpaceObject = {
  [K in keyof SpaceObject]: SpaceObject[K] | string | number | boolean | Ship | Vec2 | ThrustFlameAtom[] | string[] | PhotonLaser[] | Collidable[] | null
}

let savedSo: SpaceObject | undefined = undefined
let firstGame = true

export function partialSend(newSo: SpaceObject): Partial<NullableSpaceObject> {
  if (!savedSo || firstGame) {
    if (newSo.messageType === MessageType['GAME_UPDATE']) {
      firstGame = false
    }

    savedSo = newSo
    return newSo
  }

  let partialObject: Partial<NullableSpaceObject> = {}

  for (const key in newSo) {
    const newValue = newSo[key as keyof SpaceObject]
    const oldValue = savedSo[key as keyof SpaceObject]
    if (!deepEqual(newValue, oldValue)) {
      partialObject[key as keyof SpaceObject] = newValue
    }
  }

  partialObject.id = newSo.id
  partialObject.sessionId = newSo.sessionId
  partialObject.name = newSo.name

  savedSo = newSo

  return partialObject
}

function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return false
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (!deepEqual(obj1[key], obj2[key])) return false
  }

  return true
}
