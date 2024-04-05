import { describe, expect, expectTypeOf, it } from 'vitest'
import login from '../services/auth/login'
import getProfile from '../services/user/profile'
import { getShips } from '../services/ship/ship.services'
import { getActiveSessions } from '../services/game/activeSessions'
// import type { User, Prisma, Ship } from '@prisma/client'
import { env } from './env'
import type { Session, Ship, User } from '../interface'

describe('Services tests', () => {
  let accessToken: string
  const email = env.TEST_EMAIL
  const password = env.TEST_PASSWORD

  it('login service', async () => {
    const response = await login(email, password)
    accessToken = response.data.accessToken
    expect(response.status).toBe(200)
  })

  it('getProfile service', async () => {
    const result = await getProfile(accessToken)
    expect(result.status).toBe(200)
    expectTypeOf(result.data).toMatchTypeOf<User>()
  })

  it('getShips service', async () => {
    const result = await getShips(accessToken)
    expect(result.status).toBe(200)
    expectTypeOf(result.data).toMatchTypeOf<Ship[]>()
  })

  it('getActiveSessions service', async () => {
    const result = await getActiveSessions()
    expect(result.status).toBe(200)
    expectTypeOf(result.data).toMatchTypeOf<Session[]>()
  })
})
