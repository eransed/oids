import express from 'express'
import { auth } from '../auth/auth.routes'
import { users } from '../users/users.routes'
import { game } from '../game/game.routes'
import { ship } from '../ship/ship.routes'

const router = express.Router()

router.use('/auth', auth)
router.use('/users', users)
router.use('/game', game)
router.use('/ship', ship)

export default router
