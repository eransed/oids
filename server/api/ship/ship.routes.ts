import express from 'express'
import { Request, Response, NextFunction } from 'express'
import { isAuthenticated } from '../middleware'
import { createShip, getShips, deleteShip, updateShip } from './ship.services'
import jwt from 'jsonwebtoken'
import { JWT_ACCESS_SECRET } from '../../pub_config'
import { findUserById } from '../users/users.services'
import { User } from '../types/user'
import { createNewShip } from '../utils/factory'
import { Ship } from '@prisma/client'

export const ship = express.Router()

ship.post('/create', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers
    const  newShip: Ship = req.body

    if (!authorization) {
      res.status(401).send('You are not logged in.')
      throw new Error('No authorization')
    }

    const token = authorization.split(' ')[1]
    const payload: any = jwt.verify(token, JWT_ACCESS_SECRET)
    const caller: User | null = await findUserById(payload.userId)

    if (!caller) {
      res.status(401).send('No user found, cant create ship')
      throw new Error('No user found.')
    }

    const ship = createNewShip(newShip.name, newShip.variant, caller.id)

    await createShip(ship).then((ship) => {
      res.json(ship)
    })
  } catch (err) {
    next(err)
  }
})

ship.get('/list', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers

    if (!authorization) {
      res.status(401).send('You are not logged in.')
      throw new Error('No authorization')
    }

    const token = authorization.split(' ')[1]
    const payload: any = jwt.verify(token, JWT_ACCESS_SECRET)
    const caller: User | null = await findUserById(payload.userId)

    if (!caller) {
      res.status(401).send('You are not logged in.')
      throw new Error('No authorization')
    }

    await getShips(caller.id).then((ships) => {
      res.json(ships)
    })
  } catch (err) {
    next(err)
  }
})

ship.post('/delete', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers
    const { id } = req.body

    if (!authorization) {
      res.status(401).send('You are not logged in.')
      throw new Error('No authorization')
    }

    const token = authorization.split(' ')[1]
    const payload: any = jwt.verify(token, JWT_ACCESS_SECRET)
    const caller: User | null = await findUserById(payload.userId)

    if (!caller) {
      res.status(401).send('No user found, cant create ship')
      throw new Error('No user found.')
    }

    await deleteShip(id).then((ship) => {
      res.json(ship)
    })
  } catch (err) {
    next(err)
  }
})

ship.post('/update', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers
    const { name, variant, id } = req.body

    if (!authorization) {
      res.status(401).send('You are not logged in.')
      throw new Error('No authorization')
    }

    const token = authorization.split(' ')[1]
    const payload: any = jwt.verify(token, JWT_ACCESS_SECRET)
    const caller: User | null = await findUserById(payload.userId)

    if (!caller) {
      res.status(401).send('No user found, cant create ship')
      throw new Error('No user found.')
    }

    const ship = createNewShip(name, variant, caller.id, id)

    await updateShip(ship).then((ship) => {
      res.json(ship)
    })
  } catch (err) {
    next(err)
  }
})
