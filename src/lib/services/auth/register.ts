import axios, { AxiosError, type AxiosResponse } from 'axios'

// import type { User } from '@prisma/client'
import type { Tokens } from '../../interface'

import { getLocationURL } from '../../../utils/utils'

const register = async (email: string, name: string, password: string): Promise<AxiosResponse<Tokens>> => {
  const token = localStorage.getItem('accessToken')

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  const response: AxiosResponse<Tokens> = await axios
    .post(`http://${getLocationURL()}:6060/api/v1/auth/register`, { email, name, password }, config)
    .then((data: AxiosResponse<Tokens>) => {
      return data
    })
    .catch((err: AxiosError) => {
      throw new Error(err.message)
    })

  return response
}

export default register
