import { Layout } from "@/components/Layout";
import { Copy, Terminal, Check, AlertCircle } from "lucide-react";
import { useState } from "react";

function CodeBlock({ code, language = "json" }: { code: string, language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-[#0d1117]">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <span className="text-xs font-mono text-muted-foreground">{language}</span>
        <button 
          onClick={handleCopy}
          className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-muted-foreground hover:text-white"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-gray-300">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export default function Documentation() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-10">
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white">API Reference</h1>
          <p className="text-xl text-muted-foreground">
            Complete guide to integrating with the VoiceGuard AI Detection API.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Terminal className="w-6 h-6 text-primary" />
            Authentication
          </h2>
          <div className="glass-panel p-6 rounded-xl border border-white/5">
            <p className="mb-4 text-gray-300 leading-relaxed">
              All API requests must include your unique API Key in the <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">x-api-key</code> header.
            </p>
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>For this demo environment, use key: <strong>DEMO-KEY-123</strong></span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Endpoints</h2>
          
          <div className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-sm font-bold border border-emerald-500/20">POST</span>
                <code className="text-lg text-white font-mono">/api/voice-detection</code>
              </div>
              <p className="text-gray-400">
                Analyzes a Base64 encoded audio sample to determine if it is AI-generated.
              </p>

              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide mt-6">Request Body</h3>
              <CodeBlock code={`{
  "language": "English", // Options: Tamil, English, Hindi, Malayalam, Telugu
  "audioFormat": "mp3",
  "audioBase64": "SUQzBAAAAAAAI1..." // Base64 encoded string
}`} />

              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide mt-6">Success Response (200 OK)</h3>
              <CodeBlock code={`{
  "status": "success",
  "language": "English",
  "classification": "AI_GENERATED", // or "HUMAN"
  "confidenceScore": 0.98,
  "explanation": "Detected uniform pitch patterns characteristic of synthesis."
}`} />
            </section>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Errors</h2>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-muted-foreground font-medium">
                <tr>
                  <th className="p-4">Status</th>
                  <th className="p-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-card/50">
                <tr>
                  <td className="p-4 font-mono text-rose-400">400 Bad Request</td>
                  <td className="p-4 text-gray-400">Missing required fields or invalid audio format.</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-rose-400">401 Unauthorized</td>
                  <td className="p-4 text-gray-400">Missing or invalid API Key.</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono text-rose-400">500 Server Error</td>
                  <td className="p-4 text-gray-400">Internal processing error.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  );
}
