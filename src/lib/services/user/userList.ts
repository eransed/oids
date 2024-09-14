import axios, { type AxiosResponse } from 'axios'
// import type { Prisma, User } from '@prisma/client'
import { getLocationURL } from '../../../utils/utils'
import type { User } from '../../interface'
import { getAccessTokenFromLocalStorage } from '../utils/Token'

const userList = async (): Promise<AxiosResponse<User[]>> => {
  const token = getAccessTokenFromLocalStorage()

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  const response: AxiosResponse<User[]> = await axios
    .get(`http://${getLocationURL()}:6060/api/v1/users/list`, config)
    .then((response: AxiosResponse<User[]>) => {
      return response
    })
    .catch((err) => {
      return err
    })

  return response
}

export default userList
