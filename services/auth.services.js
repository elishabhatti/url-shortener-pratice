import { db } from "../config/db.config.js";
import {
  oauthAccountsTable,
  sessionTable,
  usersTable,
  verifyEmailTokensTable,
} from "../drizzle/schema.js";
import argon2 from "argon2";
import { and, gte, eq, lt, sql } from "drizzle-orm";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRY,
  MILLISECONDS_PER_SECOND,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constants.js";
import crypto from "crypto";
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
      isEmailValid: user.isEmailValid,
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
export const authenticateUser = async ({ req, res, user, name, email }) => {
  const session = await createSession(user.id, {
    ip: req.clientIp,
    userAgent: req.headers["user-agent"],
  });
  console.log("user id", user.id);
  
  const accessToken = createAccessToken({
    id: user.id,
    name,
    email,
    isEmailValid: false,
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
};


export const generateRandomToken = (digit = 8) => {
  const min = 10 ** (digit - 1);
  const max = 10 ** digit;

  return crypto.randomInt(min, max).toString();
};

export const insertVerificationEmailToken = async ({ userId, token }) => {
  return db.transaction(async (tx) => {
    try {
      await tx
        .delete(verifyEmailTokensTable)
        .where(lt(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`));

      await tx
        .delete(verifyEmailTokensTable)
        .where(eq(verifyEmailTokensTable.userId, userId));

      return await tx.insert(verifyEmailTokensTable).values({ userId, token });
    } catch (error) {
      console.error(error);
    }
  });
};

export const createVerifyEmailLink = async ({ email, token }) => {
  const url = new URL(`${process.env.FRONTEND_URL}/verify-email-token`);
  url.searchParams.append("token", token);
  url.searchParams.append("email", email);

  return url.toString();
};

export const findVerificationEmailToken = async ({ token, email }) => {
  try {
    return await db
      .select({
        userId: usersTable.id,
        email: usersTable.email,
        token: verifyEmailTokensTable.token,
        expiresAt: verifyEmailTokensTable.expiresAt,
      })
      .from(verifyEmailTokensTable)
      .where(
        and(
          eq(verifyEmailTokensTable.token, token),
          eq(usersTable.email, email),
          gte(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`)
        )
      )
      .innerJoin(usersTable, eq(verifyEmailTokensTable.userId, usersTable.id));
  } catch (error) {
    console.error(error);
  }
};

export const verifyUserEmailAndUpdate = async (email) => {
  return db
    .update(usersTable)
    .set({ isEmailValid: true })
    .where(eq(usersTable.email, email));
};

export const clearVerifyEmailTokens = async (email) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  return await db
    .delete(verifyEmailTokensTable)
    .where(eq(verifyEmailTokensTable.userId, user.id));
};

export const getUserWithOauthId = async ({ email, provider }) => {
  const [user] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      isEmailValid: usersTable.isEmailValid,
      provideAccountId: oauthAccountsTable.providerAccountId,
      provider: oauthAccountsTable.provider,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .leftJoin(
      oauthAccountsTable,
      and(
        eq(oauthAccountsTable.provider, provider),
        eq(oauthAccountsTable.userId, usersTable.id)
      )
    );

  return user;
};

export const linkUserWithOauth = async ({
  userId,
  provider,
  providerAccountId,
}) => {
  await db.insert(oauthAccountsTable).values({
    userId,
    provider,
    providerAccountId,
  });
};

export const createUserWithOauth = async ({
  name,
  email,
  provider,
  providerAccountId,
}) => {
  const user = await db.transaction(async (trx) => {
    const [user] = await trx
      .insert(usersTable)
      .values({
        email,
        name,
        // password,
        isEmailValid: true,
      })
      .$returningId();

    await trx.insert(oauthAccountsTable).values({
      provider,
      providerAccountId,
      userId: user.id,
    });

    return {
      id: user.id,
      name,
      email,
      isEmailValid: true,
      provider,
      providerAccountId,
    };
  });
  return user;
};
