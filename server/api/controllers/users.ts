//https://www.section.io/engineering-education/how-to-create-a-simple-rest-api-using-typescript-and-nodejs/

import { Request, Response, NextFunction } from "express";
import axios, { AxiosResponse } from "axios";

interface User {
  id: Number;
  name: String;
}

//getting all users
const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  let result: AxiosResponse = await axios.get(
    "https://jsonplaceholder.typicode.com/users"
  );
  let users: [User] = result.data;
  return res.status(200).json({
    message: users,
  });
};

export default { getAllUsers };
