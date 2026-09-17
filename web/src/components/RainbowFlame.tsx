import { useEffect, useState, type CSSProperties } from 'react';

/** Lives outside routes so a flame can finish without delaying navigation. */
export function RainbowFlame() {
  const [burst, setBurst] = useState<{ x: number; y: number; id: number } | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let id = 0;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const ignite = (event: MouseEvent) => {
      if (motion.matches || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const target = event.target instanceof Element ? event.target.closest('.lobby a, .lobby button') : null;
      if (!target || target.classList.contains('room-tag__delete')) return;
      const rect = target.getBoundingClientRect();
      setBurst({ x: event.detail ? event.clientX : rect.left + rect.width / 2, y: event.detail ? event.clientY : rect.top + rect.height / 2, id: ++id });
      clearTimeout(timer);
      timer = setTimeout(() => setBurst(null), 850);
    };
    const hide = () => { clearTimeout(timer); setBurst(null); };
    const motionChanged = () => { if (motion.matches) hide(); };
    window.addEventListener('click', ignite, true);
    window.addEventListener('blur', hide);
    motion.addEventListener('change', motionChanged);
    return () => { clearTimeout(timer); window.removeEventListener('click', ignite, true); window.removeEventListener('blur', hide); motion.removeEventListener('change', motionChanged); };
  }, []);
  return burst && <div key={burst.id} className="rainbow-flame" style={{ left: burst.x, top: burst.y }} aria-hidden="true">
    {['#ff657b', '#ffa94d', '#ffe790', '#7ff5bd', '#6ecfff', '#c795ff'].map((color, i) => <span key={color} style={{ '--flame-color': color, '--lean': `${(i - 2.5) * 14}deg`, '--lift': `${68 + i % 3 * 16}px`, animationDelay: `${i * 18}ms` } as CSSProperties} />)}
  </div>;
}
