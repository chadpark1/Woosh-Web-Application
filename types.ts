// Global application types
// Note: Specific bot detection types are in utils/botDetection/types.ts

export interface AppState {
  isRecording: boolean;
  sessionId: string;
}

export interface SimulationConfig {
  type: 'linear' | 'teleport' | 'jitter' | 'human';
  speed: number;
}