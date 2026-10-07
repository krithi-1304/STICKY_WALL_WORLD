import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { playRitualSound } from '../domain/chime';

/** Each glass bulb has a generous hit area; its light never blocks the cards. */
export function FairyLights({ small = false }: { small?: boolean }) {
  const [lit, setLit] = useState<number | null>(null);
  const [focused, setFocused] = useState(0);
  const group = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const reconcile = () => {
      const buttons = [...(group.current?.querySelectorAll('button') ?? [])];
      const current = buttons.find(button => button.tabIndex === 0);
      if (current?.offsetParent !== null && current) return;
      const next = buttons.find(button => button.offsetParent !== null);
      if (!next) return;
      // Update the roving tab stop in the resize callback, before the next Tab.
      buttons.forEach(button => { button.tabIndex = button === next ? 0 : -1; });
      setFocused(buttons.indexOf(next));
      if (document.activeElement === current) next.focus({ preventScroll: true });
    };
    const observer = new ResizeObserver(reconcile);
    if (group.current) observer.observe(group.current);
    window.addEventListener('resize', reconcile);
    return () => { observer.disconnect(); window.removeEventListener('resize', reconcile); };
  }, []);
  const bulbs = small ? [12, 48, 84] : [8, 16.4, 24.8, 33.2, 41.6, 50, 58.4, 66.8, 75.2, 83.6, 92];
  return <div ref={group} className={`fairy-lights${small ? ' fairy-lights--small' : ''}`} role="group" aria-label="Fairy lights — use arrow keys to choose a bulb" data-lit={lit !== null} style={{ '--light-x': `${lit === null ? 50 : bulbs[lit]}%` } as CSSProperties} onKeyDown={event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const buttons = [...event.currentTarget.querySelectorAll('button')].filter(button => button.offsetParent !== null);
    const current = buttons.indexOf(event.target as HTMLButtonElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
  }}>
    <svg aria-hidden="true" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0 3 Q50 32 100 3" /><path className="fairy-lights__twist" d="M0 3 Q50 32 100 3" /></svg>
    {bulbs.map((x, i) => <button key={x} type="button" className="fairy-lights__bulb" tabIndex={focused === i ? 0 : -1} onFocus={() => setFocused(i)} aria-label={`Illuminate fairy light ${i + 1}`} style={{ left: `${x}%`, top: `${3 + .0058 * x * (100 - x)}px`, animationDelay: `${-i * .7}s` }} data-lit={lit === i} onClick={() => {
      clearTimeout(timer.current); setLit(i); void playRitualSound('light'); timer.current = setTimeout(() => setLit(null), 1600);
    }}><span aria-hidden="true" /></button>)}
  </div>;
}
