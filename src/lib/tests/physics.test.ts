import { expect, expectTypeOf, test } from 'vitest'
import { updateSpaceObject } from '../physics'
import type { SpaceObject } from '../interface'
import { createSpaceObject } from '../factory'

//First time trying a vitest
test('updateSpaceObject should return a SpaceObject', () => {
  const so: SpaceObject = createSpaceObject('TestObject')
  const dt = 60

  const result = updateSpaceObject(so, dt)

  result.health = 1

  expect(result).toBe(so)

  expectTypeOf(result).toMatchTypeOf(so)
})
