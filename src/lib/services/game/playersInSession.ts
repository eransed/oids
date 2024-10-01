import axios, { type AxiosResponse } from 'axios'
import type { Session } from '../../interface'
import { getLocationURL } from '../../../utils/utils'
import { handleAxiosError } from '../utils/errorHandler'

export const getPlayersInSession = async (req: string) => {
  try {
    const response: AxiosResponse<Session, any> = await axios.post(`http://${getLocationURL()}:6060/api/v1/game/players?sessionId=${req}`)
    return response.data
  } catch (err: any) {
    handleAxiosError(err)
    throw new Error(err)
  }
}
