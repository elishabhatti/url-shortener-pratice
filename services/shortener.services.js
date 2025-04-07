import { db } from "../config/db.config.js";
import { shortLink } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

export const insertShortLink = async ({ url, shortCode, userId }) => {
  await db.insert(shortLink).values({ url, shortCode, userId }).$returningId();
};

export const getAllShortLinks = async (userId) => {
  return await db.select().from(shortLink).where(eq(shortLink.userId, userId));
};

export const deleteShortCodeById = async (id) => {
  return await db.delete(shortLink).where(eq(shortLink.id, id));
};

export const getShortLinkByShortCode = async (shortCode) => {
  let [result] = await db
    .select()
    .from(shortLink)
    .where(eq(shortLink.shortCode, shortCode));
  return result;
};
