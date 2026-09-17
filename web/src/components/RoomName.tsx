import type { CSSProperties } from 'react';

/** Decorative fragments disperse around readable, unchanged room text. */
export function RoomName({ name }: { name: string }) {
  return <span className="room-name-effect"><span>{name}</span><span className="room-name-dust" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ '--dx': `${14 + i * 3}px`, '--dy': `${(i % 5 - 2) * 12}px`, '--delay': `${i * 12}ms`, left: `${55 + i * 3}%`, top: `${20 + i % 4 * 18}%` } as CSSProperties} />)}</span></span>;
}
