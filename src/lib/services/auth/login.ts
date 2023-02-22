import axios from "axios";
import { authThoken, refreshToken } from "../../stores";

const login = async (req: FormData) => {
  try {
    const json = Object.fromEntries(req.entries());
    const response = await axios.post(
      "http://localhost:6060/api/v1/auth/login",
      json
    );

    if (response?.status === 200) {
      authThoken.set(response.data.accessToken);
      refreshToken.set(response.data.refreshToken);
    }
    return response;
  } catch (err) {
    console.error(err);
  }
};

export default login;
