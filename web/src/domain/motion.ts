/** Small, deterministic motion helpers; no animation library or frame loop. */
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export function fallingFrames(element: HTMLElement): Keyframe[] {
  const base = getComputedStyle(element).transform;
  const transform = base === 'none' ? '' : base;
  const distance = innerHeight + element.getBoundingClientRect().height + 80;
  return Array.from({ length: 9 }, (_, i) => {
    const t = i / 8;
    return { offset: t, transform: `translate3d(${32 * t * t}px,${distance * t * t}px,0) ${transform} rotate(${14 * t * t - Math.sin(t * Math.PI) * 3}deg)`, opacity: t < .85 ? 1 : Math.max(0, (1 - t) / .15) };
  });
}
