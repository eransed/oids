import bcrypt from "bcrypt";
import db from "../utils/db";

import { User } from "../types/user";

export const findUserByEmail = (email: string) => {
  return db.user.findUnique({
    where: {
      email,
    },
  });
};

export const createUserByEmailAndPassword = (user: User) => {
  user.password = bcrypt.hashSync(user.password, 12);
  return db.user.create({
    data: user,
  });
};

export const findUserById = (id: string) => {
  console.log(id);
  return db.user.findUnique({
    where: {
      id,
    },
  });
};
