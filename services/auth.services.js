import { db } from "../config/db.config.js";
import { usersTable } from "../drizzle/schema.js";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
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
export const generateToken = ({ id, name, email }) => {

  return jwt.sign({ id, name, email }, process.env.JWT_SECRET, {
    expiresIn: 60 * 60 * 24 * 30 
  });
};
export const jwtVerifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
