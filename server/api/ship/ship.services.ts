import db from '../utils/db'
import { newShip } from '../types/ship'

export function createShip(ship: newShip) {
  return db.ship.create({
    data: ship,
  })
}
