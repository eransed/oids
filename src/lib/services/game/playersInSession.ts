import axios, { type AxiosResponse } from 'axios'
import type { Session } from '../../interface'

export const playersInSession = async (req: string): Promise<AxiosResponse<Session>> => {
 const response: AxiosResponse<Session> = await axios
  .post(`http://${location.hostname}:6060/api/v1/game/players?sessionId=${req}`)
  .then((response: AxiosResponse<Session>) => {
   return response
  })
  .catch((err) => {
   return err
  })

 return response
}
