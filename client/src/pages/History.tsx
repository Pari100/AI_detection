import { Layout } from "@/components/Layout";
import { useAdminStats } from "@/hooks/use-voice-api";
import { format } from "date-fns";
import { Brain, User, Calendar, Loader2 } from "lucide-react";

export default function History() {
  const { data: stats, isLoading } = useAdminStats();

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Request History</h1>
          <p className="text-muted-foreground">Log of recent API analysis requests.</p>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !stats?.recentLogs || stats.recentLogs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No requests recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-xs font-semibold text-white/60 uppercase tracking-wider">
                  <tr>
                    <th className="p-6">Timestamp</th>
                    <th className="p-6">Language</th>
                    <th className="p-6">Classification</th>
                    <th className="p-6">Score</th>
                    <th className="p-6">Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-6 text-sm text-gray-400 font-mono whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 opacity-50" />
                          {log.timestamp ? format(new Date(log.timestamp), 'MMM dd, HH:mm:ss') : '-'}
                        </div>
                      </td>
                      <td className="p-6 text-sm text-white font-medium">{log.language}</td>
                      <td className="p-6">
                        <span className={`
                          inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border
                          ${log.classification === 'AI_GENERATED' 
                            ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' 
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'}
                        `}>
                          {log.classification === 'AI_GENERATED' ? <Brain className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {log.classification.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="w-24 bg-white/10 rounded-full h-1.5 mb-1">
                          <div 
                            className={`h-full rounded-full ${log.classification === 'AI_GENERATED' ? 'bg-purple-500' : 'bg-emerald-500'}`}
                            style={{ width: `${log.confidenceScore * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-gray-400">{(log.confidenceScore * 100).toFixed(1)}%</span>
                      </td>
                      <td className="p-6 text-sm text-gray-400 max-w-xs truncate" title={log.explanation || ''}>
                        {log.explanation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
