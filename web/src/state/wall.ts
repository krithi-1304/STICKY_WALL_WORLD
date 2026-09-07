import { create } from 'zustand';
import { loadWorld, saveWorld } from '../domain/storage';
import { slugify, uniqueSlug } from '../domain/slug';
import { STICKY_COLORS, STICKY_LIMITS } from '../domain/types';
import type { HandFontId, Room, Sticky, StickyColorId, TapeStyle } from '../domain/types';

interface WallStore {
  rooms: Room[];
  stickies: Sticky[];
  createRoom: (input: { name: string; symbol: string }) => Room;
  updateRoom: (roomId: string, patch: Partial<Room>) => void;
  deleteRoom: (roomId: string) => void;
  addSticky: (roomId: string, wall: { w: number; h: number }) => Sticky | null;
  updateSticky: (id: string, patch: Partial<Sticky>) => void;
  deleteSticky: (id: string) => void;
  deleteStickies: (ids: string[]) => void;
  /** Arrange a room's notes into a loose organic grid. */
  tidyRoom: (roomId: string, wall: { w: number; h: number }) => void;
  /** Sort notes by date into a soft grid. dir: 'asc' oldest-first, 'desc' newest-first. */
  sortRoom: (roomId: string, wall: { w: number; h: number }, dir: 'asc' | 'desc') => void;
}

const persisted = loadWorld();

const uid = () => crypto.randomUUID();
const now = () => Date.now();
const clampRotation = (deg: number) =>
  Math.max(STICKY_LIMITS.minRotation, Math.min(STICKY_LIMITS.maxRotation, deg));
const rand = (min: number, max: number) => min + Math.random() * (max - min);

const COLOR_IDS = STICKY_COLORS.map((c) => c.id) as StickyColorId[];
const TAPE_IDS: TapeStyle[] = ['plain', 'dots', 'diagonal', 'grid', 'hearts', 'stars', 'checker', 'confetti'];

function pickColor(existing: Sticky[]): StickyColorId {
  return COLOR_IDS[existing.length % COLOR_IDS.length] as StickyColorId;
}

function pickTape(i: number): TapeStyle {
  return TAPE_IDS[i % TAPE_IDS.length] as TapeStyle;
}

function nextZ(stickies: Sticky[]): number {
  return stickies.reduce((max, s) => Math.max(max, s.zIndex), 0) + 1;
}

/** Overlap check — a new note shouldn't hide an old one. */
function overlaps(
  x: number, y: number, w: number, h: number,
  others: Sticky[], pad = 24,
): boolean {
  // CSS rotates around the center, so reserve the largest likely visual
  // footprint instead of checking only the unrotated layout box.
  const inflate = 1.25;
  const candidateW = w * inflate;
  const candidateH = h * inflate;
  const candidateX = x + (w - candidateW) / 2;
  const candidateY = y + (h - candidateH) / 2;

  return others.some((s) => {
    const existingW = s.w * inflate;
    const existingH = s.h * inflate;
    const existingX = s.x + (s.w - existingW) / 2;
    const existingY = s.y + (s.h - existingH) / 2;
    return (
      candidateX < existingX + existingW + pad &&
      candidateX + candidateW + pad > existingX &&
      candidateY < existingY + existingH + pad &&
      candidateY + candidateH + pad > existingY
    );
  });
}

/**
 * Place a new note organically: golden-angle scatter from the wall's
 * visual center, retried until it lands without overlapping.
 */
function organicSpawn(
  wall: { w: number; h: number },
  others: Sticky[],
  noteW: number,
  noteH: number,
): { x: number; y: number } {
  const cx = wall.w / 2;
  const cy = wall.h / 2;
  const n = others.length;
  const GOLDEN = Math.PI * (3 - Math.sqrt(5)); // ~137.5°

  for (let attempt = 0; attempt < 80; attempt += 1) {
    const i = n + attempt;
    const r = 90 + Math.sqrt(i + 1) * 120 + rand(-30, 30);
    const a = i * GOLDEN + rand(-0.5, 0.5);
    const x = cx + Math.cos(a) * r * 1.35 - noteW / 2;
    const y = cy + Math.sin(a) * r * 0.8 - noteH / 2;
    const clampedX = Math.max(16, Math.min(wall.w - noteW - 16, x));
    const clampedY = Math.max(40, Math.min(wall.h - noteH - 16, y));
    if (!overlaps(clampedX, clampedY, noteW, noteH, others)) {
      return { x: clampedX, y: clampedY };
    }
  }

  // Deterministic fallback: scan a loose grid before allowing any overlap.
  const step = Math.max(28, Math.min(noteW, noteH) * 0.42);
  for (let y = 48; y <= wall.h - noteH - 16; y += step) {
    for (let x = 16; x <= wall.w - noteW - 16; x += step) {
      if (!overlaps(x, y, noteW, noteH, others)) return { x, y };
    }
  }

  // A full wall should grow rather than silently stack notes. The caller's
  // wall is scrollable, so this remains visible and recoverable.
  const lowest = others.reduce(
    (max, sticky) => Math.max(max, sticky.y + sticky.h),
    wall.h,
  );
  return {
    x: Math.max(16, wall.w - noteW - 16),
    y: lowest + 48,
  };
}

export const useWall = create<WallStore>((set, get) => ({
  rooms: persisted.rooms,
  stickies: persisted.stickies,

  createRoom: ({ name, symbol }) => {
    const trimmed = name.trim() || 'Untitled room';
    const room: Room = {
      id: uid(),
      slug: uniqueSlug(slugify(trimmed) || 'room', get().rooms),
      name: trimmed,
      symbol: symbol.trim() || '✷',
      accent: null,
      wallTint: 'charcoal',
      fontId: 'caveat',
      createdAt: now(),
      updatedAt: now(),
    };
    set((s) => {
      const next = { rooms: [...s.rooms, room], stickies: s.stickies };
      saveWorld(next);
      return next;
    });
    return room;
  },

  updateRoom: (roomId, patch) =>
    set((s) => {
      const rooms = s.rooms.map((r) =>
        r.id === roomId ? { ...r, ...patch, updatedAt: now() } : r,
      );
      const next = { rooms, stickies: s.stickies };
      saveWorld(next);
      return next;
    }),

  deleteRoom: (roomId) =>
    set((s) => {
      const next = {
        rooms: s.rooms.filter((r) => r.id !== roomId),
        stickies: s.stickies.filter((st) => st.roomId !== roomId),
      };
      saveWorld(next);
      return next;
    }),

  addSticky: (roomId, wall) => {
    const { stickies } = get();
    const inRoom = stickies.filter((s) => s.roomId === roomId && !s.archived);
    if (inRoom.length >= STICKY_LIMITS.maxStickiesPerRoom) return null;

    // Real notes vary — size, angle, tape differ so the wall feels hand-made.
    const { minSize, maxSize } = STICKY_LIMITS;
    const w = Math.round(rand(minSize, maxSize));
    const h = Math.round(rand(minSize, maxSize));
    const at = organicSpawn(wall, inRoom, w, h);
    const i = inRoom.length;

    const sticky: Sticky = {
      id: uid(),
      roomId,
      x: at.x,
      y: at.y,
      w,
      h,
      rotation: clampRotation(rand(-12, 12)),
      zIndex: nextZ(inRoom),
      color: pickColor(inRoom),
      tape: pickTape(i),
      tapeTilt: Math.round(rand(-4, 4) * 10) / 10,
      body: '',
      pinned: false,
      archived: false,
      createdAt: now(),
      updatedAt: now(),
    };
    set((s) => {
      const next = { rooms: s.rooms, stickies: [...s.stickies, sticky] };
      saveWorld(next);
      return next;
    });
    return sticky;
  },

  updateSticky: (id, patch) =>
    set((s) => {
      const stickies = s.stickies.map((st) => {
        if (st.id !== id) return st;
        return {
          ...st,
          ...patch,
          rotation:
            patch.rotation !== undefined ? clampRotation(patch.rotation) : st.rotation,
          updatedAt: now(),
        };
      });
      const next = { rooms: s.rooms, stickies };
      saveWorld(next);
      return next;
    }),

  deleteSticky: (id) =>
    set((s) => {
      const next = {
        rooms: s.rooms,
        stickies: s.stickies.filter((st) => st.id !== id),
      };
      saveWorld(next);
      return next;
    }),

  deleteStickies: (ids) =>
    set((s) => {
      const drop = new Set(ids);
      const next = {
        rooms: s.rooms,
        stickies: s.stickies.filter((st) => !drop.has(st.id)),
      };
      saveWorld(next);
      return next;
    }),

  tidyRoom: (roomId, wall) =>
    set((s) => layoutRoom(s, roomId, wall, 'asc')),

  sortRoom: (roomId, wall, dir) =>
    set((s) => layoutRoom(s, roomId, wall, dir)),
}));

/**
 * Shared organic-grid layout. dir 'asc' = oldest first (tidy),
 * 'desc' = newest first. Keeps per-note rotation/size so it still
 * looks like a wall, not a spreadsheet.
 */
function layoutRoom(
  s: { rooms: Room[]; stickies: Sticky[] },
  roomId: string,
  wall: { w: number; h: number },
  dir: 'asc' | 'desc',
) {
  const inRoom = s.stickies
    .filter((st) => st.roomId === roomId && !st.archived)
    .sort((a, b) => (dir === 'asc' ? a.createdAt - b.createdAt : b.createdAt - a.createdAt));
  if (inRoom.length === 0) return s;

  // Loose grid: columns sized to the widest note, gentle jitter per cell.
  const gap = 40;
  const colW = Math.max(...inRoom.map((st) => st.w)) + gap;
  const cols = Math.max(1, Math.floor((wall.w - 80) / colW));
  const totalW = cols * colW - gap;
  const startX = Math.max(40, (wall.w - totalW) / 2);
  const rowH = Math.max(...inRoom.map((st) => st.h));

  const arranged = new Map<string, Partial<Sticky>>();
  inRoom.forEach((st, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    arranged.set(st.id, {
      x: Math.round(startX + col * colW + rand(-7, 7)),
      y: Math.round(72 + row * (rowH + gap) + rand(-6, 6)),
      rotation: clampRotation(rand(-7, 7)),
      updatedAt: now(),
    });
  });

  const stickies = s.stickies.map((st) =>
    arranged.has(st.id) ? { ...st, ...arranged.get(st.id) } : st,
  );
  const next = { rooms: s.rooms, stickies };
  saveWorld(next);
  return next;
}

/** Selectors */
export const selectRoomBySlug = (slug: string) => (s: WallStore) =>
  s.rooms.find((r) => r.slug === slug);

export const selectStickiesForRoom = (roomId: string) => (s: WallStore) =>
  s.stickies.filter((st) => st.roomId === roomId && !st.archived);

export type { HandFontId, StickyColorId, TapeStyle };
