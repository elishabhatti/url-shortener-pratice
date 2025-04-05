import { mysqlTable, serial, varchar } from "drizzle-orm/mysql-core";

export const shortLink = mysqlTable("shortlink", {
  id: serial().primaryKey(),
  url: varchar({ length: 2000 }).notNull(),
  shortCode: varchar({ length: 255 }).notNull().unique(),
});
