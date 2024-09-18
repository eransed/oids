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

const getProfile = async (chosenShip?: Ship): Promise<AxiosResponse<User>> => {
  let token = ''

  console.log('newShip ', chosenShip)

  const savedToken = getAccessTokenFromLocalStorage()
  if (savedToken) {
    token = savedToken
  } else {
    throw new Error('No token found in storage')
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

      const chosenUserShip = user.ships.find((ship) => ship.name === chosenShip?.name)

      localPlayerStore.update((v) => ({ ...v, id: user.id, ship: chosenUserShip ?? defaultShip }))

      console.log('Welcome: ', response.data.name, response.data)

      setCssFromSettings(response.data.theme)

      return response
    })
    .catch((err) => {
      throw new Error(err)
    })

  return response
}

export default getProfile
