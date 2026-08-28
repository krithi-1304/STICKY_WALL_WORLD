/**
 * Black Wall — domain model (S0 → S1 ready).
 * Keep these shapes stable; they map 1:1 to future DB tables.
 */

export type TapeStyle = 'plain' | 'dots' | 'diagonal' | 'grid' | 'hearts' | 'stars' | 'checker' | 'confetti';

export type WallTint = 'none' | 'charcoal' | 'ash' | 'midnight';

/** Handwriting faces — soft, rounded, a little playful. */
export const HAND_FONTS = [
  { id: 'caveat', label: 'Caveat', stack: "'Caveat', cursive", size: '1.4rem' },
  { id: 'gaegu', label: 'Gaegu', stack: "'Gaegu', cursive", size: '1.3rem' },
  { id: 'delius', label: 'Delius', stack: "'Delius', cursive", size: '1rem' },
  { id: 'shantell', label: 'Shantell', stack: "'Shantell Sans', cursive", size: '1.05rem' },
  { id: 'indie', label: 'Indie', stack: "'Indie Flower', cursive", size: '1.15rem' },
  { id: 'nanum', label: 'Nanum', stack: "'Nanum Pen Script', cursive", size: '1.5rem' },
  { id: 'zeyada', label: 'Zeyada', stack: "'Zeyada', cursive", size: '1.25rem' },
] as const;

export type HandFontId = (typeof HAND_FONTS)[number]['id'];

/** Paper colors — warmer, softer, more of them. */
export const STICKY_COLORS = [
  { id: 'butter', label: 'Butter', paper: '#f6e7a9', ink: '#4a3d1a' },
  { id: 'blush', label: 'Blush', paper: '#f7cdd3', ink: '#5a2f35' },
  { id: 'peach', label: 'Peach', paper: '#fbd9b8', ink: '#5c3c20' },
  { id: 'mint', label: 'Mint', paper: '#c8e8d4', ink: '#1e4a30' },
  { id: 'sage', label: 'Sage', paper: '#d3dcb4', ink: '#37401f' },
  { id: 'sky', label: 'Sky', paper: '#c4dcf2', ink: '#1f3a52' },
  { id: 'lilac', label: 'Lilac', paper: '#e0d2f2', ink: '#3c2c52' },
  { id: 'rose', label: 'Rose', paper: '#f2c4e0', ink: '#57204a' },
  { id: 'cream', label: 'Cream', paper: '#f5efdd', ink: '#4a4130' },
  { id: 'mist', label: 'Mist', paper: '#dcd8cf', ink: '#3a3630' },
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
  /** Tape rotation in degrees, ±4. Set once at creation. */
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
  /** Handwriting face for all notes in this room. */
  fontId: HandFontId;
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
  minRotation: -13,
  maxRotation: 13,
  minSize: 168,
  maxSize: 252,
} as const;
