
import { db } from "./db";
import { apiKeys, requestLogs, type ApiKey, type InsertApiKey, type RequestLog, type InsertRequestLog } from "@shared/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { randomBytes } from "crypto";

export interface IStorage {
  // API Keys
  getApiKey(key: string): Promise<ApiKey | undefined>;
  createApiKey(owner: string): Promise<ApiKey>;
  
  // Logs
  logRequest(log: InsertRequestLog): Promise<RequestLog>;
  getRecentLogs(limit?: number): Promise<RequestLog[]>;
  getStats(): Promise<{
    totalRequests: number;
    aiDetected: number;
    humanDetected: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getApiKey(key: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.key, key));
    return apiKey;
  }

  async createApiKey(owner: string): Promise<ApiKey> {
    const key = "sk_" + randomBytes(16).toString("hex");
    const [apiKey] = await db.insert(apiKeys).values({
      key,
      owner,
      isActive: true,
    }).returning();
    return apiKey;
  }

  async logRequest(log: InsertRequestLog): Promise<RequestLog> {
    const [entry] = await db.insert(requestLogs).values(log).returning();
    return entry;
  }

  async getRecentLogs(limit: number = 50): Promise<RequestLog[]> {
    return db.select()
      .from(requestLogs)
      .orderBy(desc(requestLogs.timestamp))
      .limit(limit);
  }

  async getStats() {
    const [total] = await db.select({ count: count() }).from(requestLogs);
    const [ai] = await db.select({ count: count() }).from(requestLogs).where(eq(requestLogs.classification, "AI_GENERATED"));
    const [human] = await db.select({ count: count() }).from(requestLogs).where(eq(requestLogs.classification, "HUMAN"));
    
    return {
      totalRequests: Number(total?.count || 0),
      aiDetected: Number(ai?.count || 0),
      humanDetected: Number(human?.count || 0),
    };
  }
}

export const storage = new DatabaseStorage();
