
import { z } from 'zod';
import { voiceDetectionRequestSchema, voiceDetectionResponseSchema, insertApiKeySchema, apiKeys, requestLogs } from './schema';

export const api = {
  voiceDetection: {
    detect: {
      method: 'POST' as const,
      path: '/api/voice-detection',
      input: voiceDetectionRequestSchema,
      responses: {
        200: voiceDetectionResponseSchema,
        400: z.object({ status: z.literal("error"), message: z.string() }),
        401: z.object({ status: z.literal("error"), message: z.string() }),
      },
    },
  },
  admin: {
    generateKey: {
      method: 'POST' as const,
      path: '/api/admin/generate-key',
      input: z.object({ owner: z.string() }),
      responses: {
        201: z.custom<typeof apiKeys.$inferSelect>(),
      },
    },
    getStats: {
      method: 'GET' as const,
      path: '/api/admin/stats',
      responses: {
        200: z.object({
          totalRequests: z.number(),
          aiDetected: z.number(),
          humanDetected: z.number(),
          recentLogs: z.array(z.custom<typeof requestLogs.$inferSelect>()),
        }),
      },
    }
  }
};
