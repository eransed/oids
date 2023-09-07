import axios, { type AxiosResponse } from 'axios'

import type { User } from '../../../interfaces/user'

const register = async (email: string, name: string, password: string): Promise<AxiosResponse<User | Error>> => {
  const token = localStorage.getItem('accessToken')

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  const response: AxiosResponse<User | Error> = await axios
    .post(`http://${location.hostname}:6060/api/v1/auth/register`, { email, name, password }, config)
    .then((data: AxiosResponse<User>) => {
      
      return data
    })
    .catch((err: AxiosResponse<Error>) => {
      return err
    })

  return response
}

export default register
