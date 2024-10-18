import axios, { type AxiosResponse } from 'axios'

//Svelte store
import { localPlayerStore, userStore } from '../../../stores/stores'

//Interface
// import type { User } from '../../../interfaces/user'
// import type { Prisma, User } from '@prisma/client'
import { setCssFromSettings } from '../../../style/defaultColors'
import { getLocationURL } from '../../../utils/utils'
import type { Ship, User } from '../../interface'
import { getAccessTokenFromLocalStorage } from '../utils/Token'

export const getProfile = async (update = true): Promise<AxiosResponse<User>> => {
  let token = ''

  const savedToken = getAccessTokenFromLocalStorage()
  if (savedToken) {
    token = savedToken
  } else {
    throw new Error('No token')
  }

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  const response: AxiosResponse<User> = await axios
    .get(`http://${getLocationURL()}:6060/api/v1/users/profile`, config)
    .then((response: AxiosResponse<User>) => {
      if (update) {
        updateUser(response.data)
      }

      return response
    })
    .catch((err) => {
      throw new Error(err)
    })

  return response
}

export function updateUser(userData: User) {
  userStore.set(userData)

  const defaultShip = userData.ships[0]

  localPlayerStore.update((v) => ({ ...v, id: userData.id, ship: defaultShip }))

  console.log('Welcome: ', userData.name, userData)

  setCssFromSettings(userData.theme)
}
