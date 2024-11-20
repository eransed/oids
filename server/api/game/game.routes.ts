import { Request, Response, NextFunction } from 'express'
import express from 'express'

// import { getActiveSessions } from "./game.services"
import { getPlayersFromSessionId, getSessions } from '../../main.js'
import { ApiError } from '../utils/apiError.js'
import { StatusCodes } from 'http-status-codes'
import { Session } from '../../../src/lib/interface.js'

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
    const sessionMap: Map<string, Session> = getSessions()

    let sessions: Session[] = []

    sessionMap.forEach((v) => {
      sessions.push(v)
    })

    res.json(sessions)
  } catch (err) {
    next(err)
  }
})
