import { Request, Response, NextFunction } from "express"
import express from "express"

import { getPlayerListFromSessionId } from "./game.services"

export const game = express.Router()

game.post("/players", async (req: Request, res: Response, next: NextFunction) => {
  console.log("getting players")
  try {
    const { sessionId } = req.body

    if (!sessionId) {
      res.status(400)
      throw new Error("You must provide a sessionId.")
    }

    const playerList = await getPlayerListFromSessionId(sessionId)

    res.json({
      playerList,
    })
  } catch (err) {
    next(err)
  }
})
