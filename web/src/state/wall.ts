import { create } from 'zustand';
import { loadWorld, saveWorld } from '../domain/storage';
import { slugify, uniqueSlug } from '../domain/slug';
import { STICKY_LIMITS } from '../domain/types';
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
}

const persisted = loadWorld();

const uid = () => crypto.randomUUID();
const now = () => Date.now();
const clampRotation = (deg: number) =>
  Math.max(STICKY_LIMITS.minRotation, Math.min(STICKY_LIMITS.maxRotation, deg));
const rand = (min: number, max: number) => min + Math.random() * (max - min);

function pickColor(existing: Sticky[]): StickyColorId {
  const palette: StickyColorId[] = ['butter', 'blush', 'sage', 'sky', 'lilac', 'mist'];
  return palette[existing.length % palette.length] as StickyColorId;
}

function pickTape(i: number): TapeStyle {
  const tapes: TapeStyle[] = ['plain', 'diagonal', 'dots', 'grid'];
  return tapes[i % tapes.length] as TapeStyle;
}

function nextZ(stickies: Sticky[]): number {
  return stickies.reduce((max, s) => Math.max(max, s.zIndex), 0) + 1;
}

/** Overlap check — a new note shouldn't hide an old one. */
function overlaps(
  x: number, y: number, w: number, h: number,
  others: Sticky[], pad = 24,
): boolean {
  return others.some(
    (s) =>
      x < s.x + s.w + pad && x + w + pad > s.x &&
      y < s.y + s.h + pad && y + h + pad > s.y,
  );
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

  for (let attempt = 0; attempt < 40; attempt += 1) {
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
  // Fallback: anywhere free-ish.
  return {
    x: rand(24, Math.max(48, wall.w - noteW - 24)),
    y: rand(48, Math.max(72, wall.h - noteH - 24)),
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
    const w = Math.round(rand(176, 236));
    const h = Math.round(rand(176, 236));
    const at = organicSpawn(wall, inRoom, w, h);
    const i = inRoom.length;

    const sticky: Sticky = {
      id: uid(),
      roomId,
      x: at.x,
      y: at.y,
      w,
      h,
      rotation: clampRotation(rand(-7, 7)),
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
    set((s) => {
      const inRoom = s.stickies
        .filter((st) => st.roomId === roomId && !st.archived)
        .sort((a, b) => a.createdAt - b.createdAt);
      if (inRoom.length === 0) return s;

      // Loose grid: columns sized to the widest note, gentle jitter per cell.
      const gap = 40;
      const colW = Math.max(...inRoom.map((st) => st.w)) + gap;
      const cols = Math.max(1, Math.floor((wall.w - 80) / colW));
      const totalW = cols * colW - gap;
      const startX = Math.max(40, (wall.w - totalW) / 2);
      let maxRowH = 0;

      const arranged = new Map<string, Partial<Sticky>>();
      inRoom.forEach((st, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        maxRowH = Math.max(maxRowH, st.h);
        arranged.set(st.id, {
          x: Math.round(startX + col * colW + rand(-6, 6)),
          y: Math.round(72 + row * (maxRowH + gap) + rand(-5, 5)),
          rotation: clampRotation(rand(-3, 3)),
          updatedAt: now(),
        });
      });

      const stickies = s.stickies.map((st) =>
        arranged.has(st.id) ? { ...st, ...arranged.get(st.id) } : st,
      );
      const next = { rooms: s.rooms, stickies };
      saveWorld(next);
      return next;
    }),
}));

/** Selectors */
export const selectRoomBySlug = (slug: string) => (s: WallStore) =>
  s.rooms.find((r) => r.slug === slug);

export const selectStickiesForRoom = (roomId: string) => (s: WallStore) =>
  s.stickies.filter((st) => st.roomId === roomId && !st.archived);

export type { HandFontId, StickyColorId, TapeStyle };
