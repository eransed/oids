import axios, {type AxiosResponse} from "axios"

import type { User } from "../../../interfaces/user"

const updateUser = async (user: User): Promise<AxiosResponse<User | Error>> => {
    const token = localStorage.getItem('accessToken')

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    }

    const response: AxiosResponse<User | Error> = await axios
    .post(`http://${location.hostname}:6060/api/v1/users/update`, user, config )
    .then((data: AxiosResponse<User>) => {
        return data
    }).catch((err: AxiosResponse<Error>) => {
        return err
    })

    return response

}

export default updateUser