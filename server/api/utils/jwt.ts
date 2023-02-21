import jwt from "jsonwebtoken";

import type { User } from "../types/user";

declare const process: {
  env: {
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
  };
};

//Token valid time
export const generateAccessToken = (user: User) => {
  return jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "5m",
  });
};

//How long a session will be until forced to login
export const generateRefreshToken = (user: User, jti: string) => {
  return jwt.sign(
    {
      userId: user.id,
      jti,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "8h", //Set to 8 hour to gimmick a working day!
    }
  );
};

export const generateTokens = (user: User, jti: string) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, jti);

  return {
    accessToken,
    refreshToken,
  };
};
