import axios, { AxiosError, type AxiosResponse } from 'axios'

import { isLoggedInStore } from '../../../stores/stores'
import type { Tokens } from '../../interface'
import { getLocationURL } from '../../../utils/utils'

const login = async (email: string, password: string): Promise<AxiosResponse> => {
  const json = {
    email: email,
    password: password,
  }

  return await axios
    .post(`http://${getLocationURL()}:6060/api/v1/auth/login`, json)
    .then((response: AxiosResponse<Tokens>) => {
      if (response.status === 200) {
        isLoggedInStore.set(true)
      }
      return response
    })
    .catch((error: AxiosError) => {
      throw new Error(error.message)
    })
}

export default login
