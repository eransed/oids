import axios, { type AxiosResponse } from 'axios'

//Svelte store
import { settings, user } from '../../../stores/stores'

//Interface
// import type { User } from '../../../interfaces/user'
import type { User } from '@prisma/client'

const getProfile = async (): Promise<User> => {
  const token = localStorage.getItem('accessToken')

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  const response: User = await axios
    .get(`http://${location.hostname}:6060/api/v1/users/profile`, config)
    .then((response: AxiosResponse<User>) => {
      user.set(response.data)
      console.log('Welcome: ', response.data.name, response.data)
      settings.set({
        darkMode: response.data.darkMode,
        uiStyle: {
          unarmedShotColor: '',
          armedShotColor: '',
          shipColor: '',
          spaceColor: '',
          starColor: ''
        },
      })

      return response.data
    })
    .catch((err) => {
      return err
    })

  return response
}

export default getProfile
