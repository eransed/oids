import { Request, Response, NextFunction } from 'express'
import express from 'express'

// import { getActiveSessions } from "./game.services"
import { getPlayersFromSessionId, getSessions } from '../../main.js'

export const game = express.Router()

game.post('/players', async (req: Request, res: Response, next: NextFunction) => {
 try {
  const sessionId = req.query.sessionId

  if (!sessionId) {
   res.status(400)
   throw new Error('You must provide a sessionId.')
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
