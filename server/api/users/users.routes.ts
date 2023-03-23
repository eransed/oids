import { Request, Response, NextFunction } from "express"
import express from "express"
import { isAuthenticated } from "../middleware"
import { findUserById } from "./users.services"
import jwt from "jsonwebtoken"
import { JWT_ACCESS_SECRET } from "../../pub_config"

import { User } from "../types/user"

export const users = express.Router()

users.get("/profile", isAuthenticated, async (req: any, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers

    const token = authorization.split(" ")[1]

    const payload: any = jwt.verify(token, JWT_ACCESS_SECRET)

    const user: User | null = await findUserById(payload.userId)

    if (user !== null) {
      user.password = ":)"
    }

    res.json(user)
  } catch (err) {
    next(err)
  }
})
