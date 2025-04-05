import { db } from "../config/db.config.js";
import { shortLink } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

export const insertShortLink = async ({ url, shortCode, userId }) => {
  await db.insert(shortLink).values({ url, shortCode, userId }).$returningId();
};

export const getAllShortLinks = async () => {
  return await db.select().from(shortLink);
};

export const getShortLinkByShortCode = async (shortCode) => {
  let [result] = await db.select().from(shortLink).where(eq(shortLink.shortCode, shortCode));
  return result;
};

