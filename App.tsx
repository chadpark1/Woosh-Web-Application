import React, { useEffect, useState } from 'react';
import { processSession } from './services/analyticsService';
import { SessionPayload, SecurityResponse, Point } from './utils/botDetection/types';
import { Terminal, ShieldCheck, ShieldAlert } from 'lucide-react';

// --- PLACEHOLDER VARIABLES (Simulating Database/Incoming Requests) ---

const MOCK_HUMAN_SESSION: SessionPayload = {
  sessionId: "sess_human_12345",
  userId: "user_882",
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  points: Array.from({ length: 20 }, (_, i) => ({
    x: 100 + i * 10 + Math.sin(i) * 5, // Natural arc/jitter
    y: 200 + i * 5 + Math.cos(i) * 5,
    time: 1677721600000 + i * 16 + (Math.random() * 4) // Variable timing (~60fps)
  }))
};

const MOCK_BOT_LINEAR_SESSION: SessionPayload = {
  sessionId: "sess_bot_linear_999",
  userId: "unknown_crawler",
  userAgent: "HeadlessChrome/99.0.1",
  points: Array.from({ length: 20 }, (_, i) => ({
    x: 100 + i * 20, // Perfect linearity
    y: 200 + i * 20,
    time: 1677721700000 + i * 10 // Perfect 10ms intervals
  }))
};

const MOCK_BOT_TELEPORT_SESSION: SessionPayload = {
  sessionId: "sess_bot_teleport_001",
  userId: "script_v2",
  userAgent: "Python/3.9 aiohttp",
  points: [
    { x: 100, y: 100, time: 1677721800000 },
    { x: 102, y: 101, time: 1677721800050 },
    { x: 105, y: 103, time: 1677721800100 },
    { x: 900, y: 800, time: 1677721800116 }, // Massive jump in 16ms
    { x: 905, y: 805, time: 1677721800150 }
  ]
};

// --- SERVER SIMULATION COMPONENT ---

const App: React.FC = () => {
  const [logs, setLogs] = useState<SecurityResponse[]>([]);

  useEffect(() => {
    const runSimulation = async () => {
      // Simulate receiving requests sequentially
      const res1 = await processSession(MOCK_HUMAN_SESSION);
      setLogs(prev => [...prev, res1]);

      await new Promise(r => setTimeout(r, 1000));

      const res2 = await processSession(MOCK_BOT_LINEAR_SESSION);
      setLogs(prev => [...prev, res2]);

      await new Promise(r => setTimeout(r, 1000));

      const res3 = await processSession(MOCK_BOT_TELEPORT_SESSION);
      setLogs(prev => [...prev, res3]);
    };

    runSimulation();
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-8 overflow-auto">
      <div className="max-w-4xl mx-auto border border-green-900 bg-gray-900/50 rounded-lg shadow-2xl shadow-green-900/20">
        
        <div className="flex items-center gap-2 p-4 border-b border-green-900 bg-black/50">
          <Terminal className="w-5 h-5" />
          <h1 className="text-lg font-bold tracking-wider">SECURE_BACKEND_TERMINAL_V1.0</h1>
          <div className="ml-auto flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500"></div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-slate-500 text-sm">
            > Initializing GlitchDetectionService...<br/>
            > Listening for session payloads...<br/>
            > Ready.
          </div>

          {logs.map((log, index) => (
            <div key={log.sessionId} className="border-l-2 border-green-700 pl-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs text-slate-500">[{log.processedAt}]</span>
                <span className="font-bold">SESSION_ID: {log.sessionId}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 bg-black/40 p-4 rounded mb-2">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Risk Assessment</div>
                  <div className={`text-xl font-bold flex items-center gap-2 ${
                    log.riskLevel === 'CRITICAL' || log.riskLevel === 'HIGH' ? 'text-red-500' :
                    log.riskLevel === 'MEDIUM' ? 'text-yellow-500' : 'text-emerald-500'
                  }`}>
                    {log.riskLevel}
                    {log.riskLevel === 'LOW' ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Bot Score</div>
                  <div className="text-xl font-bold text-white">
                    {(log.assessment.score * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {log.assessment.reasons.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-red-400 font-bold uppercase mr-2">FLAGS DETECTED:</span>
                  {log.assessment.reasons.map(r => (
                    <span key={r} className="inline-block px-2 py-0.5 bg-red-900/30 text-red-300 text-xs rounded border border-red-900/50 mr-2">
                      {r}
                    </span>
                  ))}
                </div>
              )}
              
              {log.assessment.reasons.length === 0 && (
                 <div className="mt-2 text-emerald-700 text-sm italic">
                    > No anomalies detected. Pattern matches human baseline.
                 </div>
              )}
            </div>
          ))}

          {logs.length < 3 && (
            <div className="animate-pulse text-green-800">
              > Processing incoming stream...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;