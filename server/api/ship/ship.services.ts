import { getShipXpRequirement } from '../../../src/lib/services/utils/shipLevels'
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

export async function updateShipExperienceAndLevel(shipId: string): Promise<Ship | undefined> {
  const xpIncrementValue = 50

  return await findShip(shipId).then((ship) => {
    if (ship) {
      let level = ship.level
      let xp = ship.experience
      const maxXp = getShipXpRequirement(ship.level)
      xp += xpIncrementValue
      if (xp >= maxXp) {
        console.log(`Ship ${ship.name} reached lvl ${level + 1}`)
        level = ship.level + 1
        xp = xp - maxXp
      }

      return db.ship
        .update({
          where: {
            id: shipId,
          },
          data: {
            level: level,
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
