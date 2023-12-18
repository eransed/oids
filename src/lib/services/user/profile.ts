import axios, { type AxiosResponse } from 'axios'

//Svelte store
import { isLoggedInStore, localPlayerStore, userStore, userIncludes } from '../../../stores/stores'

//Interface
// import type { User } from '../../../interfaces/user'
import type { Prisma, User } from '@prisma/client'
import { setCssFromSettings } from '../../../style/defaultColors'
import { getLocationURL } from '../../../utils/utils'

const getProfile = async (testToken?: string): Promise<AxiosResponse<User & Prisma.UserGetPayload<typeof userIncludes>>> => {
  let token = ''

  if (typeof localStorage !== 'undefined') {
    const savedToken = localStorage.getItem('accessToken')
    if (savedToken) {
      token = savedToken
    }
  } else if (testToken) {
    token = testToken
  }

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  const response: AxiosResponse<User & Prisma.UserGetPayload<typeof userIncludes>> = await axios
    .get(`http://${getLocationURL()}:6060/api/v1/users/profile`, config)
    .then((response: AxiosResponse<User & Prisma.UserGetPayload<typeof userIncludes>>) => {
      userStore.set(response.data)

      const id = response.data.id

      localPlayerStore.update((v) => ({ ...v, id: id }))
      isLoggedInStore.set(true)
      console.log('Welcome: ', response.data, response.data)
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
