import { db } from "../config/db.config.js";
import { sessionTable, usersTable } from "../drizzle/schema.js";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRY,
  MILLISECONDS_PER_SECOND,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constants.js";
import dotenv from "dotenv";
dotenv.config();

export const createUser = async ({ name, email, password }) => {
  const [user] = await db
    .insert(usersTable)
    .values({ name, email, password })
    .$returningId();
  return user;
};

export const hashPassword = async (password) => {
  return await argon2.hash(password);
};

export const comparePassword = async (hash, password) => {
  return await argon2.verify(hash, password);
};

export const getUserByEmail = async (email) => {
  return await db.select().from(usersTable).where(eq(usersTable.email, email));
};

export const jwtVerifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const createSession = async (userId, { ip, userAgent }) => {
  const [session] = await db
    .insert(sessionTable)
    .values({ userId, ip, userAgent })
    .$returningId();
  return session;
};

export const findSessionById = async (sessionId) => {
  const [session] = await db
    .select()
    .from(sessionTable)
    .where(eq(sessionTable.id, sessionId));
  return session;
};

export const findUserById = async (userId) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  return user;
};

export const createAccessToken = ({ id, name, email, sessionId }) => {
  return jwt.sign({ id, name, email, sessionId }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND,
  });
};

export const createRefreshToken = (sessionId) => {
  return jwt.sign({ sessionId }, process.env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND,
  });
};

// export const refreshTokens = async (refreshToken) => {
//   try {
//     const decodedToken = jwtVerifyToken(refreshToken);
//     const currentSession = await findSessionById(decodedToken.sessionId);

//     if (!currentSession || !currentSession.valid) {
//       throw new Error("Invalid Session");
//     }

//     const user = await findUserById(currentSession.userId);
//     if (!user) throw new Error("Invalid User");

//     const userInfo = {
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       sessionId: currentSession.id,
//     };

//     const newAccessToken = createAccessToken(userInfo);
//     const newRefreshToken = createRefreshToken(currentSession.id);

//     return {
//       newAccessToken,
//       newRefreshToken,
//       user: userInfo,
//     };
//   } catch (error) {
//     console.log(error);
//   }
// };

export const refreshTokens = async (refreshToken) => {
  try {
    const decodedToken = jwtVerifyToken(refreshToken);
    const currentSession = await findSessionById(decodedToken.sessionId);

    if (!currentSession || !currentSession.valid) {
      throw new Error("Invalid Session");
    }

    const user = await findUserById(currentSession.userId);
    if (!user) throw new Error("Invalid User");

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      sessionId: currentSession.sessionId,
    };

    const newAccessToken = createAccessToken(userInfo);
    const newRefreshToken = createRefreshToken(currentSession.id);

    return {
      newAccessToken,
      newRefreshToken,
      user: userInfo,
    };
  } catch (error) {
    console.log(error);
  }
};

export const clearSession = async (userId) => {
  return await db.delete(sessionTable).where(eq(sessionTable.id, userId));
};

export const authenticateUser = async (req, res, user) => {
  const session = await createSession(user.id, {
    ip: req.clientIp,
    userAgent: req.headers["user_agent"],
  });

  const accessToken = createAccessToken({
    id: user.id,
    name: user.name,
    email: user.email,
    sessionId: session.id,
  });

  const refreshToken = createRefreshToken(session.id);
  const baseConfig = { httpOnly: true, secure: true };

  res.cookie("access_token", accessToken, {
    ...baseConfig,
    maxAge: ACCESS_TOKEN_EXPIRY,
  });

  res.cookie("refresh_token", refreshToken, {
    ...baseConfig,
    maxAge: REFRESH_TOKEN_EXPIRY,
  });
}