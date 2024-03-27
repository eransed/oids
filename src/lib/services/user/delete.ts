import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
// import type { User } from '@prisma/client'
import { getLocationURL } from '../../../utils/utils'
import type { User } from '../../interface'

export async function deleteUser(email: string): Promise<AxiosResponse<User>> {
  const token = localStorage.getItem('accessToken')

  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response: AxiosResponse<User> = await axios
    .post(
      `http://${getLocationURL()}:6060/api/v1/users/deleteUser`,
      { email },
      config
    )
    .then((response: AxiosResponse<User>) => {
      return response
    })
    .catch((err) => {
      throw new Error(err)
    })

  return response
}

export async function deleteMe(): Promise<AxiosResponse<User>> {
  const token = localStorage.getItem('accessToken')

  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response: AxiosResponse<User> = await axios
    .post(`http://${getLocationURL()}:6060/api/v1/users/deleteMe`, '', config)
    .then((response: AxiosResponse<User>) => {
      return response
    })
    .catch((err) => {
      throw new Error(err)
    })

  return response
}
