export interface Point {
  x: number;
  y: number;
  time: number;
}

export interface MovementData extends Point {
  dx: number;
  dy: number;
  dt: number;
  velocity: number; // pixels per ms
  acceleration: number; // pixels per ms^2
}

export interface GlitchAssessment {
  isGlitchy: boolean;
  score: number; // 0 (human) to 1 (bot)
  reasons: string[];
}

// The payload sent from the client to the backend
export interface SessionPayload {
  sessionId: string;
  userId: string;
  userAgent: string;
  points: Point[]; // Raw coordinates
}

// The response from the backend
export interface SecurityResponse {
  sessionId: string;
  processedAt: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assessment: GlitchAssessment;
}

export interface MouseSessionSummary {
  sessionId: string;
  totalDistance: number;
  avgVelocity: number;
  maxVelocity: number;
  eventCount: number;
  duration: number;
}

export interface TrackerOptions {
  bufferSize?: number;
  onUpdate?: (data: MovementData[]) => void;
  onAnalysis?: (assessment: GlitchAssessment) => void;
}