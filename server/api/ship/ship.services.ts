import db from '../utils/db'
import { Ship } from '@prisma/client'

export async function createShip(ship: Ship) {
  return await db.ship.create({
    data: ship,
  })
}

export async function updateShip(ship: Ship) {
  return await db.ship.update({
    where: {
      id: ship.id,
    },
    data: {
      name: ship.name,
      variant: ship.variant,
    },
  })
}

export async function findShip(shipId: string): Promise<Ship | null> {
  return await new Promise((resolve, reject) => {
    const ship: Promise<Ship | null> = db.ship
      .findUnique({
        where: {
          id: shipId,
        },
      })
      .then((d) => d)

    if (ship !== null) {
      resolve(ship)
    } else {
      reject('No ship found')
    }
  })
}

export async function updateShipExperience(shipId: string, xp: number) {
  return await db.ship
    .update({
      where: {
        id: shipId,
      },
      data: {
        experience: xp,
      },
    })
    .then((ship) => {
      return ship
    })
    .catch((err) => {
      throw new Error(err)
    })
}

export async function getShips(id: string) {
  return await db.ship.findMany({
    where: {
      userId: id,
    },
  })
}

export async function deleteShip(id: string) {
  return await db.ship.delete({
    where: {
      id: id,
    },
  })
}
