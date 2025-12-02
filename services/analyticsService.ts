import { calculateDerivatives, detectGlitch } from "../utils/botDetection/glitchDetector";
import { SessionPayload, SecurityResponse } from "../utils/botDetection/types";

// Simulate Backend Processing Latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Backend Service Function
 * Receives raw session data, computes physics derivatives, and runs security analysis.
 */
export const processSession = async (payload: SessionPayload): Promise<SecurityResponse> => {
  console.log(`[Backend] Received payload for session: ${payload.sessionId}`);
  
  await delay(100); // Simulate processing time

  // 1. Data Enrichment (Server-side calculation)
  // We do not trust client-sent velocity/acceleration. We calculate it from raw points.
  const enrichedMovements = calculateDerivatives(payload.points);

  // 2. Pattern Analysis
  const assessment = detectGlitch(enrichedMovements);

  // 3. Risk Classification
  let riskLevel: SecurityResponse['riskLevel'] = 'LOW';
  
  if (assessment.score >= 0.8) riskLevel = 'CRITICAL';
  else if (assessment.score >= 0.5) riskLevel = 'HIGH';
  else if (assessment.score >= 0.3) riskLevel = 'MEDIUM';

  console.log(`[Backend] Session ${payload.sessionId} Result: ${riskLevel} (Score: ${assessment.score})`);

  return {
    sessionId: payload.sessionId,
    processedAt: new Date().toISOString(),
    riskLevel,
    assessment
  };
};