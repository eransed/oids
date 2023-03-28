//On mount -> validate refreshtoken and make a new auth token.

import axios, { Axios } from "axios"
import type { AxiosResponse } from "axios"
import getProfile from "../user/profile"

import { isLoggedIn, user, userLoading } from "../../stores"

import type { Profile } from "../../../components/interface"

//Check if token is valid and renew
export const validateToken = async () => {
  let accessToken
  let refreshToken

  const storedRefreshToken = localStorage.getItem("refreshToken")

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
        localStorage.setItem("refreshToken", refreshToken)
        localStorage.setItem("accessToken", accessToken)

        const userProfile: Profile | null = await getProfile()

        if (userProfile) {
          user.set(userProfile.user)
          isLoggedIn.set(true)
          userLoading.set(false)
        }
      } else {
        userLoading.set(false)
        return
      }
    })
    .catch((err) => {
      console.error(err)
    })
}
