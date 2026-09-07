import type { Room } from './types';

/**
 * Ranked local search for the lobby: exact > prefix > word start > substring
 * > ordered character match. Room count is small, so this stays instant and
 * avoids a search dependency.
 */
export function searchRooms(rooms: Room[], query: string): Room[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return rooms;

  return rooms
    .map((room) => ({ room, score: scoreRoom(room, needle) }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || b.room.updatedAt - a.room.updatedAt)
    .map((result) => result.room);
}

function scoreRoom(room: Room, needle: string): number {
  const name = room.name.toLowerCase();
  if (name === needle) return 1000;
  if (name.startsWith(needle)) return 800 - needle.length;

  const words = name.split(/\s+/);
  if (words.some((word) => word.startsWith(needle))) return 600 - needle.length;

  const index = name.indexOf(needle);
  if (index >= 0) return 400 - index;
  if (isSubsequence(needle, name)) return 100;
  return 0;
}

function isSubsequence(needle: string, value: string): boolean {
  let cursor = 0;
  for (const character of value) {
    if (character === needle[cursor]) cursor += 1;
    if (cursor === needle.length) return true;
  }
  return false;
}
