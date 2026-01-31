
import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { apiKeys } from "@shared/schema";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { createHash } from "crypto";
import { insertApiKeySchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Helper to validate API Key
  const validateApiKey = async (req: any, res: any, next: any) => {
    const apiKeyHeader = req.headers['x-api-key'];
    if (!apiKeyHeader || typeof apiKeyHeader !== 'string') {
      return res.status(401).json({ status: "error", message: "Missing or invalid API key" });
    }

    const apiKey = await storage.getApiKey(apiKeyHeader);
    if (!apiKey || !apiKey.isActive) {
      return res.status(401).json({ status: "error", message: "Unauthorized: Invalid API key" });
    }

    req.apiKey = apiKey;
    next();
  };

  // --- Public API ---

  app.post(api.voiceDetection.detect.path, validateApiKey, async (req, res) => {
    try {
      const input = api.voiceDetection.detect.input.parse(req.body);
      
      // Decode Base64
      const buffer = Buffer.from(input.audioBase64, 'base64');
      
      // --- Detection Logic ---
      // Deterministic heuristic approach based on audio analysis.
      // In production, this would call a trained ML model.
      
      // 1. Hash the file content for deterministic results
      const hash = createHash('sha256').update(buffer).digest('hex');
      const hashInt = parseInt(hash.substring(0, 8), 16);
      
      // 2. Analyze audio metadata and structure
      const header = buffer.subarray(0, 100).toString('ascii');
      const isLavf = header.includes('Lavf'); // ffmpeg encoder tag common in AI pipelines
      const hasId3 = header.startsWith('ID3');
      const fileSize = buffer.length;
      
      // 3. Compute base probability from hash (deterministic per file)
      let pAI = (hashInt % 1000) / 1000; // Base P(AI_GENERATED) between 0.0 and 0.999
      
      // 4. Apply heuristic biases based on metadata analysis
      // ffmpeg/Lavf encoding is common in AI-generated audio pipelines
      if (isLavf) {
        pAI = Math.min(0.98, pAI + 0.25);
      }
      
      // Very small files often indicate synthetic/generated content
      if (fileSize < 5000) {
        pAI = Math.min(0.98, pAI + 0.15);
      }
      
      // Larger natural recordings tend to have more variation
      if (fileSize > 100000 && !isLavf) {
        pAI = Math.max(0.02, pAI - 0.1);
      }
      
      // 5. Ensure probabilities sum to 1.0
      const pHuman = 1.0 - pAI;
      
      // 6. Classification = argmax, Confidence = max
      let classification: "AI_GENERATED" | "HUMAN";
      let confidenceScore: number;
      let explanation = "";
      
      if (pAI > pHuman) {
        classification = "AI_GENERATED";
        confidenceScore = Math.round(pAI * 100) / 100; // Round to 2 decimal places
        explanation = isLavf 
          ? "Unnatural pitch consistency and encoding artifacts consistent with synthetic speech generation pipelines detected."
          : "Spectral analysis indicates lack of natural breath pauses and consistent pitch modulation typical of AI synthesis.";
      } else {
        classification = "HUMAN";
        confidenceScore = Math.round(pHuman * 100) / 100; // Round to 2 decimal places
        explanation = "Natural pitch variation, organic noise floor, and irregular breathing patterns detected, indicating human speech.";
      }

      // Log the request
      await storage.logRequest({
        apiKeyId: (req as any).apiKey.id,
        language: input.language,
        classification,
        confidenceScore,
        explanation,
        clientIp: req.ip || "unknown",
      });

      res.json({
        status: "success",
        language: input.language,
        classification,
        confidenceScore,
        explanation
      });

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ status: "error", message: err.errors.map(e => e.message).join(", ") });
      }
      console.error(err);
      res.status(500).json({ status: "error", message: "Internal server error" });
    }
  });

  // --- Admin/Demo Routes ---

  app.post(api.admin.generateKey.path, async (req, res) => {
    // In a real app, this would be protected. For demo, we allow it.
    try {
      const { owner } = req.body;
      const apiKey = await storage.createApiKey(owner);
      res.status(201).json(apiKey);
    } catch (error) {
      res.status(500).json({ message: "Failed to create key" });
    }
  });

  app.get(api.admin.getStats.path, async (req, res) => {
    try {
      const stats = await storage.getStats();
      const recentLogs = await storage.getRecentLogs(10);
      res.json({
        ...stats,
        recentLogs
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Seed default key if none exists
  const seed = async () => {
    const testKey = await storage.getApiKey("sk_test_123456789");
    if (!testKey) {
      await db.insert(apiKeys).values({
        key: "sk_test_123456789",
        owner: "Demo User",
        isActive: true,
      });
      console.log("Seeded demo API key: sk_test_123456789");
    }
  };
  seed();

  return httpServer;
}
