import axios, { AxiosError, type AxiosResponse } from 'axios'

// import type { User } from "../../../interfaces/user"
import type { Prisma, User } from '@prisma/client'
import type { userIncludes } from '../../../stores/stores'

const updateUser = async (user: User & Prisma.UserGetPayload<typeof userIncludes>): Promise<AxiosResponse<User | Error>> => {
  const token = localStorage.getItem('accessToken')

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  const response: AxiosResponse<User | Error> = await axios
    .post(`http://${location.hostname}:6060/api/v1/users/update`, user, config)
    .then((data: AxiosResponse<User>) => {
      return data
    })
    .catch((err: AxiosResponse<Error>) => {
      return err
    })

  return response
}

export default updateUser
