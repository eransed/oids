import axios, { type AxiosResponse } from "axios"

import { isLoggedIn } from "../../../stores/stores"

const login = async (req: FormData) => {
  let status
  let data
  let error

  const json = Object.fromEntries(req.entries())
  await axios
    .post(`http://${location.hostname}:6060/api/v1/auth/login`, json)
    .then((response: AxiosResponse<any>) => {
      data = response.data
      status = response.status
      if (status === 200) {
        localStorage.setItem("accessToken", response.data.accessToken)
        localStorage.setItem("refreshToken", response.data.refreshToken)
        isLoggedIn.set(true)
      }
    })
    .catch((err) => {
      error = err
      console.error(err)
    })

  return { status, data, error }
}

export default login
