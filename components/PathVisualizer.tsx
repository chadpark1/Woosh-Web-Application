import React, { useEffect, useRef } from 'react';
import { MovementData } from '../utils/botDetection';

interface PathVisualizerProps {
  movements: MovementData[];
  isGlitchy: boolean;
}

export const PathVisualizer: React.FC<PathVisualizerProps> = ({ movements, isGlitchy }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resizing
    // In a real app we'd use a ResizeObserver, here we just fit to parent or fixed size
    // For simplicity, we assume the canvas fills the container
    const parent = canvas.parentElement;
    if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
    }

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (movements.length < 2) return;

    // Config
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Draw path
    ctx.beginPath();
    ctx.lineWidth = 3;
    
    // We want to transform the coordinates to be relative to the canvas if possible, 
    // but the tracker captures global clientX/Y. 
    // For the demo, we'll map the extent of the movements to the canvas size or just draw raw if it fits.
    // Let's draw raw but subtract the min offset to center the drawing if needed.
    // Actually, drawing raw clientX/Y is best so it matches the mouse cursor visually.
    
    // However, since the canvas is inside a div, we need to account for canvas offset relative to window
    // if we want it to perfectly align under the mouse. 
    // To keep it simple, this visualizer will act as a "replay monitor", fitting the path into view.
    
    if (movements.length > 0) {
        // Calculate bounds to center the path
        const xs = movements.map(m => m.x);
        const ys = movements.map(m => m.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        
        const pathWidth = maxX - minX;
        const pathHeight = maxY - minY;
        
        // Scale to fit with padding
        const padding = 40;
        const scaleX = (canvas.width - padding * 2) / Math.max(pathWidth, 1);
        const scaleY = (canvas.height - padding * 2) / Math.max(pathHeight, 1);
        const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in too much (max 1x)

        const offsetX = (canvas.width - pathWidth * scale) / 2 - minX * scale;
        const offsetY = (canvas.height - pathHeight * scale) / 2 - minY * scale;

        ctx.strokeStyle = isGlitchy ? '#ef4444' : '#3b82f6'; // Red if glitchy, Blue if human

        movements.forEach((p, i) => {
            const drawX = p.x * scale + offsetX;
            const drawY = p.y * scale + offsetY;
            
            if (i === 0) {
                ctx.moveTo(drawX, drawY);
            } else {
                ctx.lineTo(drawX, drawY);
            }
        });
        
        ctx.stroke();

        // Draw points
        movements.forEach((p, i) => {
             const drawX = p.x * scale + offsetX;
             const drawY = p.y * scale + offsetY;
             
             ctx.beginPath();
             ctx.fillStyle = isGlitchy ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)';
             // Highlight fast movements
             const radius = Math.min(Math.max(p.velocity * 2, 2), 8); 
             ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
             ctx.fill();
        });
        
        // Draw start/end markers
        if (movements.length > 0) {
            const first = movements[0];
            const last = movements[movements.length - 1];
            
            drawMarker(ctx, first.x * scale + offsetX, first.y * scale + offsetY, '#10b981'); // Green start
            drawMarker(ctx, last.x * scale + offsetX, last.y * scale + offsetY, '#f59e0b'); // Amber end
        }
    }

  }, [movements, isGlitchy]);

  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.strokeStyle = '#1e293b'; // Slate 800
      ctx.lineWidth = 1;
      const step = 50;
      for (let x = 0; x < w; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
      }
  };

  const drawMarker = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
  };

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-inner">
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div className="absolute top-2 left-3 text-xs text-slate-400 pointer-events-none">
        Movement Path Visualization (Scaled to Fit)
      </div>
    </div>
  );
};
