import axios, { type AxiosResponse } from 'axios'
import { user } from '../../../stores/stores'
import type { User } from '../../../interfaces/user'

const getProfile = async (): Promise<AxiosResponse<User>> => {
  const token = localStorage.getItem('accessToken')

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  const response: AxiosResponse<User> = await axios
    .get(`http://${location.hostname}:6060/api/v1/users/profile`, config)
    .then((response: AxiosResponse<User>) => {
      user.set(response.data)

      return response.data
    })
    .catch((err) => {
      return err
    })

  return response
}

export default getProfile
