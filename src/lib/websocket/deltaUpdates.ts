import { type SpaceObject } from '../interface'
import { getSendableSpaceObject, shotHandler } from '../time'

export function getPartialSo(oldSo: SpaceObject, newSo: SpaceObject): Partial<SpaceObject> {
  let partialObject: Partial<SpaceObject> = {}

  for (const key in newSo) {
    const newValue = newSo[key as keyof SpaceObject]
    const oldValue = oldSo[key as keyof SpaceObject]

    if (!deepEqual(newValue, oldValue)) {
      partialObject[key as keyof SpaceObject] = newValue as keyof unknown
    }
  }

  partialObject.sessionId = newSo.sessionId
  partialObject.name = newSo.name
  partialObject.serverVersion = newSo.serverVersion
  partialObject.id = newSo.id

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
