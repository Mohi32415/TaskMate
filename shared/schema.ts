import { pgTable, text, serial, integer, boolean, timestamp, json, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  language: text("language").default("en"),
  theme: text("theme").default("light"),
  rtl: boolean("rtl").default(false),
  compactMode: boolean("compact_mode").default(false),
  notifications: json("notifications").$type<{
    taskReminders: boolean;
    challengeUpdates: boolean;
    chatMessages: boolean;
  }>().default({
    taskReminders: true,
    challengeUpdates: true,
    chatMessages: true
  }),
  offlineMode: boolean("offline_mode").default(true),
  lastSynced: timestamp("last_synced")
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull()
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  categoryId: integer("category_id").notNull(),
  taskType: text("task_type").default("general"),
  scheduleType: text("schedule_type").default("daily").notNull(),
  unitValue: integer("unit_value"),
  unitType: text("unit_type"),
  schedule: json("schedule").$type<{
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  }>().default({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true
  }),
  lastCompletedDate: timestamp("last_completed_date"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true
});

// Task progress table
export const taskProgress = pgTable("task_progress", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  date: timestamp("date").notNull(),
  value: integer("value").notNull(),
  feedback: text("feedback"),
  synced: boolean("synced").default(true)
});

export const insertTaskProgressSchema = createInsertSchema(taskProgress).omit({
  id: true
});

// Challenges table
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  categoryId: integer("category_id").notNull(),
  description: text("description"),
  creatorId: integer("creator_id").notNull(),
  participantId: integer("participant_id"),
  inviteCode: text("invite_code"),
  scheduleType: text("schedule_type").default("daily").notNull(),
  schedule: json("schedule").$type<{
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  }>().default({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true
  }),
  unitValue: integer("unit_value"),
  unitType: text("unit_type"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("pending"), // pending, active, completed, declined
  createdAt: timestamp("created_at").defaultNow()
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true
});

// Challenge progress table
export const challengeProgress = pgTable("challenge_progress", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  value: integer("value").notNull(),
  synced: boolean("synced").default(true)
});

export const insertChallengeProgressSchema = createInsertSchema(challengeProgress).omit({
  id: true
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  synced: boolean("synced").default(true)
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type TaskProgress = typeof taskProgress.$inferSelect;
export type InsertTaskProgress = z.infer<typeof insertTaskProgressSchema>;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type ChallengeProgress = typeof challengeProgress.$inferSelect;
export type InsertChallengeProgress = z.infer<typeof insertChallengeProgressSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
