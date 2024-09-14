import axios, { type AxiosResponse } from 'axios'

// import type { User } from "../../../interfaces/user"
// import type { Prisma, User } from '@prisma/client'
import { getLocationURL } from '../../../utils/utils'
import type { User } from '../../interface'
import { getAccessTokenFromLocalStorage } from '../utils/Token'

const updateUser = async (user: User): Promise<AxiosResponse<User | Error>> => {
  const token = getAccessTokenFromLocalStorage()

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  const response: AxiosResponse<User | Error> = await axios
    .post(`http://${getLocationURL()}:6060/api/v1/users/update`, user, config)
    .then((data: AxiosResponse<User>) => {
      return data
    })
    .catch((err: AxiosResponse<Error>) => {
      return err
    })

  return response
}

export default updateUser
