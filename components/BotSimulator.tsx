import React from 'react';
import { Activity, Zap, Minus, Play } from 'lucide-react';

interface BotSimulatorProps {
  onSimulate: (type: 'linear' | 'teleport' | 'jitter') => void;
  onClear: () => void;
}

export const BotSimulator: React.FC<BotSimulatorProps> = ({ onSimulate, onClear }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-indigo-400" />
        <h3 className="font-semibold text-slate-100">Simulation Lab</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => onSimulate('linear')}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-lg transition-colors border border-slate-600 group"
        >
          <Minus className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Perfect Line</span>
        </button>

        <button
          onClick={() => onSimulate('teleport')}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-lg transition-colors border border-slate-600 group"
        >
          <Zap className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Teleport Jump</span>
        </button>

        <button
          onClick={() => onSimulate('jitter')}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-lg transition-colors border border-slate-600 group"
        >
          <Activity className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">High Freq Jitter</span>
        </button>
        
        <button
            onClick={onClear}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-900/50 rounded-lg transition-all"
        >
            <span className="text-sm font-medium">Clear History</span>
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        * Simulates raw event data injection into the tracker. Does not move actual cursor.
      </p>
    </div>
  );
};
