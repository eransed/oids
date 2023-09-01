import axios, {type AxiosResponse} from "axios"

import type { User } from "../../../interfaces/user"

const updateUser = async (user: User): Promise<AxiosResponse<User>> => {
    const token = localStorage.getItem('accessToken')

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    }

    const response: AxiosResponse<User> = await axios
    .post(`http://${location.hostname}:6060/api/v1/users/update`, user, config )
    .then((data: AxiosResponse<User>) => {
        return data
    }).catch((err) => {
        return err
    })

    return response

}

export default updateUser