import React from 'react';
import { MovementData, GlitchAssessment } from '../utils/botDetection';
import { ShieldAlert, ShieldCheck, Gauge, MousePointer2 } from 'lucide-react';

interface StatsPanelProps {
  assessment: GlitchAssessment;
  lastMovement: MovementData | null;
  totalPoints: number;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ assessment, lastMovement, totalPoints }) => {
  const isBot = assessment.isGlitchy;
  const scorePercent = Math.round(assessment.score * 100);
  
  // Dynamic colors based on score
  const scoreColor = isBot ? 'text-red-500' : scorePercent > 30 ? 'text-yellow-500' : 'text-emerald-500';
  const progressColor = isBot ? 'bg-red-500' : scorePercent > 30 ? 'bg-yellow-500' : 'bg-emerald-500';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* Risk Score Card */}
      <div className={`p-6 rounded-xl border ${isBot ? 'bg-red-950/20 border-red-900' : 'bg-slate-800 border-slate-700'} transition-colors`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-1">Bot Risk Score</h2>
            <div className={`text-4xl font-bold ${scoreColor} flex items-center gap-2`}>
              {scorePercent}%
              {isBot ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
            </div>
          </div>
          <div className="text-right">
            <div className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${isBot ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {isBot ? 'SUSPICIOUS' : 'HUMAN-LIKE'}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden mb-4">
            <div 
                className={`h-full transition-all duration-300 ${progressColor}`} 
                style={{ width: `${Math.max(scorePercent, 5)}%` }}
            />
        </div>

        <div className="space-y-2">
            <p className="text-xs text-slate-500 uppercase font-semibold">Detection Flags:</p>
            {assessment.reasons.length === 0 ? (
                <span className="text-sm text-slate-400 italic">None detected</span>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {assessment.reasons.map(reason => (
                        <span key={reason} className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs text-slate-300">
                            {reason.replace(/_/g, ' ')}
                        </span>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Live Metrics Card */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-4 flex items-center gap-2">
            <Gauge className="w-4 h-4" /> Live Metrics
        </h2>
        
        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div>
                <p className="text-xs text-slate-500 mb-1">Velocity</p>
                <p className="text-2xl font-mono text-slate-200">
                    {lastMovement ? lastMovement.velocity.toFixed(2) : '0.00'} <span className="text-xs text-slate-500">px/ms</span>
                </p>
            </div>
            <div>
                <p className="text-xs text-slate-500 mb-1">Acceleration</p>
                <p className="text-2xl font-mono text-slate-200">
                    {lastMovement ? lastMovement.acceleration.toFixed(2) : '0.00'} <span className="text-xs text-slate-500">px/ms²</span>
                </p>
            </div>
            <div>
                <p className="text-xs text-slate-500 mb-1">Coordinates</p>
                <p className="text-lg font-mono text-slate-200 flex items-center gap-2">
                    <MousePointer2 className="w-3 h-3 text-slate-500" />
                    {lastMovement ? `${Math.round(lastMovement.x)}, ${Math.round(lastMovement.y)}` : '---, ---'}
                </p>
            </div>
            <div>
                <p className="text-xs text-slate-500 mb-1">Points Buffered</p>
                <p className="text-lg font-mono text-slate-200">
                    {totalPoints}
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
