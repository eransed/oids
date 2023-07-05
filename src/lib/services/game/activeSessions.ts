import axios, { type AxiosResponse } from 'axios'
import { Tester } from 'mathil'

import type { Session } from '../../interface'

export const activeSessions = async (): Promise<AxiosResponse<Session[]>> => {
 const response: AxiosResponse<Session[]> = await axios
  .get(`http://${location.hostname}:6060/api/v1/game/sessions`)
  .then((response: AxiosResponse<Session[]>) => {
   return response
  })
  .catch((err) => {
   return err
  })

 return response
}

// const testActiveSessions = new Tester(
//   (a: AxiosResponse<Session[], any>, b: AxiosResponse<Session[], any>) => {
//     return a.status === b.status && a.data === b.data
//   }, (t: AxiosResponse<Session[], any>) => {return t.data.join(' '),
//   'Test activeSessions get request output'
// }
// )

// let expected: AxiosResponse<Session[], any>
// activeSessions().then((r) => {
//   expected = r
//   activeSessions().then((q) => {
//     testActiveSessions.test(expected, () => { return q })
//   })
// })
