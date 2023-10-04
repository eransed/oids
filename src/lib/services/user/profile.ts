import axios, { type AxiosResponse } from 'axios'

//Svelte store
import { settings, user, userIncludes } from '../../../stores/stores'

//Interface
// import type { User } from '../../../interfaces/user'
import type { Prisma, User } from '@prisma/client'

const getProfile = async (): Promise<User> => {
  const token = localStorage.getItem('accessToken')

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  const response: User & Prisma.UserGetPayload<typeof userIncludes> = await axios
    .get(`http://${location.hostname}:6060/api/v1/users/profile`, config)
    .then((response: AxiosResponse<User & Prisma.UserGetPayload<typeof userIncludes>>) => {
      user.set(response.data)
      console.log('Welcome: ', response.data, response.data)
      settings.set({
        theme: {
          bg: '',
          card: '',
          text: '',
          accent: '',
        },
        uiStyle: {
          unarmedShotColor: '',
          armedShotColor: '',
          shipColor: '',
          spaceColor: '',
          starColor: '',
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
