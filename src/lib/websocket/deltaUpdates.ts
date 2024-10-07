import { type SpaceObject } from '../interface'

const chosenKeys: Array<keyof SpaceObject> = [
  // 'sessionId',
  // 'messageType',
  // 'gameMode',
  'ownerName',
  'killCount',
  'motivationLevel',
  'ticksSinceLastSnapShot',
  'framesSinceLastServerUpdate',
  'framesSinceLastShot',
  'acceleration',
  'afterBurner',
  'ammo',
  'angleDegree',
  'angularVelocity',
  'armedDelay',
  'batteryCapacity',
  'batteryLevel',
  'booster',
  'bounceCount',
  'cameraVelocity',
  'canonCoolDown',
  'canonCoolDownSpeed',
  'canonHeatAddedPerShot',
  'canonOverHeat',
  'characterGlobalPosition',
  'color',
  'damage',
  'deadFrameCount',
  'didHit',
  'enginePower',
  'health',
  'hitRadius',
  'hometown',
  'hops',
  'inverseFireRate',
  'isDead',
  'isJumping',
  'isLocal',
  'isPlaying',
  'killedByName',
  'mass',
  'missileDamage',
  'missileSpeed',
  'moonType',
  'motivatorBroken',
  'obliterated',
  'online',
  'ping',
  'pingId',
  'pingResponse',
  'position',
  'rtt',
  'serverVersion',
  'shape',
  'ship',
  'shotBlowFrame',
  'shotsFiredThisFrame',
  'shotsPerFrame',
  'size',
  'startHealth',
  'steeringPower',
  'ttl',
  'velocity',
  'viewportScale',
  'worldSize',
  'viewFramePosition',
  'viewport',
]

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

  //Strings
  if (typeof obj1 === 'string' && typeof obj2 === 'string') {
    return obj1 === obj2
  }

  //Booleans
  if (typeof obj1 === 'boolean' && typeof obj2 === 'boolean') {
    return obj1 === obj2
  }

  // If both values are numbers
  if (typeof obj1 === 'number' && typeof obj2 === 'number') {
    return obj1 === obj2
  }
}
