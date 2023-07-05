//On mount -> validate refreshtoken and make a new auth token.

import axios, { Axios } from 'axios'
import type { AxiosResponse } from 'axios'
import getProfile from '../user/profile'

import { isLoggedIn, userLoading } from '../../../stores/stores'

import type { Profile } from '../../../interfaces/user'
import { log, warn } from 'mathil'

//Check if token is valid and renew
export const validateToken = async () => {
 let accessToken
 let refreshToken

 const storedRefreshToken = localStorage.getItem('refreshToken')

 //If no refreshToken stored in localstorage -> return undefined and user needs to login
 if (!storedRefreshToken) {
  return
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

    const userProfile: AxiosResponse<Profile> = await getProfile()

    if (userProfile) {
     isLoggedIn.set(true)
     userLoading.set(false)
    }
   } else {
    userLoading.set(false)
    return
   }
  })
  .catch((err) => {
   warn(err)
  })
}
