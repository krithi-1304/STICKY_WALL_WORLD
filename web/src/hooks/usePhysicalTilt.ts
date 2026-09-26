import { useEffect, useRef } from 'react';
export function usePhysicalTilt() {
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  return {
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
      if (event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const el = event.currentTarget, x = event.clientX, y = event.clientY;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--rx', `${Math.max(-5,Math.min(5,-(y-r.top-r.height/2)/r.height*10))}deg`);
        el.style.setProperty('--ry', `${Math.max(-5,Math.min(5,(x-r.left-r.width/2)/r.width*10))}deg`);
        el.style.setProperty('--shine-x', `${(x-r.left)/r.width*100}%`);
      });
    },
    onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
      cancelAnimationFrame(frame.current); event.currentTarget.style.setProperty('--rx','0deg'); event.currentTarget.style.setProperty('--ry','0deg');
    },
  };
}
