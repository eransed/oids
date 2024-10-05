import { type SpaceObject } from '../interface'

const chosenKeys: Array<keyof SpaceObject> = [
  // 'killedByName',
  // 'pingId',
  // 'pingResponse',
  // 'afterBurner',
  // // 'canonOverHeat',
  // 'didHit',
  // 'motivatorBroken',
  // 'online',
  // 'obliterated',
  // 'shotsFiredThisFrame',
  // 'ping',
  // 'isPlaying',
  // 'isLocal',
  // 'isJumping',
  // 'isDead',
  'serverVersion',
  'color',
  'velocity',
  // 'viewFramePosition',
  'acceleration',
  'cameraVelocity',
  'characterGlobalPosition',
  'position',
  'size',
  'ship',
  // 'viewport',
  'worldSize',
]

//Keys identified that makes a 'problem'
// 'cameraPosition' - ship starts to drift when an update is not sent
// 'isPlaying' - for some reason this needs to be sent every update
//  'viewport' and 'viewFramePosition' - if unsync the ship is rendered on the wrong place constantly

//Only return the values that have not changed.

export function getPartialSo(oldSo: SpaceObject, newSo: SpaceObject): Partial<SpaceObject> {
  let partialSo: Partial<SpaceObject> = {}

  for (const key in newSo) {
    const oldValue = oldSo[key as keyof SpaceObject]
    const newValue = newSo[key as keyof SpaceObject]

    //Checks if key in newSo is in const chosenKeys.
    if ((key as keyof SpaceObject) === chosenKeys.find((k) => key === k)) {
      if (!deepEqual(oldValue, newValue)) {
        partialSo[key as keyof SpaceObject] = newValue as keyof unknown
      }
    } else {
      partialSo[key as keyof SpaceObject] = newValue as keyof unknown
    }
  }

  return partialSo
}

function deepEqual(obj1: any, obj2: any) {
  //If values are objects
  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    return JSON.stringify(obj1) === JSON.stringify(obj2)
  }

  if (typeof obj1 === 'string' && typeof obj2 === 'string') {
    return obj1 === obj2
  }

  if (typeof obj1 === 'boolean' && typeof obj2 === 'boolean') {
    return obj1 === obj2
  }
}
