import axios, { type AxiosResponse } from 'axios'

export interface newShip {
  name: string
  userId: string
}

export interface Ship {
  id: number
  name: string
  level: number
  updatedAt: Date
  createdAt: Date
  experience: number
  userId: string
}

export const createShip = async (name: string): Promise<AxiosResponse<Ship>> => {
  const token = localStorage.getItem('accessToken')

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response: AxiosResponse<Ship> = await axios
    .post(`http://${location.hostname}:6060/api/v1/ship/create`, { name }, config)
    .then((response: AxiosResponse<Ship>) => {
      return response
    })
    .catch((err) => {
      throw new Error(err)
    })

  return response
}

export const getShips = async (): Promise<AxiosResponse<Ship[]>> => {
  const token = localStorage.getItem('accessToken')

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response: AxiosResponse<Ship[]> = await axios
    .get(`http://${location.hostname}:6060/api/v1/ship/list`, config)
    .then((response: AxiosResponse<Ship[]>) => {
      return response
    })
    .catch((err) => {
      throw new Error(err)
    })

  return response
}

export const deleteShip = async (id: number): Promise<AxiosResponse<Ship>> => {
  const token = localStorage.getItem('accessToken')

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response: AxiosResponse<Ship> = await axios
    .post(`http://${location.hostname}:6060/api/v1/ship/delete`, { id }, config)
    .then((response: AxiosResponse<Ship>) => {
      return response
    })
    .catch((err) => {
      throw new Error(err)
    })

  return response
}
