import { Request, Response, NextFunction, response } from 'express'
import express from 'express'
import { isAuthenticated } from '../middleware'
import { deleteUser, findUserByEmail, findUserById, getGameHistory, getUsers, saveGame, updateUser } from './users.services'
import jwt from 'jsonwebtoken'
import { JWT_ACCESS_SECRET } from '../../pub_config'

import { Game, Player, User, UserProfile } from '../types/user'

export const users = express.Router()

users.get('/profile', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers

    if (authorization) {
      const token = authorization.split(' ')[1]

      const payload: any = jwt.verify(token, JWT_ACCESS_SECRET)

      const user: User | null = await findUserById(payload.userId)
      const gameHistory: Game[] = await getGameHistory(payload.userId)

      if (!user) {
        res.status(404)
        throw new Error('No user found')
      }

      const userProfile: UserProfile = {
        name: user.name,
        id: user.id,
        email: user.email,
        password: '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        gameHistory: gameHistory,
        role: user.role,
      }

      res.json(userProfile)
    }
  } catch (err) {
    next(err)
  }
})

users.post('/update', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, role, name } = req.body

    if (!email) {
      res.status(400)
      throw new Error('You must provide an email.')
    }

    const existingUser = await findUserByEmail(email)

    if (!existingUser) {
      res.status(404)
      throw new Error(`No user found with email: ${email}`)
    }

    existingUser.role = role
    existingUser.name = name
    existingUser.email = email
    await updateUser(existingUser)

    const updatedUser = await findUserByEmail(email)

    res.json(updatedUser)
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

    let users: User[] = await getUsers()

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
