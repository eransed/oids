import axios, { AxiosError, type AxiosResponse } from 'axios'

// import type { User } from '@prisma/client'
import type { Tokens } from '../../interface'

import { getLocationURL } from '../../../utils/utils'
import { getAccessTokenFromLocalStorage } from '../utils/Token'

const register = async (email: string, name: string, password: string): Promise<Tokens> => {
  const token = getAccessTokenFromLocalStorage()

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  try {
    const response: AxiosResponse<Tokens> = await axios.post(`http://${getLocationURL()}:6060/api/v1/auth/register`, { email, name, password }, config)
    return response.data
  } catch (err: any) {
    throw new Error(err)
  }
}

export default register
