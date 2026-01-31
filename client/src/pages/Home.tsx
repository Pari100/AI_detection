import { useState } from "react";
import { useVoiceDetection, useAdminStats } from "@/hooks/use-voice-api";
import { FileUpload } from "@/components/FileUpload";
import { StatsCard } from "@/components/StatsCard";
import { Layout } from "@/components/Layout";
import { 
  Mic, 
  Brain, 
  User, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  Copy
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ['#8b5cf6', '#10b981']; // Primary purple for AI, Emerald for Human

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const detectMutation = useVoiceDetection();
  
  const [selectedLang, setSelectedLang] = useState<"Tamil" | "English" | "Hindi" | "Malayalam" | "Telugu">("English");
  const [audioBase64, setAudioBase64] = useState<string | null>(null);

  const handleAnalyze = () => {
    if (!audioBase64) return;
    detectMutation.mutate({
      language: selectedLang,
      audioFormat: "mp3",
      audioBase64: audioBase64
    });
  };

  const pieData = stats ? [
    { name: 'AI Generated', value: stats.aiDetected },
    { name: 'Human Voice', value: stats.humanDetected },
  ] : [];

  return (
    <Layout>
      <div className="space-y-8">
        
        {/* Header Section */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Detection Dashboard</h1>
          <p className="text-muted-foreground text-lg">Real-time analysis of voice samples using advanced heuristics.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Total Requests" 
            value={stats?.totalRequests || 0} 
            icon={<Activity className="w-6 h-6" />}
            delay={0.1}
          />
          <StatsCard 
            title="AI Detected" 
            value={stats?.aiDetected || 0} 
            icon={<Brain className="w-6 h-6 text-purple-400" />}
            trend={`${stats ? Math.round((stats.aiDetected / (stats.totalRequests || 1)) * 100) : 0}%`}
            trendUp={true}
            delay={0.2}
          />
          <StatsCard 
            title="Human Detected" 
            value={stats?.humanDetected || 0} 
            icon={<User className="w-6 h-6 text-emerald-400" />}
            delay={0.3}
          />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel rounded-2xl p-4 flex items-center justify-center relative min-h-[160px]"
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <h4 className="text-xs font-bold tracking-widest text-white/10 uppercase">Distribution</h4>
            </div>
            <div className="w-full h-full min-h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Main Analysis Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left: Input Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel rounded-2xl p-8 border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Mic className="w-5 h-5 text-primary" />
                  Live Analysis
                </h2>
                
                <select 
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value as any)}
                  className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                >
                  {["English", "Tamil", "Hindi", "Malayalam", "Telugu"].map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-6">
                <FileUpload 
                  onFileSelect={setAudioBase64} 
                  disabled={detectMutation.isPending} 
                />

                <button
                  onClick={handleAnalyze}
                  disabled={!audioBase64 || detectMutation.isPending}
                  className="
                    w-full py-4 rounded-xl font-semibold text-lg
                    bg-gradient-to-r from-primary to-purple-600
                    text-white shadow-lg shadow-primary/25
                    hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5
                    active:translate-y-0 active:shadow-md
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                    transition-all duration-200 ease-out
                    flex items-center justify-center gap-2
                  "
                >
                  {detectMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing Audio Signature...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      Analyze Voice Sample
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Results Panel */}
          <div className="lg:col-span-1">
            <div className="glass-panel rounded-2xl p-6 h-full border border-white/5 flex flex-col relative overflow-hidden">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Analysis Results
              </h2>

              {!detectMutation.data && !detectMutation.isPending && (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 opacity-50" />
                  </div>
                  <p>Upload an audio file and click Analyze to see AI detection results here.</p>
                </div>
              )}

              {detectMutation.isPending && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-sm text-primary font-mono animate-pulse">PROCESSING AUDIO DATA...</p>
                </div>
              )}

              {detectMutation.data && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className={`
                    p-6 rounded-xl border-2 text-center
                    ${detectMutation.data.classification === 'AI_GENERATED' 
                      ? 'bg-purple-500/10 border-purple-500/50 text-purple-200' 
                      : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200'}
                  `}>
                    <div className="text-sm uppercase tracking-widest opacity-70 mb-2">Verdict</div>
                    <div className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                      {detectMutation.data.classification === 'AI_GENERATED' 
                        ? <Brain className="w-8 h-8" />
                        : <User className="w-8 h-8" />
                      }
                      {detectMutation.data.classification.replace('_', ' ')}
                    </div>
                    <div className="text-sm font-mono">
                      Confidence: {(detectMutation.data.confidenceScore * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-white/70 uppercase tracking-wide">Analysis Log</h3>
                    <div className="bg-black/40 rounded-lg p-4 font-mono text-xs text-muted-foreground leading-relaxed border border-white/10">
                      <p className="mb-2 text-primary">&gt; Analyzing spectral features...</p>
                      <p className="mb-2">&gt; Checking pitch consistency...</p>
                      <p className="text-white">{detectMutation.data.explanation}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4 flex items-center justify-between border border-white/10">
                    <span className="text-sm text-muted-foreground">Request ID</span>
                    <span className="text-sm font-mono text-white">REQ-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
