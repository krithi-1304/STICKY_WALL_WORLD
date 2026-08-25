import { create } from 'zustand';
import { loadWorld, saveWorld } from '../domain/storage';
import { slugify, uniqueSlug } from '../domain/slug';
import { STICKY_LIMITS } from '../domain/types';
import type { Room, Sticky, StickyColorId, TapeStyle } from '../domain/types';

interface WallStore {
  rooms: Room[];
  stickies: Sticky[];
  // Rooms
  createRoom: (input: { name: string; symbol: string }) => Room;
  deleteRoom: (roomId: string) => void;
  // Stickies
  addSticky: (roomId: string, at: { x: number; y: number }) => Sticky | null;
  updateSticky: (id: string, patch: Partial<Sticky>) => void;
  deleteSticky: (id: string) => void;
}

const persisted = loadWorld();

const uid = () => crypto.randomUUID();
const now = () => Date.now();
const clampRotation = (deg: number) =>
  Math.max(STICKY_LIMITS.minRotation, Math.min(STICKY_LIMITS.maxRotation, deg));

function pickColor(existing: Sticky[]): StickyColorId {
  // Cycle colors so a wall naturally varies.
  const palette: StickyColorId[] = ['butter', 'blush', 'sage', 'sky', 'lilac', 'mist'];
  return palette[existing.length % palette.length] as StickyColorId;
}

function nextZ(stickies: Sticky[]): number {
  return stickies.reduce((max, s) => Math.max(max, s.zIndex), 0) + 1;
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

  deleteRoom: (roomId) =>
    set((s) => {
      const next = {
        rooms: s.rooms.filter((r) => r.id !== roomId),
        stickies: s.stickies.filter((st) => st.roomId !== roomId),
      };
      saveWorld(next);
      return next;
    }),

  addSticky: (roomId, at) => {
    const { stickies } = get();
    const inRoom = stickies.filter((s) => s.roomId === roomId && !s.archived);
    if (inRoom.length >= STICKY_LIMITS.maxStickiesPerRoom) return null;
    const sticky: Sticky = {
      id: uid(),
      roomId,
      x: at.x,
      y: at.y,
      w: STICKY_LIMITS.defaultW,
      h: STICKY_LIMITS.defaultH,
      rotation: clampRotation((Math.random() * 10 - 5) | 0),
      zIndex: nextZ(inRoom),
      color: pickColor(inRoom),
      tape: 'washi',
      tapeTilt: Math.round((Math.random() * 6 - 3) * 10) / 10,
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
        const next: Sticky = {
          ...st,
          ...patch,
          rotation:
            patch.rotation !== undefined
              ? clampRotation(patch.rotation)
              : st.rotation,
          updatedAt: now(),
        };
        return next;
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
}));

/** Selectors */
export const selectRoomBySlug = (slug: string) => (s: WallStore) =>
  s.rooms.find((r) => r.slug === slug);

export const selectStickiesForRoom = (roomId: string) => (s: WallStore) =>
  s.stickies.filter((st) => st.roomId === roomId && !st.archived);

export type { StickyColorId, TapeStyle };
