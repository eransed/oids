import { Request, Response, NextFunction } from 'express'
import express from 'express'
import { isAuthenticated } from '../middleware'
import { deleteUser, findUserByEmail, findUserById, getUsers, saveGame, updateUser } from './users.services'
import { Game, Prisma, User } from '@prisma/client'
import { getPayLoadFromJwT } from '../utils/jwt'

export const users = express.Router()

users.get('/profile', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  if (!process.env.JWT_ACCESS_SECRET) throw new Error('No JWT_ACCESS_SECRET')

  try {
    const { authorization } = req.headers

    if (authorization) {
      const token = authorization.split(' ')[1]

      const payLoadFromJWt = await getPayLoadFromJwT(token, process.env.JWT_ACCESS_SECRET).catch(() => {
        res.status(401).send('Token not valid')
      })

      if (!payLoadFromJWt) return

      const user: User | null = await findUserById(payLoadFromJWt.payload.userId)

      if (!user) {
        res.status(404)
        throw new Error('No user found')
      }

      res.json(user)
    }
  } catch (err) {
    next(err)
  }
})

const userIncludes = Prisma.validator<Prisma.UserArgs>()({
  include: { ships: true, gameHistory: true },
})

users.post('/update', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  if (!process.env.JWT_ACCESS_SECRET) throw new Error('No JWT_ACCESS_SECRET')

  try {
    const user: User & Prisma.UserGetPayload<typeof userIncludes> = req.body

    const { authorization } = req.headers

    if (!authorization) {
      res.status(401).send('You are not logged in.')
      throw new Error('No authorization')
    }

    const token = authorization.split(' ')[1]
    const payloadFromJwT = await getPayLoadFromJwT(token, process.env.JWT_ACCESS_SECRET).catch(() => {
      res.status(401).send('Error on getting payload from JwT')
    })

    if (!payloadFromJwT) return
    const caller: User | null = await findUserById(payloadFromJwT.payload.userId)

    // if (!caller || caller.role !== 'admin') {
    //   res.status(403).send('Forbidden, you are not admin')
    //   throw new Error('Forbidden, you are not admin.')
    // }

    if (!user.id) {
      res.status(400)
      throw new Error('You must provide a user id.')
    }

    const existingUser = await findUserById(user.id)

    if (!existingUser) {
      res.status(404).send('No user found to update with that id.')
      throw new Error(`No user found with id: ${user.id}`)
    }

    await updateUser(user)
      .then((d) => {
        res.status(200).json(d)
      })
      .catch((err: Error) => {
        res.status(500).send(err.message)
        throw new Error(err.message)
      })
  } catch (err) {
    next(err)
  }
})

users.post('/savegame', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  if (!process.env.JWT_ACCESS_SECRET) throw new Error('No JWT_ACCESS_SECRET')

  try {
    const { authorization } = req.headers

    if (!authorization) {
      res.status(401)
      throw new Error('No authorization')
    }

    const token = authorization.split(' ')[1]
    const payloadFromJwT = await getPayLoadFromJwT(token, process.env.JWT_ACCESS_SECRET).catch(() => {
      res.status(401).send('Error on getting payload from JwT')
    })

    if (!payloadFromJwT) return
    const user: User | null = await findUserById(payloadFromJwT.payload.userId)

    if (!user) {
      res.status(404)
      throw new Error('No user found')
    }

    const game: Game = req.body

    await saveGame(user.id, game.win, game.played, game.sessionId)

    res.json(game)
  } catch (err) {
    next(err)
  }
})

users.get('/list', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  if (!process.env.JWT_ACCESS_SECRET) throw new Error('No JWT_ACCESS_SECRET')

  try {
    const { authorization } = req.headers

    if (!authorization) {
      res.status(401)
      throw new Error('No authorization')
    }

    const token = authorization.split(' ')[1]
    const payloadFromJwT = await getPayLoadFromJwT(token, process.env.JWT_ACCESS_SECRET).catch(() => {
      res.status(401).send('Error on getting payload from JwT')
    })

    if (!payloadFromJwT) return
    const user: User | null = await findUserById(payloadFromJwT.payload.userId)

    if (!user || user.role !== 'admin') {
      res.status(403)
      throw new Error('Forbidden, you are not admin.')
    }

    const users: Omit<User, 'password'>[] = await getUsers()

    if (users) {
      res.json(users)
    }
  } catch (err) {
    next(err)
  }
})

users.post('/deleteUser', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  if (!process.env.JWT_ACCESS_SECRET) throw new Error('No JWT_ACCESS_SECRET')
  try {
    const { authorization } = req.headers

    const { email } = req.body

    if (!email) {
      res.status(404)
      throw new Error('Please provide a users email to delete user.')
    }

    if (!authorization) {
      res.status(401)
      throw new Error('No authorization')
    }

    const token = authorization.split(' ')[1]

    const payloadFromJwT = await getPayLoadFromJwT(token, process.env.JWT_ACCESS_SECRET).catch(() => {
      res.status(401).send('Error on getting payload from JwT')
    })

    if (!payloadFromJwT) return

    const user: User | null = await findUserById(payloadFromJwT.payload.userId)

    if (!user || user.role !== 'admin') {
      res.status(403)
      throw new Error('Forbidden, you are not admin.')
    }
    const userToDelete: User | null = await findUserByEmail(email as string)

    if (!userToDelete) {
      res.status(404)
      throw new Error('User not found - provide an email to an existing user.')
    }

    const response: User = await deleteUser(userToDelete)

    res.send(response)
  } catch (err) {
    next(err)
  }
})

users.post('/deleteMe', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  if (!process.env.JWT_ACCESS_SECRET) throw new Error('No JWT_ACCESS_SECRET')

  try {
    const { authorization } = req.headers

    if (!authorization) {
      res.status(401)
      throw new Error('No authorization')
    }

    const token = authorization.split(' ')[1]

    const payloadFromJwT = await getPayLoadFromJwT(token, process.env.JWT_ACCESS_SECRET).catch(() => {
      res.status(401).send('Error on getting payload from JwT')
    })

    if (!payloadFromJwT) return

    const user: User | null = await findUserById(payloadFromJwT.payload.userId)

    if (!user) {
      res.status(404)
      throw new Error('User not found - provide an id to an existing user.')
    }

    const userToDelete: User | null = await findUserById(user.id)

    if (userToDelete) {
      const response: User = await deleteUser(userToDelete)

      res.send(response)
    } else {
      res.status(500).send('User could not be deleted')
      throw new Error('User could not be deleted')
    }
  } catch (err) {
    next(err)
  }
})
function next(): void {
  throw new Error('Function not implemented.')
}
