import type { Room, Sticky } from './types';

const KEY = 'black-wall:v1';

interface Persisted {
  rooms: Room[];
  stickies: Sticky[];
}

export function loadWorld(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { rooms: [], stickies: [] };
    const parsed = JSON.parse(raw) as Persisted;
    return {
      rooms: parsed.rooms ?? [],
      stickies: parsed.stickies ?? [],
    };
  } catch {
    return { rooms: [], stickies: [] };
  }
}

export function saveWorld(state: Persisted): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — keep the wall alive in memory only.
  }
}
