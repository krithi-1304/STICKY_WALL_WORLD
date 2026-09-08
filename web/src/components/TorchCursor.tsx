import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/** A small animated constellation lamp for the black wall. */
export function TorchCursor() {
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 120, damping: 24, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 120, damping: 24, mass: 0.6 });
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
    <motion.div
      className={`torch-cursor${writing ? ' torch-cursor--writing' : ''}`}
      style={{ x: springX, y: springY }}
      aria-hidden="true"
    >
      <span className="torch-cursor__core">
        <span className="torch-cursor__halo" />
        <span className="torch-cursor__ring" />
        <span className="torch-cursor__dot" />
        <span className="torch-cursor__glyph">{writing ? '✎' : '✦'}</span>
      </span>
    </motion.div>
  );
}
