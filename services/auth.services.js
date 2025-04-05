import { db } from "../config/db.config.js";
import { usersTable } from "../drizzle/schema.js";

export const createUser = async ({ name, email, password }) => {
  const [user] = await db
    .insert(usersTable)
    .values({ name, email, password })
    .$returningId();
  return user;
};
