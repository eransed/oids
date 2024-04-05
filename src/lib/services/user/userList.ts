import axios, { type AxiosResponse } from 'axios'
// import type { Prisma, User } from '@prisma/client'
import { getLocationURL } from '../../../utils/utils'
import type { User } from '../../interface'

const userList = async (): Promise<AxiosResponse<User[]>> => {
  const token = localStorage.getItem('accessToken')

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
