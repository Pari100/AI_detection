import { Layout } from "@/components/Layout";
import { useAdminStats, useDeleteLogs } from "@/hooks/use-voice-api";
import { format } from "date-fns";
import { Brain, User, Calendar, Loader2, Trash2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function History() {
  const { data: stats, isLoading, refetch } = useAdminStats();
  const deleteLogsMutation = useDeleteLogs();
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useToast();

  // Get only first 5 logs that haven't been deleted
  const displayLogs = stats?.recentLogs?.filter((log: any) => !deletedIds.includes(log.id)).slice(0, 5) || [];

  const handleDeleteLog = (logId: number) => {
    setDeletedIds([...deletedIds, logId]);
    toast({
      title: "Log deleted",
      description: "The log entry has been removed from history.",
    });
  };

  const handleClearAll = async () => {
    try {
      await deleteLogsMutation.mutateAsync();
      setDeletedIds([]);
      setShowConfirm(false);
      refetch(); // Refresh the stats
      toast({
        title: "History cleared",
        description: "All log entries have been removed from the database.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear logs. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setDeletedIds([]);
    setShowConfirm(false);
    toast({
      title: "History restored",
      description: "All log entries have been restored.",
    });
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">Request History</h1>
            <p className="text-muted-foreground">
              {displayLogs.length === 0 
                ? "No requests recorded - history is empty." 
                : `Showing ${displayLogs.length} of ${stats?.recentLogs?.length || 0} recent requests (most recent first).`}
            </p>
          </div>
          <div className="flex gap-2">
            {deletedIds.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReset}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Restore
              </Button>
            )}
            {displayLogs.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setShowConfirm(true)}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="glass-panel rounded-xl p-4 border border-red-500/20 bg-red-500/5 space-y-3">
            <p className="text-white font-medium">Are you sure you want to clear all logs?</p>
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleClearAll}
              >
                Yes, clear all
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : displayLogs.length === 0 ? (
          <div className="p-12 text-center glass-panel rounded-2xl border border-white/5">
            <Brain className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground mb-2">0 Requests Recorded</p>
            <p className="text-xs text-gray-500">Submit audio files for analysis to see results here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayLogs.map((log) => (
              <div 
                key={log.id} 
                className="glass-panel rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                        <Calendar className="w-3 h-3 opacity-50" />
                        {log.timestamp ? format(new Date(log.timestamp), 'MMM dd, HH:mm:ss') : '-'}
                      </div>
                      <span className="text-xs text-gray-500 px-2 py-1 bg-white/5 rounded">
                        {log.language}
                      </span>
                      <span className={`
                        inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border
                        ${log.classification === 'AI_GENERATED' 
                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' 
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'}
                      `}>
                        {log.classification === 'AI_GENERATED' ? <Brain className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {log.classification.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-white/10 rounded-full h-1.5">
                        <div 
                          className={`h-full rounded-full ${log.classification === 'AI_GENERATED' ? 'bg-purple-500' : 'bg-emerald-500'}`}
                          style={{ width: `${log.confidenceScore * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-gray-400">{(log.confidenceScore * 100).toFixed(1)}%</span>
                    </div>

                    <p className="text-sm text-gray-300 leading-relaxed">
                      {log.explanation}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/10 rounded-lg text-red-400 hover:text-red-300"
                    title="Delete this log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
