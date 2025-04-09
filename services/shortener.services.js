import { db } from "../config/db.config.js";
import { shortLink } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";
import crypto from "crypto";

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
export const findShortLinkById = async (id) => {
  let [result] = await db.select().from(shortLink).where(eq(shortLink.id, id));
  return result;
};

export const updatedShortCode = async ({ id, url, shortCode }) => {
  return await db
    .update(shortLink)
    .set({ url, shortCode })
    .where(eq(shortLink.id, id));
};

export const createRandomShortCode = () => {
  return crypto.randomBytes(5).toString("hex");
};
export const findShortCode = async (shortCode) => {
  const [result] = await db
    .select()
    .from(shortLink)
    .where(eq(shortLink.shortCode, shortCode));
    return result;
};
