import axios, { type AxiosResponse } from 'axios'
import { user } from '../../../stores/stores'

import type { Profile } from '../../../interfaces/user'

const getProfile = async (): Promise<AxiosResponse<Profile>> => {
 const token = localStorage.getItem('accessToken')

 const config = {
  headers: { Authorization: `Bearer ${token}` },
 }

 const response: AxiosResponse<Profile> = await axios
  .get(`http://${location.hostname}:6060/api/v1/users/profile`, config)
  .then((response: AxiosResponse<Profile>) => {
   user.set(response.data.user)
   return response.data
  })
  .catch((err) => {
   return err
  })

 return response
}

export default getProfile
