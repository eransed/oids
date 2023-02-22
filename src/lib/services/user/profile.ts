import axios, { type AxiosResponse } from "axios"
import { authThoken, refreshToken } from "../../stores"
import { get } from "svelte/store"

const getProfile = async () => {
  let status
  let data
  let error

  const token = get(authThoken)

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  const hostname = location.hostname

  await axios
    .get(`http://${hostname}:6060/api/v1/users/profile`, config)
    .then((response: AxiosResponse<any>) => {
      data = response.data
      status = response.status
    })
    .catch((err) => {
      error = err
      console.error(err)
    })

  return { status, data, error }
}

export default getProfile
