import { motion, useReducedMotion } from 'framer-motion';

const motes = [
  { left: '12%', top: '22%', size: 4, duration: 18, delay: 0 },
  { left: '76%', top: '18%', size: 3, duration: 23, delay: 2 },
  { left: '88%', top: '70%', size: 5, duration: 27, delay: 4 },
  { left: '28%', top: '78%', size: 3, duration: 21, delay: 1 },
];

/** Sparse, low-contrast dust that gives the archive a sense of depth. */
export function WorldAtmosphere() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="world-atmosphere" aria-hidden="true">
      {motes.map((mote) => (
        <motion.span
          key={`${mote.left}-${mote.top}`}
          className="world-atmosphere__mote"
          style={{ left: mote.left, top: mote.top, width: mote.size, height: mote.size }}
          animate={reducedMotion ? { opacity: 0.18 } : {
            opacity: [0.08, 0.28, 0.08],
            y: [0, -18, 0],
            x: [0, 8, 0],
          }}
          transition={reducedMotion ? { duration: 0 } : {
            duration: mote.duration,
            delay: mote.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
