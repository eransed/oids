import { getShipXpRequirement } from '../../../src/lib/services/utils/shipLevels'
import { ApiError } from '../utils/apiError'
import db from '../utils/db'
import { Prisma, Ship } from '@prisma/client'
import { StatusCodes } from 'http-status-codes'

export async function createShip(ship: Ship) {
  try {
    const newShip = await db.ship.create({
      data: ship,
    })

    return newShip
  } catch (err: any) {
    // Handle specific database errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        // P2002 is a Prisma error for uniqueness constraint violation
        throw new ApiError('Ship name already taken. Please choose another.', StatusCodes.BAD_REQUEST, 'Unique constraint error')
      }
    }

    // If it's another error, rethrow it
    throw new ApiError('Failed to create ship', StatusCodes.INTERNAL_SERVER_ERROR)
  }
}

export async function updateShip(ship: Ship) {
  try {
    const updatedShip = await db.ship.update({
      where: {
        id: ship.id,
      },
      data: {
        name: ship.name,
        variant: ship.variant,
      },
    })

    return updatedShip
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if ((err.code = 'P2002')) {
        throw new ApiError('Cant update to that name, its already taken!', StatusCodes.BAD_REQUEST)
      }
    }

    throw new ApiError('Failed to update ship', StatusCodes.INTERNAL_SERVER_ERROR)
  }
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

export async function updateShipExperienceAndLevel(shipId: string, xpIncrementValue = 50): Promise<Ship | undefined> {
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
          throw new ApiError('Failed to update ship', StatusCodes.INTERNAL_SERVER_ERROR)
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
