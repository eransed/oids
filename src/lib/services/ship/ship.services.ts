import axios, { AxiosError, type AxiosResponse } from 'axios'
// import type { Ship } from '@prisma/client'
import type { ShipVariant } from '../../../style/ships'
import { getLocationURL } from '../../../utils/utils'
import type { Ship } from '../../interface'
import { getAccessTokenFromLocalStorage } from '../utils/Token'

export interface newShip {
  name: string
  userId: string
}

// export interface Ship {
//   id: number
//   name: string
//   level: number
//   updatedAt: Date
//   createdAt: Date
//   experience: number
//   userId: string
// }

export const createShipService = async (newShip: Ship): Promise<AxiosResponse<Ship>> => {
  const token = getAccessTokenFromLocalStorage()

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  try {
    const response = await axios.post<Ship>(`http://${getLocationURL()}:6060/api/v1/ship/create`, newShip, config)
    return response
  } catch (err: any) {
    // Forward the error to be handled in the component
    if (err instanceof AxiosError) {
      throw err
    } else {
      // For non-Axios errors, throw a generic error
      throw new Error('An unexpected error occurred.')
    }
  }
}

export const getShips = async (testToken?: string): Promise<AxiosResponse<Ship[]>> => {
  let token = ''

  if (!testToken) {
    const savedToken = getAccessTokenFromLocalStorage()
    if (savedToken) {
      token = savedToken
    }
  } else {
    token = testToken
  }

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response: AxiosResponse<Ship[]> = await axios
    .get(`http://${getLocationURL()}:6060/api/v1/ship/list`, config)
    .then((response: AxiosResponse<Ship[]>) => {
      return response
    })
    .catch((err) => {
      throw new Error(err)
    })

  return response
}

export const deleteShip = async (id: string): Promise<AxiosResponse<Ship>> => {
  const token = getAccessTokenFromLocalStorage()

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response: AxiosResponse<Ship> = await axios
    .post(`http://${getLocationURL()}:6060/api/v1/ship/delete`, { id }, config)
    .then((response: AxiosResponse<Ship>) => {
      return response
    })
    .catch((err) => {
      throw new Error(err)
    })

  return response
}

export const updateShip = async (name: string, variant: ShipVariant, id: string): Promise<AxiosResponse<Ship>> => {
  const token = getAccessTokenFromLocalStorage()

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const body = { name, variant, id }

  try {
    const response = await axios.post(`http://${getLocationURL()}:6060/api/v1/ship/update`, body, config)
    return response
  } catch (err: any) {
    if (err instanceof AxiosError) {
      throw err
    } else throw new Error('An unexpected error occurred.')
  }
}
