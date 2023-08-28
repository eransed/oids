import axios, { type AxiosResponse } from 'axios'
import type { GameHistory } from '../../../interfaces/game'

export const saveGame = async (game: GameHistory) => {
  const token = localStorage.getItem('accessToken')

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response: AxiosResponse = await axios
    .post(`http://${location.hostname}:6060/api/v1/users/savegame`, game, config)
    .then((response: AxiosResponse<GameHistory>) => {
      return response
    })
    .catch((err) => {
      throw new Error(err)
    })

  return response
}
