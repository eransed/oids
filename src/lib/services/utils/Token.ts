//On mount -> validate refreshtoken and make a new auth token.

import axios, { Axios } from 'axios'
import type { AxiosResponse } from 'axios'
import getProfile from '../user/profile'

import { isLoggedIn, userLoading } from '../../../stores/stores'

import type { User } from '../../../interfaces/user'
import { log, warn } from 'mathil'

//Check if token is valid and renew
export const validateToken = async (): Promise<User | undefined> => {
  let accessToken
  let refreshToken
  let userProfile: User | undefined

  const storedRefreshToken = localStorage.getItem('refreshToken')

  //If no refreshToken stored in localstorage -> return undefined and user needs to login
  if (!storedRefreshToken) {
    return undefined
  }

  const body = {
    refreshToken: storedRefreshToken,
  }

  userLoading.set(true)

  await axios
    .post(`http://${location.hostname}:6060/api/v1/auth/refreshToken`, body)

    .then(async (response: AxiosResponse<any>) => {
      if (response.status === 200) {
        accessToken = response.data.accessToken
        refreshToken = response.data.refreshToken
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('accessToken', accessToken)

        userProfile = await getProfile().then((user) => user)

        if (userProfile) {
          isLoggedIn.set(true)
          userLoading.set(false)
        }
        return userProfile
      } else {
        userLoading.set(false)
        return undefined
      }
    })
    .catch((err) => {
      console.log(err)
    })

  return userProfile ? userProfile : undefined
}
