import { MovementData, Point, TrackerOptions, GlitchAssessment } from './types';
import { detectGlitch } from './glitchDetector';

export class MouseTracker {
  private buffer: MovementData[] = [];
  private lastPoint: Point | null = null;
  private isTracking: boolean = false;
  private options: Required<TrackerOptions>;
  private listeners: { [key: string]: EventListener } = {};

  constructor(options: TrackerOptions = {}) {
    this.options = {
      bufferSize: 100,
      onUpdate: () => {},
      onAnalysis: () => {},
      ...options,
    };

    // Bind methods
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  public start(): void {
    if (this.isTracking) return;
    this.isTracking = true;
    this.lastPoint = null;
    this.buffer = [];

    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mousedown', this.handleMouseMove); // Capture clicks as movement points too
  }

  public stop(): void {
    if (!this.isTracking) return;
    this.isTracking = false;
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.handleMouseMove);
  }

  /**
   * Manually inject an event (useful for simulation)
   */
  public injectEvent(x: number, y: number, time: number = performance.now()) {
      this.processPoint(x, y, time);
  }

  private handleMouseMove(e: Event): void {
    const mouseEvent = e as MouseEvent;
    const now = performance.now();
    this.processPoint(mouseEvent.clientX, mouseEvent.clientY, now);
  }

  private processPoint(x: number, y: number, time: number) {
    if (!this.lastPoint) {
      this.lastPoint = { x, y, time };
      return;
    }

    const dt = time - this.lastPoint.time;
    // Filter out duplicates (0ms delta) which can happen with some browsers/input devices firing multiple events
    if (dt <= 0) return; 

    const dx = x - this.lastPoint.x;
    const dy = y - this.lastPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const velocity = distance / dt;

    // Calculate acceleration (change in velocity / time)
    // We need the previous velocity for this. 
    const prevMovement = this.buffer[this.buffer.length - 1];
    const prevVelocity = prevMovement ? prevMovement.velocity : 0;
    const acceleration = Math.abs(velocity - prevVelocity) / dt;

    const movement: MovementData = {
      x,
      y,
      time,
      dx,
      dy,
      dt,
      velocity,
      acceleration
    };

    // Add to buffer
    this.buffer.push(movement);
    if (this.buffer.length > this.options.bufferSize) {
      this.buffer.shift();
    }

    this.lastPoint = { x, y, time };

    // Emit updates
    this.options.onUpdate([...this.buffer]);

    // Run analysis
    this.runAnalysis();
  }

  private runAnalysis() {
    // We analyze the current buffer
    // In a real app, you might debounce this or only run it on 'mouseup' or specific intervals
    const assessment = detectGlitch(this.buffer);
    this.options.onAnalysis(assessment);
  }

  public getBuffer(): MovementData[] {
    return this.buffer;
  }
  
  public clear(): void {
      this.buffer = [];
      this.lastPoint = null;
      this.options.onUpdate([]);
      this.options.onAnalysis({ isGlitchy: false, score: 0, reasons: [] });
  }
}
