import axios, { type AxiosResponse } from 'axios'

import { isLoggedInStore } from '../../../stores/stores'
import type { Tokens } from '../../interface'

const login = async (req: FormData) => {
  let status
  let data
  let error

  const json = Object.fromEntries(req.entries())
  await axios
    .post(`http://${location.hostname}:6060/api/v1/auth/login`, json)
    .then((response: AxiosResponse<Tokens>) => {
      data = response.data
      status = response.status
      if (status === 200) {
        localStorage.setItem('accessToken', response.data.accessToken)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        isLoggedInStore.set(true)
      }
    })
    .catch((err) => {
      error = err
      console.error(err)
    })

  return { status, data, error }
}

export default login
