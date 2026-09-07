/**
 * Room identity — Pinterest-y symbols and pin colors.
 * Deterministic: same name → same symbol, same room → same pin color.
 * The room "owns" its symbol; it feels chosen, not random.
 */

/** Curated Pinterest-style elements for room tags. */
export const PIN_SYMBOLS = [
  '✷', '◈', '☾', '❋', '⌂', '✿', '◎', '☼',
  '❀', '✽', '✧', '⟡', '✺', '❁', '⌘', '❖',
] as const;

/** Pick a symbol from a room name — stable across sessions. */
export function symbolForName(name: string): string {
  const clean = name.trim().toLowerCase();
  if (!clean) return '✷';
  let h = 0;
  for (let i = 0; i < clean.length; i += 1) {
    h = (h * 31 + clean.charCodeAt(i)) >>> 0;
  }
  return PIN_SYMBOLS[h % PIN_SYMBOLS.length];
}

/** Board-pin colors — warm, saturated, they catch light. */
export const PIN_COLORS = [
  { id: 'coral', head: '#ff7a7a', deep: '#d94f4f', glow: 'rgba(255,122,122,0.5)' },
  { id: 'gold', head: '#ffd166', deep: '#e0a83a', glow: 'rgba(255,209,102,0.5)' },
  { id: 'mint', head: '#7ddf8a', deep: '#4aa85a', glow: 'rgba(125,223,138,0.5)' },
  { id: 'sky', head: '#6fb3ff', deep: '#3d7fd9', glow: 'rgba(111,179,255,0.5)' },
  { id: 'lilac', head: '#c29bff', deep: '#8f5fd9', glow: 'rgba(194,155,255,0.5)' },
  { id: 'rose', head: '#ff9fbe', deep: '#e06a8e', glow: 'rgba(255,159,190,0.5)' },
] as const;

export type PinColor = (typeof PIN_COLORS)[number];

/** Pick a pin color from a room id — stable, unique-ish per room. */
export function pinColorForRoom(roomId: string): PinColor {
  let h = 0;
  for (let i = 0; i < roomId.length; i += 1) {
    h = (h * 33 + roomId.charCodeAt(i)) >>> 0;
  }
  return PIN_COLORS[h % PIN_COLORS.length];
}
