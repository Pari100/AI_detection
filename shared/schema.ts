
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  owner: text("owner").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const requestLogs = pgTable("request_logs", {
  id: serial("id").primaryKey(),
  apiKeyId: integer("api_key_id").references(() => apiKeys.id),
  language: text("language").notNull(),
  classification: text("classification").notNull(), // AI_GENERATED or HUMAN
  confidenceScore: real("confidence_score").notNull(),
  explanation: text("explanation"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  clientIp: text("client_ip"),
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({ id: true, createdAt: true });
export const insertRequestLogSchema = createInsertSchema(requestLogs).omit({ id: true, timestamp: true });

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type RequestLog = typeof requestLogs.$inferSelect;
export type InsertRequestLog = z.infer<typeof insertRequestLogSchema>;

// API Request/Response Types
export const voiceDetectionRequestSchema = z.object({
  language: z.enum(["Tamil", "English", "Hindi", "Malayalam", "Telugu"]),
  audioFormat: z.literal("mp3"),
  audioBase64: z.string().min(1, "Audio data is required"),
});

export type VoiceDetectionRequest = z.infer<typeof voiceDetectionRequestSchema>;

export const voiceDetectionResponseSchema = z.object({
  status: z.enum(["success", "error"]),
  language: z.string(),
  classification: z.enum(["AI_GENERATED", "HUMAN"]),
  confidenceScore: z.number().min(0).max(1),
  explanation: z.string(),
});

export type VoiceDetectionResponse = z.infer<typeof voiceDetectionResponseSchema>;
