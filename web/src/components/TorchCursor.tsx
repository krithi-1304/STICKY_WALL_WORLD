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
        <span className="torch-cursor__glyph">
          {writing ? '✎' : (
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <path d="M7 5h11l7 7v5H7z" />
              <path d="M7 5v22h7V5" />
              <path d="M18 12h7l5 4-5 4h-7z" />
            </svg>
          )}
        </span>
      </span>
    </motion.div>
  );
}
