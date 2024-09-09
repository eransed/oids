import axios, { AxiosError, type AxiosResponse } from 'axios'

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
      return response
    })
    .catch((error: AxiosError) => {
      throw new Error(error.message)
    })
}

export default login
