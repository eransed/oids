import { Request, Response, NextFunction, response } from 'express'
import express from 'express'
import { isAuthenticated } from '../middleware'
import { deleteUser, findUserByEmail, findUserById, getUsers, saveGame, updateUser } from './users.services'
import jwt from 'jsonwebtoken'
import { JWT_ACCESS_SECRET } from '../../pub_config'

import { Game, Player, User } from '../types/user'

export const users = express.Router()

users.get('/profile', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers

    if (authorization) {
      const token = authorization.split(' ')[1]

      const payload: any = jwt.verify(token, JWT_ACCESS_SECRET)

      const user: User | null = await findUserById(payload.userId)

      if (user) {
        user.password = ''
      }

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

users.post('/update', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: User = req.body

    const { authorization } = req.headers

    if (!authorization) {
      res.status(401).send('You are not logged in.')
      throw new Error('No authorization')
    }

    const token = authorization.split(' ')[1]
    const payload: any = jwt.verify(token, JWT_ACCESS_SECRET)
    const caller: User | null = await findUserById(payload.userId)

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
        res.status(200).json(user)
      })
      .catch((err: Error) => {
        res.status(500).send('Prisma DB did not approve this update.')
        throw new Error(err.message)
      })
  } catch (err) {
    next(err)
  }
})

users.post('/savegame', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers

    if (!authorization) {
      res.status(401)
      throw new Error('No authorization')
    }

    const token = authorization.split(' ')[1]
    const payload: any = jwt.verify(token, JWT_ACCESS_SECRET)
    const user: User | null = await findUserById(payload.userId)

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
  try {
    const { authorization } = req.headers

    if (!authorization) {
      res.status(401)
      throw new Error('No authorization')
    }

    const token = authorization.split(' ')[1]
    const payload: any = jwt.verify(token, JWT_ACCESS_SECRET)
    const user: User | null = await findUserById(payload.userId)

    if (!user || user.role !== 'admin') {
      res.status(403)
      throw new Error('Forbidden, you are not admin.')
    }

    const users: User[] = await getUsers()

    users.forEach((user) => (user.password = ':)'))

    if (users) {
      res.json(users)
    }
  } catch (err) {
    next(err)
  }
})

users.delete('/delete', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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
    const payload: any = jwt.verify(token, JWT_ACCESS_SECRET)
    const user: User | null = await findUserById(payload.userId)

    if (!user || user.role !== 'admin') {
      res.status(403)
      throw new Error('Forbidden, you are not admin.')
    }
    const userToDelete: User | null = await findUserByEmail(email)

    if (!userToDelete) {
      res.status(404)
      throw new Error('User not found - provide an email to an existing user.')
    }

    const response: string = await deleteUser(userToDelete)

    res.send(response)
  } catch (err) {
    next(err)
  }
})
