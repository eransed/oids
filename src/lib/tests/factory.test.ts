import { describe, it, expectTypeOf } from 'vitest'
import { createShip, createSpaceObject } from '../factory'
import type { SpaceObject } from '../interface'
import type { Ship } from '@prisma/client'

describe('Factory tests', () => {
  it('createSpaceObject returns a spaceObject', () => {
    const newSpaceObject = createSpaceObject()

    expectTypeOf(newSpaceObject).toMatchTypeOf<SpaceObject>()
  })

  it('createShip returns a ship', () => {
    const newShip = createShip('test')

    expectTypeOf(newShip).toMatchTypeOf<Ship>()
  })
})
