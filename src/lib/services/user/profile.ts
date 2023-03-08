import axios, { type AxiosResponse } from "axios"
import { get } from "svelte/store"
import { user } from "../../stores"
import { hostname } from "../../constants"

const getProfile = async () => {
  let status
  let data
  let error

  const token = localStorage.getItem("accessToken")

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  await axios
    .get(`http://${hostname}:6060/api/v1/users/profile`, config)
    .then((response: AxiosResponse<any>) => {
      data = response.data
      status = response.status

      user.set(data)
    })
    .catch((err) => {
      error = err
      console.error(err)
    })

  return { status, data, error }
}

export default getProfile
