import { JwtPayload } from "jsonwebtoken";
import db from "../utils/db";
import hashToken from "../utils/hashToken";

interface addRefreshTokenToWhitelistTypes {
  jti: string;
  refreshToken: string;
  userId: string;
}

// used when we create a refresh token.
export const addRefreshTokenToWhitelist = ({
  jti,
  refreshToken,
  userId,
}: addRefreshTokenToWhitelistTypes) => {
  return db.refreshToken.create({
    data: {
      id: jti,
      hashedToken: hashToken(refreshToken),
      userId,
    },
  });
};

// used to check if the token sent by the client is in the database.
export const findRefreshTokenById = (id: string) => {
  return db.refreshToken.findUnique({
    where: {
      id,
    },
  });
};

// soft delete tokens after usage.
export const deleteRefreshToken = (id: string) => {
  return db.refreshToken.update({
    where: {
      id,
    },
    data: {
      revoked: true,
    },
  });
};

export const revokeTokens = (userId: string) => {
  return db.refreshToken.updateMany({
    where: {
      userId,
    },
    data: {
      revoked: true,
    },
  });
};
