import { startScaling } from '../../../DS1/0-face/scaling';

export interface Squares {
  unit: number;
  across: number;
  down: number;
  narrow: boolean;
}

const SQUARE = 20;
const listeners = new Set<(squares: Squares) => void>();
let last: Squares | null = null;

export function measure(): Squares {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  const unit = SQUARE * (Number(style.getPropertyValue('--sf')) || 1);
  const across = Number(style.getPropertyValue('--ds-grid-columns')) || Math.max(1, Math.floor(root.clientWidth / unit + 0.02));
  const down = Number(style.getPropertyValue('--ds-grid-rows')) || Math.max(1, Math.floor(root.clientHeight / unit + 0.02));
  const narrow = across < 40;
  root.style.setProperty('--across', String(across));
  root.style.setProperty('--down', String(down));
  root.toggleAttribute('data-narrow', narrow);
  return { unit, across, down, narrow };
}

export function onSquares(draw: (squares: Squares) => void): () => void {
  listeners.add(draw);
  draw(last ?? startStudy());
  return () => listeners.delete(draw);
}

let started = false;
export function startStudy(): Squares {
  if (!started) {
    started = true;
    startScaling({ desktop: 'aligned' });
    let frame = 0;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = measure();
        const changed = !last || next.unit !== last.unit || next.across !== last.across || next.down !== last.down;
        last = next;
        if (changed) listeners.forEach(draw => draw(next));
      });
    });
  }
  return (last = measure());
}

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
