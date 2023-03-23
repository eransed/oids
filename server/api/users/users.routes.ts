import { Request, Response, NextFunction } from "express"
import express from "express"
import { isAuthenticated } from "../middleware"
import { findUserById, getGameHistory, saveGame } from "./users.services"
import jwt from "jsonwebtoken"
import { JWT_ACCESS_SECRET } from "../../pub_config"

import { Game, User } from "../types/user"

export const users = express.Router()

users.get("/profile", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers

    if (authorization) {
      const token = authorization.split(" ")[1]

      const payload: any = jwt.verify(token, JWT_ACCESS_SECRET)

      const user: User | null = await findUserById(payload.userId)
      const gameHistory: Game[] = await getGameHistory(payload.userId)

      if (!user) {
        res.status(404)
        throw new Error("No user found")
      }

      //Not show hashed password
      user.password = ":)"

      res.json({ user, gameHistory })
    }
  } catch (err) {
    next(err)
  }
})

//Save game - can only take win boolean for now
users.post("/savegame", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers

    if (!authorization) {
      res.status(401)
      throw new Error("No authorization")
    }

    const token = authorization.split(" ")[1]
    const payload: any = jwt.verify(token, JWT_ACCESS_SECRET)
    const user: User | null = await findUserById(payload.userId)

    if (!user) {
      res.status(404)
      throw new Error("No user found")
    }

    const game: Game = req.body

    await saveGame(user.id, game.win)

    res.json({ message: "Game saved successfully!", game: game })
  } catch (err) {
    next(err)
  }
})
