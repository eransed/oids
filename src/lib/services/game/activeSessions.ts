import axios, { type AxiosResponse } from 'axios'
import type { Session } from '../../interface'
import { getLocationURL } from '../../../utils/utils'
import { handleAxiosError } from '../utils/errorHandler'

export const getActiveSessions = async (): Promise<Session[]> => {
  try {
    const response: AxiosResponse<Session[]> = await axios.get(`http://${getLocationURL()}:6060/api/v1/game/sessions`)
    return response.data
  } catch (err: any) {
    handleAxiosError(err)
    throw new Error(err)
  }
}
