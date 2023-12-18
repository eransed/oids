import { describe, expect, expectTypeOf, it } from 'vitest'
import login from '../services/auth/login'
import dotenv from 'dotenv'
import getProfile from '../services/user/profile'
import { getShips } from '../services/ship/ship.services'
import type { User, Prisma, Ship } from '@prisma/client'
import type { userIncludes } from '../../stores/stores'

dotenv.config()

describe('Services tests', () => {
  let accessToken = ''

  it('login service', async () => {
    const email = process.env.TEST_EMAIL
    const password = process.env.TEST_PASSWORD

    if (email && password) {
      const response = await login(email, password)
      accessToken = response.data.accessToken

      expect(response.status).toBe(200)
    }
  })

  it('getProfile service', async () => {
    const result = await getProfile(accessToken)

    expect(result.status).toBe(200)
    expectTypeOf(result.data).toMatchTypeOf<User & Prisma.UserGetPayload<typeof userIncludes>>()
  })

  it('getShips service', async () => {
    const result = await getShips(accessToken)

    expect(result.status).toBe(200)
    expectTypeOf(result.data).toMatchTypeOf<Ship[]>()
  })
})
