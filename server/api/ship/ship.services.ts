import db from '../utils/db'
import { newShip } from '../types/ship'

export async function createShip(ship: newShip) {
  return await db.ship.create({
    data: ship,
  })
}

export async function getShips(id: string) {
  return await db.ship.findMany({
    where: {
      userId: id,
    },
  })
}

export async function deleteShip(id: number) {
  return await db.ship.delete({
    where: {
      id: id,
    },
  })
}
