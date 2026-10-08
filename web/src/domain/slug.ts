import type { Room } from './types';

/** Ensure a slug is unique among existing rooms by appending a counter. */
export function uniqueSlug(base: string, rooms: Room[]): string {
  const existing = new Set(rooms.map((r) => r.slug));
  if (!existing.has(base)) return base;
  let n = 2;
  while (existing.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
