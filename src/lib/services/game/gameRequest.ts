import axios, { type AxiosResponse } from 'axios'
import type { Session } from '../../interface'
import { getLocationURL } from '../../../utils/utils'
import { handleAxiosError } from '../utils/errorHandler'

export const requestEnemyShip = async (sessionId: string, name: string): Promise<string> => {
  try {
    const response: AxiosResponse<string> = await axios.get(`http://${getLocationURL()}:6060/api/v1/game/request/enemyship?sessionId=${sessionId}&clientId=${name}`)
    return response.data
  } catch (err: any) {
    handleAxiosError(err)
    throw new Error(err)
  }
}

export const requestCompanionShip = async (sessionId: string, name: string): Promise<string> => {
  try {
    const response: AxiosResponse<string> = await axios.get(`http://${getLocationURL()}:6060/api/v1/game/request/companionship?sessionId=${sessionId}&clientId=${name}`)
    return response.data
  } catch (err: any) {
    handleAxiosError(err)
    throw new Error(err)
  }
}

export const requestGameServerRestart = async (sessionId: string, name: string): Promise<string> => {
  try {
    const response: AxiosResponse<string> = await axios.get(`http://${getLocationURL()}:6060/api/v1/game/request/restart?sessionId=${sessionId}&clientId=${name}`)
    return response.data
  } catch (err: any) {
    handleAxiosError(err)
    throw new Error(err)
  }
}
