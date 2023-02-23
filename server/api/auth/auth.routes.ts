import express from "express"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcrypt"
import { generateTokens } from "../utils/jwt"
import {
  addRefreshTokenToWhitelist,
  deleteRefreshToken,
  findRefreshTokenById,
  revokeTokens,
} from "./auth.services"
import { findUserById } from "../users/users.services"
import hashToken from "../utils/hashToken"
const jwt = require("jsonwebtoken")
import type { JwtPayload } from "jsonwebtoken"
import { JWT_REFRESH_SECRET } from "../../pub_config"

export const auth = express.Router()

const {
  findUserByEmail,
  createUserByEmailAndPassword,
} = require("../users/users.services")

//Register endpoint
auth.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      res.status(400)
      throw new Error("You must provide an email and a password.")
    }

    const existingUser = await findUserByEmail(email)

    if (existingUser) {
      res.status(400)
      throw new Error("Email already in use.")
    }

    const user = await createUserByEmailAndPassword({ email, password })
    const jti = uuidv4()
    const { accessToken, refreshToken } = generateTokens(user, jti)
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id })

    res.json({
      accessToken,
      refreshToken,
    })
  } catch (err) {
    next(err)
  }
})

//User login endpoint
auth.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      res.status(400)
      throw new Error("You must provide an email and a password.")
    }

    const existingUser = await findUserByEmail(email)

    if (!existingUser) {
      res.status(403)
      throw new Error("Invalid login credentials.")
    }

    const validPassword = await bcrypt.compare(password, existingUser.password)
    if (!validPassword) {
      res.status(403)
      throw new Error("Invalid login credentials.")
    }

    const jti = uuidv4()
    const { accessToken, refreshToken } = generateTokens(existingUser, jti)
    await addRefreshTokenToWhitelist({
      jti,
      refreshToken,
      userId: existingUser.id,
    })

    res.json({
      accessToken,
      refreshToken,
    })
  } catch (err) {
    next(err)
  }
})

//Refreshtoken
auth.post("/refreshToken", async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      res.status(400)
      throw new Error("Missing refresh token.")
    }

    const payload = jwt.verify(
      refreshToken,
      JWT_REFRESH_SECRET,
      (err: Error, decoded: JwtPayload) => {
        if (err) {
          res.status(401)
          throw new Error("Refreshtoken is not valid")
        } else if (decoded) return decoded
      }
    )

    const savedRefreshToken = await findRefreshTokenById(payload.jti)

    if (!savedRefreshToken || savedRefreshToken.revoked === true) {
      res.status(401)
      throw new Error("Unauthorized")
    }

    const hashedToken = hashToken(refreshToken)
    if (hashedToken !== savedRefreshToken.hashedToken) {
      res.status(401)
      throw new Error("Unauthorized")
    }

    const user = await findUserById(payload.userId)
    if (!user) {
      res.status(401)
      throw new Error("Unauthorized")
    }

    await deleteRefreshToken(savedRefreshToken.id)
    const jti = uuidv4()
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user,
      jti
    )
    await addRefreshTokenToWhitelist({
      jti,
      refreshToken: newRefreshToken,
      userId: user.id,
    })

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    })
  } catch (err) {
    next(err)
  }
})

// This endpoint is only for demo purpose.
// Move this logic where you need to revoke the tokens( for ex, on password reset)
auth.post("/revokeRefreshTokens", async (req, res, next) => {
  try {
    const { userId } = req.body
    await revokeTokens(userId)
    res.json({ message: `Tokens revoked for user with id #${userId}` })
  } catch (err) {
    next(err)
  }
})
