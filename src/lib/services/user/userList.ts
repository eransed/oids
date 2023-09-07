import axios, { type AxiosResponse } from 'axios'
import type { User } from '../../../interfaces/user'

const userList = async (): Promise<AxiosResponse<User[]>> => {
  const token = localStorage.getItem('accessToken')

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  const response: AxiosResponse<User[]> = await axios
    .get(`http://${location.hostname}:6060/api/v1/users/list`, config)
    .then((response: AxiosResponse<User[]>) => {
      return response
    })
    .catch((err) => {
      return err
    })

  return response
}

export default userList
