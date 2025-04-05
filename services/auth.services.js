import { db } from "../config/db.config.js";
import { usersTable } from "../drizzle/schema.js";
import argon2 from "argon2";
import { eq } from "drizzle-orm";

export const createUser = async ({ name, email, password }) => {
  const [user] = await db
    .insert(usersTable)
    .values({ name, email, password })
    .$returningId();
  return user;
};

export const hashUserPassword = async (password) => {
  return await argon2.hash(password, 12);
};

export const getUserByEmail = async (email) => {
  return await db.select().from(usersTable).where(eq(usersTable.email, email));
};
