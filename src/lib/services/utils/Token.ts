//On mount -> validate refreshtoken and make a new auth token.

import axios from 'axios'
import type { AxiosError, AxiosResponse } from 'axios'
import getProfile from '../user/profile'

import { userLoadingStore } from '../../../stores/stores'

import type { Tokens } from '../../interface'
import { setCssFromSettings } from '../../../style/defaultColors'
import { getLocationURL } from '../../../utils/utils'

//Check if token is valid and renew
export const validateToken = async () => {
  let accessToken
  let refreshToken

  const storedRefreshToken = localStorage.getItem('refreshToken')

  //If no refreshToken stored in localstorage -> return undefined and user needs to login
  if (!storedRefreshToken) {
    throw new Error()
  }

  const body = {
    refreshToken: storedRefreshToken,
  }

  userLoadingStore.set(true)

  return await axios
    .post(`http://${getLocationURL()}:6060/api/v1/auth/refreshToken`, body)
    .then(async (response: AxiosResponse<Tokens>) => {
      if (response.status === 200) {
        accessToken = response.data.accessToken
        refreshToken = response.data.refreshToken
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('accessToken', accessToken)

        return await getProfile()
          .then((response) => {
            const user = response.data
            userLoadingStore.set(false)
            setCssFromSettings(user.theme)

            return user
          })
          .catch((err) => {
            throw new Error(err)
          })
      } else {
        throw new Error()
      }
    })
    .catch((err: AxiosError) => {
      console.log(err.response?.data)
      console.log('Removing tokens')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('accessToken')
    })
}
