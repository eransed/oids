import { describe, expect, expectTypeOf, it } from 'vitest'
import { updateSpaceObject } from '../physics'
import type { SpaceObject } from '../interface'
import { createSpaceObject } from '../factory'

//First time trying a vitest
describe('Physics tests', () => {
  it('updateSpaceObject returns correct obj and type', () => {
    const so: SpaceObject = createSpaceObject('TestObject')
    const dt = 60

    const result = updateSpaceObject(so, dt)

    expect(result).toBe(so)

    expectTypeOf(result).toMatchTypeOf(so)
  })
})
