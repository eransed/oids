import { type SpaceObject } from '../interface'

export function getPartialSo(oldSo: SpaceObject, newSo: SpaceObject): Partial<SpaceObject> {
  let partialObject: Partial<SpaceObject> = {}

  for (const key in newSo) {
    const newValue = newSo[key as keyof SpaceObject]
    const oldValue = oldSo[key as keyof SpaceObject]

    if (!optimizedDeepEqual(newValue, oldValue)) {
      partialObject[key as keyof SpaceObject] = newValue as keyof unknown
    }
  }

  const shots = [...oldSo.shotsInFlight, ...newSo.shotsInFlight]
  // console.log(partialObject)

  partialObject.sessionId = newSo.sessionId
  partialObject.name = newSo.name
  partialObject.serverVersion = newSo.serverVersion
  partialObject.id = newSo.id
  partialObject.shotsInFlight = shots

  // partialObject.shotsInFlightNew = newSo.shotsInFlightNew

  return partialObject
}

function optimizedDeepEqual(obj1: any, obj2: any): boolean {
  // If objects are strictly equal, return true immediately
  if (obj1 === obj2) return true

  // If either of the objects is null, return false
  if (obj1 === null || obj2 === null) return false

  // If types are different, they can't be equal
  if (typeof obj1 !== typeof obj2) return false

  // Handle shallow comparison for primitive types (number, string, boolean, etc.)
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return obj1 === obj2
  }

  // Handle array comparison
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false
    for (let i = 0; i < obj1.length; i++) {
      if (!optimizedDeepEqual(obj1[i], obj2[i])) return false
    }
    return true
  }

  // Handle object comparison (selectively)
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  // If the number of keys differs, objects are not equal
  if (keys1.length !== keys2.length) return false

  // Compare only the relevant keys (skip unnecessary deep comparisons)
  const selectiveKeys = ['shotsInFlight', 'position', 'velocity'] // Add more complex properties if needed
  for (const key of keys1) {
    if (selectiveKeys.includes(key)) {
      if (!optimizedDeepEqual(obj1[key], obj2[key])) return false
    } else {
      // For non-complex properties, do shallow comparison
      if (obj1[key] !== obj2[key]) return false
    }
  }

  return true
}
