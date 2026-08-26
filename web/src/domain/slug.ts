import type { Room } from './types';

const SLUG_MAX = 48;

/** Turn a room name into a URL-safe, kebab-case slug. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, SLUG_MAX);
}

/** Ensure a slug is unique among existing rooms by appending a counter. */
export function uniqueSlug(base: string, rooms: Room[]): string {
  const existing = new Set(rooms.map((r) => r.slug));
  if (!existing.has(base)) return base;
  let n = 2;
  while (existing.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
