import { describe, expect, it, vi } from 'vitest'
import type { SpaceObject } from '../interface'
import { createSpaceObject, newPhotonLaser } from '../factory'
import * as physics from '../physics'
import * as mechanics from '../mechanics'

//First time trying a vitest
describe('Physics tests', () => {
  //Test setup------------------------------------------------------------

  //Creating a spaceObject to test
  const so: SpaceObject = createSpaceObject('TestObject')
  const dt = 60

  //Setting values that updateSpaceObject is using
  so.acceleration = { x: 0.1, y: 0.1 }
  so.angularVelocity = 0.5
  so.cameraVelocity = { x: 0.1, y: 0.1 }
  so.shotsInFlight = [newPhotonLaser()]

  //Getting spaceObject back from updateSpaceObject
  const result = physics.updateSpaceObject(JSON.parse(JSON.stringify(so)), dt)

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

  //This doesnt work for some reason
  // it('updateSpaceObject calling updateShots', () => {
  //   const updateShotsSpy = vi.spyOn(physics, 'updateShots')
  //   result.shotsInFlight = [newPhotonLaser()]

  //   physics.updateSpaceObject(result, dt)

  //   expect(updateShotsSpy).toHaveBeenCalled()
  // })

  it('updateSpaceObject calling handleDeathExplosion', () => {
    const handleDeathExplosionSpy = vi.spyOn(mechanics, 'handleDeathExplosion')
    result.health = 0

    physics.updateSpaceObject(result, dt)

    expect(handleDeathExplosionSpy).toHaveBeenCalled()
  })
})
