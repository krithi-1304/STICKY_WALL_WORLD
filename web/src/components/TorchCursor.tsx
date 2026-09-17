import { useEffect, useRef } from 'react';

/** An offset match leaves the native pointer and text caret precise. */
export function TorchCursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const media = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let frame = 0;
    let px = -100, py = -100;
    const hide = () => { el.dataset.visible = 'false'; };
    const move = (event: PointerEvent) => {
      if (!media.matches || event.pointerType === 'touch') { hide(); return; }
      px = event.clientX; py = event.clientY;
      const editing = event.target instanceof Element && Boolean(event.target.closest('input, textarea, [contenteditable="true"]'));
      el.dataset.visible = String(!editing);
      if (!frame) frame = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${px + 12}px, ${py + 12}px, 0)`;
        frame = 0;
      });
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('blur', hide);
    document.documentElement.addEventListener('pointerleave', hide);
    document.addEventListener('visibilitychange', hide);
    media.addEventListener('change', hide);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('blur', hide);
      document.documentElement.removeEventListener('pointerleave', hide);
      document.removeEventListener('visibilitychange', hide);
      media.removeEventListener('change', hide);
    };
  }, []);
  return <div ref={ref} className="match-cursor" data-visible="false" aria-hidden="true">
    <span className="match-cursor__glow" />
    <span className="match-cursor__aura" />
    <span className="match-cursor__wood" /><span className="match-cursor__head" />
    <span className="match-cursor__flame"><span /></span>
    <span className="match-cursor__tongue match-cursor__tongue--gold" />
    <span className="match-cursor__tongue match-cursor__tongue--blue" />
    <span className="match-cursor__smoke match-cursor__smoke--1" />
    <span className="match-cursor__smoke match-cursor__smoke--2" />
    <span className="match-cursor__smoke match-cursor__smoke--3" />
    <span className="match-cursor__spark match-cursor__spark--1" />
    <span className="match-cursor__spark match-cursor__spark--2" />
    <span className="match-cursor__spark match-cursor__spark--3" />
  </div>;
}
