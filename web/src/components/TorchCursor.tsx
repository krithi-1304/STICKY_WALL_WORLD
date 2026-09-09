import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/** A small animated constellation lamp for the black wall. */
export function TorchCursor() {
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 120, damping: 24, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 120, damping: 24, mass: 0.6 });
  const trailX1 = useSpring(springX, { stiffness: 72, damping: 22, mass: 0.7 });
  const trailY1 = useSpring(springY, { stiffness: 72, damping: 22, mass: 0.7 });
  const trailX2 = useSpring(trailX1, { stiffness: 55, damping: 20, mass: 0.8 });
  const trailY2 = useSpring(trailY1, { stiffness: 55, damping: 20, mass: 0.8 });
  const trailX3 = useSpring(trailX2, { stiffness: 42, damping: 18, mass: 0.9 });
  const trailY3 = useSpring(trailY2, { stiffness: 42, damping: 18, mass: 0.9 });
  const trailX4 = useSpring(trailX3, { stiffness: 32, damping: 16, mass: 1 });
  const trailY4 = useSpring(trailY3, { stiffness: 32, damping: 16, mass: 1 });
  const overNote = useRef(false);
  const [writing, setWriting] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      const nextWriting = event.target instanceof Element && Boolean(event.target.closest('.sticky'));
      if (nextWriting !== overNote.current) {
        overNote.current = nextWriting;
        setWriting(nextWriting);
      }
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [reducedMotion, x, y]);

  if (reducedMotion) return null;

  return (
    <>
      <motion.span className="torch-cursor__trail torch-cursor__trail--one" style={{ left: trailX1, top: trailY1 }} aria-hidden="true" />
      <motion.span className="torch-cursor__trail torch-cursor__trail--two" style={{ left: trailX2, top: trailY2 }} aria-hidden="true" />
      <motion.span className="torch-cursor__trail torch-cursor__trail--three" style={{ left: trailX3, top: trailY3 }} aria-hidden="true" />
      <motion.span className="torch-cursor__trail torch-cursor__trail--four" style={{ left: trailX4, top: trailY4 }} aria-hidden="true" />
      <motion.div
        className={`torch-cursor${writing ? ' torch-cursor--writing' : ''}`}
        style={{ x: springX, y: springY }}
        aria-hidden="true"
      >
      <span className="torch-cursor__core">
        <span className="torch-cursor__halo" />
        <span className="torch-cursor__ring" />
        <span className="torch-cursor__dot" />
        <span className="torch-cursor__glyph">
          {writing ? '✎' : (
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <path d="M16 3l2.2 8.8L27 14l-8.8 2.2L16 25l-2.2-8.8L5 14l8.8-2.2z" />
              <circle cx="27" cy="25" r="1.8" />
            </svg>
          )}
        </span>
      </span>
      </motion.div>
    </>
  );
}
