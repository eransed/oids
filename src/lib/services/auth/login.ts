import axios, { type AxiosResponse } from "axios";
import { authThoken, refreshToken } from "../../stores";

const login = async (req: FormData) => {
  let status;
  let data;
  let error;

  const json = Object.fromEntries(req.entries());
  await axios
    .post("http://localhost:6060/api/v1/auth/login", json)
    .then((response: AxiosResponse<any>) => {
      data = response.data;
      status = response.status;
      if (status === 200) {
        authThoken.set(response.data.accessToken);
        refreshToken.set(response.data.refreshToken);
        localStorage.setItem("authToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }
    })
    .catch((err) => {
      error = err;
      console.error(err);
    });

  return { status, data, error };
};

export default login;
