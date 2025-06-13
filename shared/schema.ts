import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  alt: text("alt").notNull(),
  tags: text("tags").array().notNull(),
});

export const digitPatterns = pgTable("digit_patterns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  digit: text("digit").notNull(), // '0' through '9'
  pattern: text("pattern").notNull(), // JSON array of pattern grid
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  isDefault: boolean("is_default").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertImageSchema = createInsertSchema(images).pick({
  url: true,
  alt: true,
  tags: true,
});

export const insertDigitPatternSchema = createInsertSchema(digitPatterns).pick({
  name: true,
  description: true,
  digit: true,
  pattern: true,
  width: true,
  height: true,
  isDefault: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;
export type InsertDigitPattern = z.infer<typeof insertDigitPatternSchema>;
export type DigitPattern = typeof digitPatterns.$inferSelect;
