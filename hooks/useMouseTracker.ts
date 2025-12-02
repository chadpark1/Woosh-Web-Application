import { useEffect, useRef, useState, useCallback } from 'react';
import { MouseTracker, MovementData, GlitchAssessment } from '../utils/botDetection';

export const useMouseTracker = () => {
  const [movements, setMovements] = useState<MovementData[]>([]);
  const [assessment, setAssessment] = useState<GlitchAssessment>({
    isGlitchy: false,
    score: 0,
    reasons: []
  });
  
  const trackerRef = useRef<MouseTracker | null>(null);

  useEffect(() => {
    // Initialize tracker
    trackerRef.current = new MouseTracker({
      bufferSize: 100, // Keep last 100 points for visualization
      onUpdate: (data) => {
        // We use functional state update or throttle this if performance is an issue
        // For this demo, direct update is fine for modern browsers
        setMovements(data); 
      },
      onAnalysis: (result) => {
        setAssessment(result);
      }
    });

    trackerRef.current.start();

    return () => {
      trackerRef.current?.stop();
    };
  }, []);

  const clearHistory = useCallback(() => {
    trackerRef.current?.clear();
  }, []);

  const simulateMovement = useCallback((points: {x: number, y: number, time: number}[]) => {
      if (!trackerRef.current) return;
      
      // We process them sequentially to simulate real-time arrival for the tracker logic
      // However, for the loop, we just inject them fast
      points.forEach(p => {
          trackerRef.current?.injectEvent(p.x, p.y, p.time);
      });
  }, []);

  return {
    movements,
    assessment,
    clearHistory,
    simulateMovement
  };
};
