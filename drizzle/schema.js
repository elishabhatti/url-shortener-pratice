import { relations } from "drizzle-orm";
import { timestamp } from "drizzle-orm/mysql-core";
import { int, mysqlTable, serial, varchar } from "drizzle-orm/mysql-core";

export const userTable = mysqlTable("users", {
  id: serial().primaryKey(),
  name: varchar({ length: 20 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const shortLink = mysqlTable("shortlink", {
  id: serial().primaryKey(),
  url: varchar({ length: 2000 }).notNull(),
  shortCode: varchar({ length: 255 }).notNull().unique(),
  userId: int("userid")
    .notNull()
    .references(() => userTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const userRelation = relations(userTable, ({ many }) => {
  shortLink: many(shortLink);
});

export const shortLinkRelation = relations(shortLink, ({ one }) => {
  user: one(userTable, {
    fields: [shortLink.userId],
    references: [userTable.id],
  });
});
