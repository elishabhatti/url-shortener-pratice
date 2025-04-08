import { relations } from "drizzle-orm";
import {
  boolean,
  int,
  mysqlTable,
  timestamp,
  varchar,
  text
} from "drizzle-orm/mysql-core";

export const shortLink = mysqlTable("short_link", {
  id: int().autoincrement().primaryKey(),
  url: varchar({ length: 2000 }).notNull(),
  shortCode: varchar("short_code", { length: 20 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const usersTable = mysqlTable("users", {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const sessionTable = mysqlTable("sessions", {
  id: int().autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  valid: boolean().default(true).notNull(),
  userAgent: text("user_agent"),
  ip: varchar({ length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const usersRelation = relations(usersTable, ({ many }) => ({
  shortLink: many(shortLink),
  sessions: many(sessionTable),
}));
// A short link belongs to a user
export const shortLinksRelation = relations(shortLink, ({ one }) => ({
  user: one(usersTable, {
    fields: [shortLink.userId], //foreign key
    references: [usersTable.id],
  }),
}));

export const sessionsRelation = relations(sessionTable, ({ one }) => ({
  session: one(usersTable, {
    fields: [sessionTable.userId], //foreign key
    references: [usersTable.id],
  }),
}));
