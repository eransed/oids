import { describe, expect, it, vi } from 'vitest'
import type { PhotonLaser, SpaceObject } from '../interface'
import { createSpaceObject, newPhotonLaser } from '../factory'
import * as physics from '../physics/physics'
import * as updateShots from '../physics/updateShots'
import * as mechanics from '../mechanics'
import { handleCollisions } from '../physics/handleCollisions'

//First time trying a vitest
describe('Physics tests', () => {
  //Test setup------------------------------------------------------------

  //Creating a spaceObject to test
  const so: SpaceObject = createSpaceObject('TestObject')
  const so1 = createSpaceObject('so1')
  const so2 = createSpaceObject('so2')
  const dt = 60

  //Setting values that updateSpaceObject is using
  so.acceleration = { x: 0.1, y: 0.1 }
  so.angularVelocity = 0.5
  so.cameraVelocity = { x: 0.1, y: 0.1 }

  //Getting spaceObject back from updateSpaceObject
  const result = physics.updateSpaceObject(JSON.parse(JSON.stringify(so)), dt)

  const updateShotsSpy = vi.spyOn(updateShots, 'updateShots')

  //Tests------------------------------------------------------------------
  it('updateSpaceObject position', () => {
    expect(result.position).not.toEqual(so.position)
  })

  it('updateSpaceObject velocity', () => {
    expect(result.velocity).not.toEqual(so.velocity)
  })

  it('updateSpaceObject angleDegree', () => {
    expect(result.angleDegree).not.toEqual(so.angleDegree)
  })

  it('updateSpaceObject cameraVelocity', () => {
    expect(result.cameraVelocity).not.toEqual(so.cameraVelocity)
  })

  it('updateSpaceObject calling updateShots', () => {
    const shot: PhotonLaser = newPhotonLaser()

    result.shotsInFlight = [shot]

    physics.updateSpaceObject(result, dt)

    expect(updateShotsSpy).toHaveBeenCalled()
  })

  it('updateSpaceObject calling handleDeathExplosion', () => {
    const handleDeathExplosionSpy = vi.spyOn(mechanics, 'handleDeathExplosion')
    result.health = 0

    physics.updateSpaceObject(result, dt)

    expect(handleDeathExplosionSpy).toHaveBeenCalled()
  })

  it('handleCollisions detecting collision', () => {
    const resetCollisionsSpy = vi.spyOn(physics, 'resetCollisions')

    handleCollisions(so1.cameraPosition, [so1, so2])

    expect(so1.colliding).toBe(true)
    expect(so2.colliding).toBe(true)
    expect(so1.collidingWith[0].position).toStrictEqual(so2.position)
    expect(so2.collidingWith[0].position).toStrictEqual(so1.position)
    expect(resetCollisionsSpy).toHaveBeenCalledTimes(1)
  })

  it('resetCollisions', () => {
    physics.resetCollisions([so1, so2])

    expect(so1.colliding).toBe(false)
    expect(so2.colliding).toBe(false)
    expect(so1.collidingWith).empty
    expect(so2.collidingWith).empty
  })
})
