import type { Game } from '@prisma/client'
import axios, { type AxiosResponse } from 'axios'

export const saveGame = async (game: Game) => {
  const token = localStorage.getItem('accessToken')

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response: AxiosResponse = await axios
    .post(`http://${location.hostname}:6060/api/v1/users/savegame`, game, config)
    .then((response: AxiosResponse<Game>) => {
      return response
    })
    .catch((err) => {
      throw new Error(err)
    })

  return response
}
