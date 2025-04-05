import { db } from "../config/db.config.js";
import { usersTable } from "../drizzle/schema.js";
import argon2 from "argon2";

export const createUser = async ({ name, email, password }) => {
  const [user] = await db
    .insert(usersTable)
    .values({ name, email, password })
    .$returningId();
  return user;
};

export const hashedPassword = async (password) => {
  return await argon2.hash(password, 12);
};
