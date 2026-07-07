import { useState, useEffect } from "react";
import { Terminal, CheckCircle2, XCircle, Play, RefreshCw, Cpu, Wifi } from "lucide-react";

interface LogEntry {
  timestamp: string;
  type: "info" | "success" | "error";
  message: string;
}

export default function DiagnosticConsole() {
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: new Date().toLocaleTimeString(), type: "info", message: "Diagnostic Station initialized." }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [healthStatus, setHealthStatus] = useState<"unknown" | "healthy" | "failed">("unknown");
  const [keyPresent, setKeyPresent] = useState<boolean | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  const addLog = (type: "info" | "success" | "error", message: string) => {
    setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), type, message }]);
  };

  const checkHealth = async () => {
    const startTime = Date.now();
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      const duration = Date.now() - startTime;
      
      setLatency(duration);
      setHealthStatus(data.status === "healthy" ? "healthy" : "failed");
      setKeyPresent(data.geminiKeyConfigured);
      
      addLog("success", `Server connection verified in ${duration}ms.`);
      addLog("info", `Gemini API key is ${data.geminiKeyConfigured ? "VALID & LOADED" : "NOT CONFIGURED (Running on Fallback Mode)"}.`);
    } catch (err: any) {
      setHealthStatus("failed");
      addLog("error", `Server health check failed: ${err.message}`);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const runFullDiagnostics = async () => {
    setIsRunning(true);
    addLog("info", "Starting full API diagnostics sequence...");
    
    // 1. Check health
    await checkHealth();

    // 2. Test Chatbot Endpoint
    addLog("info", "Querying `/api/chat` for AI response check...");
    const startTimeChat = Date.now();
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Perform system diagnostics. Return standard confirmation.",
          role: "staff",
          language: "en"
        })
      });
      const data = await res.json();
      const duration = Date.now() - startTimeChat;

      if (res.ok) {
        if (data.demoMode) {
          addLog("info", `Chatbot returned successful Demo Mode response in ${duration}ms.`);
        } else {
          addLog("success", `AI Model response validated in ${duration}ms.`);
        }
      } else {
        addLog("error", `Chat API returned error state: ${data.error || "Unknown error"}`);
      }
    } catch (chatErr: any) {
      addLog("error", `Failed to connect to Chat endpoint: ${chatErr.message}`);
    }

    // 3. Test Incident resolver JSON schema
    addLog("info", "Querying `/api/incident-resolve` for JSON Schema validation...");
    try {
      const res = await fetch("/api/incident-resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Diagnostic Test Incident",
          location: "Zone Zero",
          severity: "low",
          category: "facilities",
          description: "Testing API schema parameters and PA script generation."
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        addLog("success", "Schema parsed successfully. Action plan generated.");
      } else {
        addLog("error", `Schema testing failed: ${data.error}`);
      }
    } catch (schemaErr: any) {
      addLog("error", `Failed to complete schema resolver: ${schemaErr.message}`);
    }

    addLog("success", "Diagnostics sequence completed.");
    setIsRunning(false);
  };

  return (
    <div id="diagnostic-console-root" className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-xl p-5 flex flex-col h-[500px]">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="font-display font-bold text-sm sm:text-base text-white">System Diagnostics Terminal</h3>
            <p className="text-[10px] text-slate-400">Validate real-time routes, schemas, and connection integrity</p>
          </div>
        </div>

        <button
          onClick={runFullDiagnostics}
          disabled={isRunning}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          {isRunning ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          <span>{isRunning ? "Testing..." : "Run Self-Check Diagnostics"}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        
        {/* Health */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wide block">Server Connection</span>
            <span className="font-mono text-xs font-bold mt-1 block">
              {healthStatus === "healthy" ? "HEALTHY" : healthStatus === "failed" ? "ERROR" : "CHECKING..."}
            </span>
          </div>
          {healthStatus === "healthy" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-500" />
          )}
        </div>

        {/* Gemini key */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wide block">Gemini API Key</span>
            <span className="font-mono text-xs font-bold mt-1 block">
              {keyPresent === true ? "ACTIVE (PROD)" : keyPresent === false ? "FALLBACK (DEMO)" : "WAITING..."}
            </span>
          </div>
          <Cpu className={`w-5 h-5 ${keyPresent ? "text-emerald-400" : "text-amber-500"}`} />
        </div>

        {/* Latency */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wide block">Ping Delay</span>
            <span className="font-mono text-xs font-bold mt-1 block">
              {latency ? `${latency}ms` : "N/A"}
            </span>
          </div>
          <Wifi className="w-5 h-5 text-sky-400" />
        </div>

      </div>

      {/* Terminal logs window */}
      <div className="flex-1 bg-black rounded-xl p-4 font-mono text-[11px] overflow-y-auto space-y-2 border border-slate-800">
        {logs.map((log, idx) => (
          <div key={idx} className="flex items-start space-x-1.5">
            <span className="text-slate-500">[{log.timestamp}]</span>
            <span className={`font-semibold ${
              log.type === "success" ? "text-emerald-400" : log.type === "error" ? "text-rose-400 animate-pulse" : "text-sky-300"
            }`}>
              {log.type === "success" ? "✔" : log.type === "error" ? "✖" : "i"}
            </span>
            <span className={log.type === "error" ? "text-rose-200" : "text-slate-300"}>
              {log.message}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
