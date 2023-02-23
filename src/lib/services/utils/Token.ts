//On mount -> validate refreshtoken and make a new auth token.

import axios from "axios"
import type { AxiosResponse } from "axios"
import { hostname } from "../../constants"
import getProfile from "../user/profile"

import { isLoggedIn, user } from "../../stores"

//Check if token is valid and renew
export const validateToken = async () => {
  let accessToken
  let refreshToken

  const storedRefreshToken = localStorage.getItem("refreshToken")

  //If no refreshToken stored in localstorage -> return undefined and user needs to login
  if (!storedRefreshToken) {
    console.log("no stored refreshToken, please login")
    return
  }

  const body = {
    refreshToken: storedRefreshToken,
  }

  await axios
    .post(`http://${hostname}:6060/api/v1/auth/refreshToken`, body)
    .then(async (response: AxiosResponse<any>) => {
      if (response.status === 200) {
        console.log("testiung")
        accessToken = response.data.accessToken
        refreshToken = response.data.refreshToken
        localStorage.setItem("refreshToken", refreshToken)
        localStorage.setItem("accessToken", accessToken)

        const userProfile = await getProfile()
        user.set(userProfile.data)
        isLoggedIn.set(true)
      } else {
        return
      }
    })
    .catch((err) => {
      console.error(err)
    })
}
