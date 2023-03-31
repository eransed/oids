import axios, { Axios, type AxiosResponse } from "axios"
import { user } from "../../stores"

import type { Profile } from "../../../components/interface"

const getProfile = async (): Promise<Profile | null> => {
  const token = localStorage.getItem("accessToken")

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  const response: Profile | null = await axios
    .get(`http://${location.hostname}:6060/api/v1/users/profile`, config)
    .then((response: AxiosResponse<Profile>) => {
      user.set(response.data.user)
      return response.data
    })
    .catch((err) => {
      console.error(err)
      return null
    })

  return response
}

export default getProfile
