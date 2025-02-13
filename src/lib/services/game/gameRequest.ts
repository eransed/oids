import axios, { type AxiosResponse } from 'axios'
import type { Session } from '../../interface'
import { getLocationURL } from '../../../utils/utils'
import { handleAxiosError } from '../utils/errorHandler'

export const requestEnemyShip = async (sessionId: string): Promise<string> => {
  try {
    const response: AxiosResponse<string> = await axios.get(`http://${getLocationURL()}:6060/api/v1/game/request/enemyship?sessionId=${sessionId}`)
    return response.data
  } catch (err: any) {
    handleAxiosError(err)
    throw new Error(err)
  }
}
