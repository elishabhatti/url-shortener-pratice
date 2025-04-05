import { db } from "../config/db.config.js";
import { shortLink } from "../drizzle/schema.js";

export const insertShortLink = async ({ url, shortCode }) => {
  await db.insert(shortLink).values({ url, shortCode }).$returningId();
};

export const getAllShortLinks = async () => {
  return await db.select().from(shortLink);
};
