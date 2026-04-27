import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const stylistsTable = pgTable("stylists", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  bio: text("bio").notNull(),
  imageUrl: text("image_url").notNull(),
  specialties: text("specialties").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Stylist = typeof stylistsTable.$inferSelect;
export type InsertStylist = typeof stylistsTable.$inferInsert;
