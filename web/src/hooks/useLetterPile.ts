import { useLayoutEffect, type RefObject } from 'react';
/** Measure on content/size/enable changes; preserve each letter's flow slot. */
export function useLetterPile(ref: RefObject<HTMLElement | null>, text: string, visible: boolean | string = true) {
  useLayoutEffect(() => {
    const field = ref.current;
    if (!field || !visible) return;
    let frame: number | null = null;
    let active = true;
    const measure = () => {
      frame = null;
      if (!active || document.hidden) return;
      const width = field.clientWidth, height = field.clientHeight;
      field.querySelectorAll<HTMLElement>('.pile-letter').forEach((letter, i) => {
        const scale = Math.min(.95, Math.max(.6, (width - 18) / Math.max(1, letter.offsetWidth)));
        const targetX = 8 + (i * 61 % 101) / 100 * Math.max(0, width - letter.offsetWidth * scale - 18);
        const targetY = Math.max(0, height - 24 - (i * 17 % 42));
        letter.style.setProperty('--pile-x', `${targetX - letter.offsetLeft}px`);
        letter.style.setProperty('--pile-y', `${targetY - letter.offsetTop}px`);
        letter.style.setProperty('--pile-angle', `${(i * 29 % 111) - 55}deg`);
        letter.style.setProperty('--pile-scale', String(scale));
        letter.style.setProperty('--pile-delay', `${i * 43 % 160}ms`);
      });
    };
    const cancel = () => { if (frame !== null) cancelAnimationFrame(frame); frame = null; };
    const schedule = () => { cancel(); if (active && !document.hidden) frame = requestAnimationFrame(measure); };
    measure();
    const observer = new ResizeObserver(schedule); observer.observe(field);
    void document.fonts.ready.then(schedule);
    document.addEventListener('visibilitychange', schedule);
    return () => { active = false; cancel(); observer.disconnect(); document.removeEventListener('visibilitychange', schedule); };
  }, [ref, text, visible]);
}
