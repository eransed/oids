import { Request, Response, NextFunction } from "express"
import express from "express"

import { getPlayerListFromSessionId, getActiveSessions } from "./game.services"

export const game = express.Router()

game.post("/players", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.query.sessionId

    if (!sessionId) {
      res.status(400)
      throw new Error("You must provide a sessionId.")
    }

    const players = getPlayerListFromSessionId(sessionId.toString())

    res.json({
      players,
    })
  } catch (err) {
    next(err)
  }
})

game.get("/sessions", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = getActiveSessions()

    res.json(sessions)
  } catch (err) {
    next(err)
  }
})
