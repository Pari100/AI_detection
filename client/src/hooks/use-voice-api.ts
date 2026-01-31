import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { VoiceDetectionRequest, VoiceDetectionResponse } from "@shared/schema";

// POST /api/voice-detection
export function useVoiceDetection() {
  return useMutation({
    mutationFn: async (data: VoiceDetectionRequest) => {
      const res = await fetch(api.voiceDetection.detect.path, {
        method: api.voiceDetection.detect.method,
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': 'DEMO-KEY-123' // Mock key for frontend demo
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Detection failed');
      }

      return api.voiceDetection.detect.responses[200].parse(await res.json());
    },
  });
}

// GET /api/admin/stats
export function useAdminStats() {
  return useQuery({
    queryKey: [api.admin.getStats.path],
    queryFn: async () => {
      const res = await fetch(api.admin.getStats.path);
      if (!res.ok) throw new Error('Failed to fetch stats');
      return api.admin.getStats.responses[200].parse(await res.json());
    },
    refetchInterval: 5000, // Real-time feel
  });
}

// POST /api/admin/generate-key
export function useGenerateKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (owner: string) => {
      const res = await fetch(api.admin.generateKey.path, {
        method: api.admin.generateKey.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner }),
      });
      if (!res.ok) throw new Error('Failed to generate key');
      return api.admin.generateKey.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      // Could invalidate key list if we had one
    },
  });
}
