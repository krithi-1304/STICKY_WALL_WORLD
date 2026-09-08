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
  deleteSticky: (id: string, wall?: { w: number; h: number }) => void;
  deleteStickies: (ids: string[], wall?: { w: number; h: number }) => void;
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

/** Place a note in the next aligned slot, skipping occupied slots. */
function organicSpawn(
  wall: { w: number; h: number },
  others: Sticky[],
  noteW: number,
  noteH: number,
): { x: number; y: number } {
  const slot = 320;
  const columns = Math.max(1, Math.floor((wall.w - 48) / slot));
  const totalWidth = columns * slot;
  const startX = Math.max(16, (wall.w - totalWidth) / 2);
  const startY = 56;

  // Row-major order gives the user a predictable next place to look.
  for (let index = 0; index < 200; index += 1) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = Math.max(16, startX + column * slot + (slot - noteW) / 2);
    const y = startY + row * slot + (slot - noteH) / 2;
    if (!overlaps(x, y, noteW, noteH, others)) return { x, y };
  }

  // The quota is 200 notes. If every slot is occupied, continue below the
  // wall with full note-height clearance instead of stacking a note.
  const lowest = others.reduce(
    (max, sticky) => Math.max(max, sticky.y + sticky.h),
    wall.h,
  );
  return { x: Math.max(16, startX), y: lowest + 48 };
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

  deleteSticky: (id, wall) =>
    set((s) => {
      const removed = s.stickies.find((st) => st.id === id);
      const next = {
        rooms: s.rooms,
        stickies: s.stickies.filter((st) => st.id !== id),
      };
      return removed && wall ? layoutRoom(next, removed.roomId, wall, 'asc', true) : saveAndReturn(next);
    }),

  deleteStickies: (ids, wall) =>
    set((s) => {
      const drop = new Set(ids);
      const roomId = s.stickies.find((st) => drop.has(st.id))?.roomId;
      const next = {
        rooms: s.rooms,
        stickies: s.stickies.filter((st) => !drop.has(st.id)),
      };
      return roomId && wall ? layoutRoom(next, roomId, wall, 'asc', true) : saveAndReturn(next);
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
  preserveRotation = false,
) {
  const inRoom = s.stickies
    .filter((st) => st.roomId === roomId && !st.archived)
    .sort((a, b) => (dir === 'asc' ? a.createdAt - b.createdAt : b.createdAt - a.createdAt));
  if (inRoom.length === 0) return s;

  const slot = 320;
  const cols = Math.max(1, Math.floor((wall.w - 48) / slot));
  const startX = Math.max(16, (wall.w - cols * slot) / 2);

  const arranged = new Map<string, Partial<Sticky>>();
  inRoom.forEach((st, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    arranged.set(st.id, {
      x: Math.round(startX + col * slot + (slot - st.w) / 2),
      y: Math.round(72 + row * slot + (slot - st.h) / 2),
      rotation: preserveRotation ? st.rotation : clampRotation(rand(-7, 7)),
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

function saveAndReturn(state: { rooms: Room[]; stickies: Sticky[] }) {
  saveWorld(state);
  return state;
}

/** Selectors */
export const selectRoomBySlug = (slug: string) => (s: WallStore) =>
  s.rooms.find((r) => r.slug === slug);

export const selectStickiesForRoom = (roomId: string) => (s: WallStore) =>
  s.stickies.filter((st) => st.roomId === roomId && !st.archived);

export type { HandFontId, StickyColorId, TapeStyle };
