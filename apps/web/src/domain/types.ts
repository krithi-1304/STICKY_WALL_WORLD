/**
 * Black Wall — domain model (S0 → S1 ready).
 * Keep these shapes stable; they map 1:1 to future DB tables.
 */

export type TapeStyle = 'washi' | 'clear' | 'masking';

export type WallTint = 'none' | 'charcoal' | 'ash' | 'midnight';

/** Paper colors allowed on the wall (constraint that creates beauty). */
export const STICKY_COLORS = [
  { id: 'butter', label: 'Butter', paper: '#f2e3a3', ink: '#3d3320' },
  { id: 'blush', label: 'Blush', paper: '#f0c6c6', ink: '#4a2b2b' },
  { id: 'sage', label: 'Sage', paper: '#c9d6b8', ink: '#2e3a24' },
  { id: 'sky', label: 'Sky', paper: '#c0d4e8', ink: '#24313d' },
  { id: 'lilac', label: 'Lilac', paper: '#d8cbe8', ink: '#352b44' },
  { id: 'mist', label: 'Mist', paper: '#d8d4cc', ink: '#3a3733' },
] as const;

export type StickyColorId = (typeof STICKY_COLORS)[number]['id'];

export interface Sticky {
  id: string;
  roomId: string;
  /** Position on the wall, in wall coordinates (px from wall origin). */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Degrees, clamped ±8. */
  rotation: number;
  zIndex: number;
  color: StickyColorId;
  tape: TapeStyle;
  /** Tape rotation in degrees, ±3. Set once at creation. */
  tapeTilt: number;
  body: string;
  pinned: boolean;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Room {
  id: string;
  slug: string;
  name: string;
  /** Short symbol shown on the hanging tag, e.g. "✷". */
  symbol: string;
  accent: string | null;
  wallTint: WallTint;
  createdAt: number;
  updatedAt: number;
}

/** Shape the wall store works against — one room with its notes. */
export interface WallState {
  room: Room;
  stickies: Sticky[];
}

export const STICKY_LIMITS = {
  maxBodyLength: 500,
  maxStickiesPerRoom: 200,
  minRotation: -8,
  maxRotation: 8,
  defaultW: 200,
  defaultH: 200,
} as const;
