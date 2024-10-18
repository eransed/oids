// import type { Game } from '@prisma/client'
import axios, { type AxiosResponse } from 'axios'
import { getLocationURL } from '../../../utils/utils'
import type { Game } from '../../interface'
import { getAccessTokenFromLocalStorage } from '../utils/Token'

export const saveGame = async (game: Game) => {
  const token = getAccessTokenFromLocalStorage()

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response: AxiosResponse = await axios
    .post(`http://${getLocationURL()}:6060/api/v1/users/savegame`, game, config)
    .then((response: AxiosResponse<Game>) => {
      return response
    })
    .catch((err) => {
      throw new Error(err)
    })

  return response
}
