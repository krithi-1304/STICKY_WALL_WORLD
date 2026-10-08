import { useEffect, useRef, useState, type CSSProperties } from 'react';

type Letter = { id: number; x: number; tilt: number };
/** Bounded decoration. One owned RAF, no pending work after off/hidden/unmount. */
export function FallingLetters({ enabled }: { enabled: boolean }) {
  const [letters, setLetters] = useState<Letter[]>([]);
  const serial = useRef(0);
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame: number | null = null;
    let last = 0;
    let active = true;
    const emit = () => {
      const id = ++serial.current;
      // Keep falling stationery near the edges, away from reading and input.
      setLetters(previous => [...previous.slice(-7), { id, x: id % 2 ? 3 + id * 7 % 17 : 80 + id * 3 % 17, tilt: id * 17 % 40 - 20 }]);
    };
    const tick = (now: number) => {
      frame = null;
      if (!active || !enabled || document.hidden || reduced.matches) return;
      if (now - last > 900) { last = now; emit(); }
      frame = requestAnimationFrame(tick);
    };
    const stop = () => { if (frame !== null) cancelAnimationFrame(frame); frame = null; setLetters([]); };
    const sync = () => {
      if (!active || !enabled || document.hidden || reduced.matches) { stop(); return; }
      if (frame === null) { last = performance.now(); emit(); frame = requestAnimationFrame(tick); }
    };
    sync(); document.addEventListener('visibilitychange', sync); reduced.addEventListener('change', sync);
    return () => { active = false; if (frame !== null) cancelAnimationFrame(frame); frame = null; document.removeEventListener('visibilitychange', sync); reduced.removeEventListener('change', sync); };
  }, [enabled]);
  return <div data-testid="falling-letters" className="falling-letters" aria-hidden="true">{enabled && letters.map(letter => <span key={letter.id} data-letter-id={letter.id} style={{ left: `${letter.x}%`, '--fall-tilt': `${letter.tilt}deg` } as CSSProperties} onAnimationEnd={() => setLetters(previous => previous.filter(p => p.id !== letter.id))}><svg viewBox="0 0 32 24" fill="none"><rect x="1" y="1" width="30" height="22" rx="2"/><path d="m2 3 14 11L30 3M2 22l9-9m19 9-9-9"/></svg></span>)}</div>;
}
