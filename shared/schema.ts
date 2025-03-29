import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const phrases = pgTable("phrases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  text: text("text").notNull(),
  category: text("category").notNull(),
});

export const callLogs = pgTable("call_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  mode: text("mode").notNull(), // 'deaf', 'mute', or 'both'
  hasRecording: boolean("has_recording").default(false),
  recordingPath: text("recording_path"),
  language: text("language").notNull(),
});

export const callMessages = pgTable("call_messages", {
  id: serial("id").primaryKey(),
  callId: integer("call_id").references(() => callLogs.id).notNull(),
  text: text("text").notNull(),
  sender: text("sender").notNull(), // 'user' or 'caller'
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  method: text("method"), // 'text' or 'voice'
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPhraseSchema = createInsertSchema(phrases).pick({
  userId: true,
  text: true,
  category: true,
});

export const insertCallLogSchema = createInsertSchema(callLogs).pick({
  userId: true,
  startTime: true,
  mode: true,
  language: true,
  hasRecording: true,
});

export const updateCallLogSchema = createInsertSchema(callLogs).pick({
  endTime: true,
  duration: true,
  hasRecording: true,
  recordingPath: true,
});

export const insertCallMessageSchema = createInsertSchema(callMessages).pick({
  callId: true,
  text: true,
  sender: true,
  method: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPhrase = z.infer<typeof insertPhraseSchema>;
export type Phrase = typeof phrases.$inferSelect;
export type InsertCallLog = z.infer<typeof insertCallLogSchema>;
export type UpdateCallLog = z.infer<typeof updateCallLogSchema>;
export type CallLog = typeof callLogs.$inferSelect;
export type InsertCallMessage = z.infer<typeof insertCallMessageSchema>;
export type CallMessage = typeof callMessages.$inferSelect;

// Language options
export const supportedLanguages = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी (Hindi)" },
  { code: "ta", name: "தமிழ் (Tamil)" },
  { code: "te", name: "తెలుగు (Telugu)" },
  { code: "bn", name: "বাংলা (Bengali)" },
];

// Categories for phrases
export const phraseCategories = [
  "general",
  "greetings",
  "questions",
  "responses",
  "emergencies",
  "custom"
];
