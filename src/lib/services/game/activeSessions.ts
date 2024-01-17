import axios, { type AxiosResponse } from 'axios'
import type { Session } from '../../interface'
import { getLocationURL } from '../../../utils/utils'

export const getActiveSessions = async (): Promise<AxiosResponse<Session[]>> => {
  const response: AxiosResponse<Session[]> = await axios
    .get(`http://${getLocationURL()}:6060/api/v1/game/sessions`)
    .then((response: AxiosResponse<Session[]>) => {
      return response
    })
    .catch((err) => {
      return err
    })

  return response
}
