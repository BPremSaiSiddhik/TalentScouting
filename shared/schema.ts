import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["talent", "investor"] }).notNull(),
  name: text("name"),
  bio: text("bio"),
  skills: text("skills").array(),
  portfolio: text("portfolio"),
});

export const talentTokens = pgTable("talent_tokens", {
  id: serial("id").primaryKey(),
  talentId: integer("talent_id").notNull(),
  totalSupply: integer("total_supply").notNull(),
  currentPrice: integer("current_price").notNull(),
  goals: json("goals").notNull(),
  milestones: json("milestones").notNull(),
});

export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  investorId: integer("investor_id").notNull(),
  talentId: integer("talent_id").notNull(),
  amount: integer("amount").notNull(),
  tokenAmount: integer("token_amount").notNull(),
  timestamp: timestamp("timestamp").notNull(),
});

export const skillEndorsements = pgTable("skill_endorsements", {
  id: serial("id").primaryKey(),
  talentId: integer("talent_id").notNull(),
  endorserId: integer("endorser_id").notNull(),
  skill: text("skill").notNull(),
  weight: integer("weight").notNull().default(1),
  comment: text("comment"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
  bio: true,
  skills: true,
  portfolio: true,
});

export const insertEndorsementSchema = createInsertSchema(skillEndorsements).pick({
  talentId: true,
  endorserId: true,
  skill: true,
  comment: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type TalentToken = typeof talentTokens.$inferSelect;
export type Investment = typeof investments.$inferSelect;
export type SkillEndorsement = typeof skillEndorsements.$inferSelect;
export type InsertEndorsement = z.infer<typeof insertEndorsementSchema>;