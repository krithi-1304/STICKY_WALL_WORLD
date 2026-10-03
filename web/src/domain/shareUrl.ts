/** Local previews share through the public archive; hosted copies use their own base. */
export const PUBLIC_ARCHIVE_URL = 'https://krithi-1304.github.io/STICKY_WALL_WORLD/';
export function sharedEntryUrl(origin = location.origin, base = import.meta.env.BASE_URL) {
  const host = new URL(origin).hostname;
  const local = host === 'localhost' || host.endsWith('.localhost') || host === '127.0.0.1' || host === '[::1]' || host === '0.0.0.0';
  return new URL('shared/', local ? PUBLIC_ARCHIVE_URL : new URL(base, origin)).href;
}
