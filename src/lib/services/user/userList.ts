import axios, { type AxiosResponse } from 'axios'
import type { Prisma, User } from '@prisma/client'
import type { userIncludes } from '../../../stores/stores'

const userList = async (): Promise<AxiosResponse<User & Prisma.UserGetPayload<typeof userIncludes>[]>> => {
  const token = localStorage.getItem('accessToken')

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  const response: AxiosResponse<User & Prisma.UserGetPayload<typeof userIncludes>[]> = await axios
    .get(`http://${location.hostname}:6060/api/v1/users/list`, config)
    .then((response: AxiosResponse<User & Prisma.UserGetPayload<typeof userIncludes>[]>) => {
      return response
    })
    .catch((err) => {
      return err
    })

  return response
}

export default userList
