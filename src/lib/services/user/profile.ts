import axios, { type AxiosResponse } from 'axios'

//Svelte store
import { localPlayerStore, userStore } from '../../../stores/stores'

//Interface
// import type { User } from '../../../interfaces/user'
// import type { Prisma, User } from '@prisma/client'
import { setCssFromSettings } from '../../../style/defaultColors'
import { getLocationURL } from '../../../utils/utils'
import type { User } from '../../interface'
import { getAccessTokenFromLocalStorage } from '../utils/Token'

const getProfile = async (testToken?: string): Promise<AxiosResponse<User>> => {
  let token = ''

  if (!testToken) {
    const savedToken = getAccessTokenFromLocalStorage()
    if (savedToken) {
      token = savedToken
    } else {
      throw new Error('No token found in storage')
    }
  } else {
    token = testToken
  }

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  const response: AxiosResponse<User> = await axios
    .get(`http://${getLocationURL()}:6060/api/v1/users/profile`, config)
    .then((response: AxiosResponse<User>) => {
      userStore.set(response.data)

      const user = response.data
      const defaultShip = user.ships[0]

      localPlayerStore.update((v) => ({ ...v, id: user.id, ship: defaultShip ?? [] }))

      console.log('Welcome: ', response.data.name, response.data)
      if (!testToken) {
        setCssFromSettings(response.data.theme)
      }
      return response
    })
    .catch((err) => {
      throw new Error(err)
    })

  return response
}

export default getProfile
