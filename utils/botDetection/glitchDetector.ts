import { MovementData, GlitchAssessment, Point } from './types';

/**
 * Tunable constants for detection sensitivity
 */
const CONFIG = {
  VELOCITY_SPIKE_THRESHOLD: 5.0, // pixels/ms (extremely fast)
  ACCELERATION_THRESHOLD: 0.5, // pixels/ms^2
  LINEARITY_THRESHOLD: 0.5, // Max deviation pixels allowed for "perfect" line
  MIN_POINTS_FOR_ANALYSIS: 5,
};

/**
 * Converts raw points into enriched movement data with derivatives.
 * This is essential for backend verification to prevent client-side spoofing of velocity values.
 */
export const calculateDerivatives = (points: Point[]): MovementData[] => {
  if (points.length < 2) return [];

  const enriched: MovementData[] = [];
  
  // Initialize with the first point (no velocity/accel yet)
  enriched.push({
    ...points[0],
    dx: 0,
    dy: 0,
    dt: 0,
    velocity: 0,
    acceleration: 0
  });

  for (let i = 1; i < points.length; i++) {
    const current = points[i];
    const prev = points[i - 1];

    const dt = current.time - prev.time;
    // Skip duplicates or zero-time events to avoid Infinity
    if (dt <= 0) continue;

    const dx = current.x - prev.x;
    const dy = current.y - prev.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const velocity = distance / dt;

    // Calculate acceleration based on previous velocity
    const prevVelocity = enriched[enriched.length - 1].velocity;
    const acceleration = Math.abs(velocity - prevVelocity) / dt;

    enriched.push({
      ...current,
      dx,
      dy,
      dt,
      velocity,
      acceleration
    });
  }

  return enriched;
};

/**
 * Calculates the perpendicular distance from a point to a line defined by start and end points.
 */
const perpendicularDistance = (point: MovementData, start: MovementData, end: MovementData): number => {
  const numerator = Math.abs(
    (end.y - start.y) * point.x - (end.x - start.x) * point.y + end.x * start.y - end.y * start.x
  );
  const denominator = Math.sqrt(Math.pow(end.y - start.y, 2) + Math.pow(end.x - start.x, 2));
  if (denominator === 0) return 0;
  return numerator / denominator;
};

/**
 * Analyzes a sequence of movement data to detect bot-like patterns.
 */
export const detectGlitch = (movements: MovementData[]): GlitchAssessment => {
  if (movements.length < CONFIG.MIN_POINTS_FOR_ANALYSIS) {
    return { isGlitchy: false, score: 0, reasons: [] };
  }

  const reasons: Set<string> = new Set();
  let score = 0;

  // 1. Check for Teleportation / Extreme Velocity
  const maxVelocity = Math.max(...movements.map((m) => m.velocity));
  if (maxVelocity > CONFIG.VELOCITY_SPIKE_THRESHOLD) {
    reasons.add('teleport_jump');
    score += 0.8;
  }

  // 2. Check for Perfect Linearity
  const start = movements[0];
  const end = movements[movements.length - 1];
  const totalDist = Math.hypot(end.x - start.x, end.y - start.y);

  if (totalDist > 50) { // Only check linearity for significant movements
    let maxDeviation = 0;
    let totalDeviation = 0;
    let checkedPoints = 0;

    for (let i = 1; i < movements.length - 1; i++) {
      const dist = perpendicularDistance(movements[i], start, end);
      maxDeviation = Math.max(maxDeviation, dist);
      totalDeviation += dist;
      checkedPoints++;
    }

    if (checkedPoints > 0) {
      const avgDeviation = totalDeviation / checkedPoints;
      // If deviation is suspiciously low, it's a bot
      if (avgDeviation < CONFIG.LINEARITY_THRESHOLD) {
        reasons.add('perfect_linearity');
        score += 0.6;
      }
    }
  }

  // 3. Check for Time Consistency (Machine-like timing)
  const timeDeltas = movements.map(m => m.dt).filter(dt => dt > 0);
  if (timeDeltas.length > 5) {
      const meanDt = timeDeltas.reduce((a, b) => a + b, 0) / timeDeltas.length;
      const varianceDt = timeDeltas.reduce((a, b) => a + Math.pow(b - meanDt, 2), 0) / timeDeltas.length;
      
      if (varianceDt < 0.1 && movements.length > 10) {
           reasons.add('robotic_timing');
           score += 0.3;
      }
      
      const nearZeroCount = timeDeltas.filter(dt => dt < 2).length;
      if (nearZeroCount > movements.length * 0.8) {
          reasons.add('instant_batch_movement');
          score += 0.5;
      }
  }

  // 4. Check for Unrealistic Acceleration
  const maxAccel = Math.max(...movements.map(m => m.acceleration));
  if (maxAccel > CONFIG.ACCELERATION_THRESHOLD) {
      reasons.add('unnatural_acceleration');
      score += 0.4;
  }

  // Cap score at 1
  return {
    isGlitchy: score >= 0.5,
    score: Math.min(score, 1),
    reasons: Array.from(reasons),
  };
};