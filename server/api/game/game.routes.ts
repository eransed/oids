import { Request, Response, NextFunction } from 'express'
import express from 'express'

// import { getActiveSessions } from "./game.services"
import { getPlayersFromSessionId, getSessions } from '../../main.js'
import { ApiError } from '../utils/apiError.js'
import { StatusCodes } from 'http-status-codes'

export const game = express.Router()

game.post('/players', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.query.sessionId

    if (!sessionId) {
      throw new ApiError('You must provide a sessionId.', StatusCodes.BAD_REQUEST)
    }

    const players = getPlayersFromSessionId(sessionId.toString())

    res.json({
      players,
    })
  } catch (err) {
    next(err)
  }
})

game.get('/sessions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = getSessions()

    res.json(sessions)
  } catch (err) {
    next(err)
  }
})
