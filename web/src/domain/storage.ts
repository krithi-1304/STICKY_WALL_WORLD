import { ARCHIVE_LIMITS } from './types';
import { parsePrivate } from './privateContent';
import { create } from 'zustand';
import type { Room, Sticky, Attachment } from './types';
export interface World { rooms: Room[]; stickies: Sticky[] }
export interface Envelope { format: 'black-wall'; version: 2; salt: string; iv: string; ciphertext: string }
export const useStorage = create<{ status: 'locked' | 'saved' | 'saving' | 'error'; error: string }>(() => ({ status: 'locked', error: '' }));
const LEGACY = 'black-wall:v1';
const encoder = new TextEncoder();
let key: CryptoKey | null = null;
let salt = '';
let pending: string | null = null;
let writing: Promise<void> | null = null;
let changingPassphrase: Promise<void> | null = null;
let legacyError = '';
let releaseWriter: (() => void) | null = null;
let acquiring: Promise<void> | null = null;
async function acquireWriter() {
  if (releaseWriter) return;
  if (!navigator.locks) throw new Error('This browser cannot safely coordinate private storage. Use a current browser with Web Locks support.');
  if (!acquiring) acquiring = new Promise<void>((resolve, reject) => {
    void navigator.locks.request('black-wall-private-writer', { ifAvailable: true }, lock => {
      if (!lock) { reject(new Error('Your archive is open in another tab. Hide or close it there before unlocking here.')); return; }
      return new Promise<void>(release => { releaseWriter = release; resolve(); });
    }).catch(reject);
  });
  try { await acquiring; } finally { acquiring = null; }
}
function releaseWriteLock() { releaseWriter?.(); releaseWriter = null; }
// Track entry work so Hide cannot release a key before a late unlock installs it.
const entryOperations = new Set<Promise<unknown>>();
function trackEntry<T>(operation: () => Promise<T>): Promise<T> {
  const task = operation();
  entryOperations.add(task);
  void task.then(() => entryOperations.delete(task), () => entryOperations.delete(task));
  return task;
}
export const MEDIA_TYPES = ['image/jpeg','image/png','image/webp','audio/mpeg','audio/wav','audio/ogg','audio/webm','video/mp4','video/webm'] as const;
function to64(bytes: Uint8Array): string {
  let result = '';
  for (let i = 0; i < bytes.length; i += 8192) result += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(result);
}
function from64(value: string): Uint8Array<ArrayBuffer> { return Uint8Array.from(atob(value), c => c.charCodeAt(0)); }
function invalid(): never { throw new Error('This archive is damaged or uses an unsupported format. Your existing archive has not been replaced.'); }
function record(value: unknown): Record<string, unknown> { if (!value || typeof value !== 'object' || Array.isArray(value)) invalid(); return value as Record<string, unknown>; }
function str(value: unknown, max: number): string { if (typeof value !== 'string' || value.length > max) invalid(); return value; }
function num(value: unknown, fallback = 0): number { return typeof value === 'number' && Number.isFinite(value) ? Math.max(-1000000, Math.min(1e15, value)) : fallback; }
export function validateWorld(value: unknown, allowExistingOverCapacity = false): World {
  const v = record(value);
  if (!Array.isArray(v.rooms) || !Array.isArray(v.stickies) || (!allowExistingOverCapacity && (v.rooms.length > ARCHIVE_LIMITS.rooms || v.stickies.length > ARCHIVE_LIMITS.notes))) invalid();
  const ids = new Set<string>(); const slugs = new Set<string>();
  const rooms: Room[] = v.rooms.map(value => {
    const r = record(value); const id = str(r.id, 100); const slug = str(r.slug, 150);
    if (!id || !slug || ids.has(id) || slugs.has(slug) || !/^[\p{L}\p{N}_-]+$/u.test(slug)) invalid();
    ids.add(id); slugs.add(slug);
    const locked=r.locked?parsePrivate(r.locked):undefined;
    return { id, slug, locked, fallingLetters: r.fallingLetters !== false, name: locked ? 'Locked room' : str(r.name, 120), symbol: locked ? '♡' : str(r.symbol ?? '✧', 20), accent: null, wallTint: 'none', fontId: 'caveat', createdAt: num(r.createdAt), updatedAt: num(r.updatedAt) };
  });
  const lockedRooms=new Set(rooms.filter(r=>r.locked).map(r=>r.id));
  const noteIds = new Set<string>();
  const stickies: Sticky[] = v.stickies.map(value => {
    const s = record(value); const id = str(s.id, 100); const roomId = str(s.roomId, 100);
    if (!id || noteIds.has(id) || (!ids.has(roomId)||lockedRooms.has(roomId))) invalid(); noteIds.add(id);
    const locked=s.locked?parsePrivate(s.locked):undefined;if(locked){if(s.body||Array.isArray(s.attachments)&&s.attachments.length)invalid();}
    if (s.attachments !== undefined && (!Array.isArray(s.attachments) || s.attachments.length > 3)) invalid();
    const attachments: Attachment[] = ((s.attachments ?? []) as unknown[]).map(value => {
      const a = record(value); const type = str(a.type, 30) as Attachment['type'];
      if (!MEDIA_TYPES.includes(type)) invalid();
      const data = str(a.data, Number.MAX_SAFE_INTEGER); const prefix = `data:${type};base64,`;
      if (!data.startsWith(prefix)) invalid();
      const encoded=data.slice(prefix.length);
      const padding=encoded.endsWith('==')?2:encoded.endsWith('=')?1:0;
      if(!encoded.length||encoded.length%4!==0||/[^A-Za-z0-9+/]/.test(encoded.slice(0,encoded.length-padding)))invalid();
      const bytes=encoded.length/4*3-padding;
      const duration = num(a.duration, -1);
      if (duration < 0) invalid();
      return { id: str(a.id, 100), name: str(a.name, 180), type, data, bytes, duration };
    });
    return { id, roomId, locked, body: str(s.body, 10000), x: num(s.x), y: num(s.y), w: Math.max(168, Math.min(280, num(s.w, 220))), h: Math.max(168, Math.min(280, num(s.h, 220))), rotation: Math.max(-4, Math.min(4, num(s.rotation))), zIndex: num(s.zIndex, 1), color: ['rose','sage','cream'].includes(String(s.color)) ? s.color as Sticky['color'] : 'cream', tape: 'plain', tapeTilt: num(s.tapeTilt), pinned: !!s.pinned, archived: !!s.archived, createdAt: num(s.createdAt), updatedAt: num(s.updatedAt), offsetX: num(s.offsetX), offsetY: num(s.offsetY), attachments };
  });
  return { rooms, stickies };
}
export function loadWorld(): World {
  try { const raw = localStorage.getItem(LEGACY); return raw ? validateWorld(JSON.parse(raw)) : { rooms: [], stickies: [] }; }
  catch { legacyError = 'Existing browser notes could not be read. They have not been removed. Restore a backup or recover the existing data before continuing.'; return { rooms: [], stickies: [] }; }
}
let database: Promise<IDBDatabase> | undefined;
function db() {
  database ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('black-wall-private', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('vault');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => { database = undefined; reject(new Error('Browser storage is unavailable. Nothing has been overwritten.')); };
    request.onblocked = () => reject(new Error('Close other Black Wall tabs and try again.'));
  }); return database;
}
export async function readEnvelope(): Promise<Envelope | null> {
  const database = await db();
  return new Promise((resolve, reject) => {
    const request = database.transaction('vault').objectStore('vault').get('world');
    request.onsuccess = () => resolve(request.result ?? null); request.onerror = () => reject(request.error);
  });
}
async function writeEnvelope(envelope: Envelope) {
  const database = await db();
  await new Promise<void>((resolve, reject) => {
    const tx = database.transaction('vault', 'readwrite'); tx.objectStore('vault').put(envelope, 'world');
    tx.oncomplete = () => resolve(); tx.onerror = tx.onabort = () => reject(new Error('Could not save to this browser. Free device space, then retry or export a backup before leaving.'));
  });
}
async function derive(passphrase: string, saltText: string) {
  const material = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: from64(saltText), iterations: 310000, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function seal(text: string, withKey = key!, withSalt = salt): Promise<Envelope> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: encoder.encode('black-wall:v2') }, withKey, encoder.encode(text));
  return { format: 'black-wall', version: 2, salt: withSalt, iv: to64(iv), ciphertext: to64(new Uint8Array(ciphertext)) };
}
export function parseEnvelope(text: string): Envelope {
  const v = record(JSON.parse(text));
  if (v.format !== 'black-wall' || v.version !== 2 || typeof v.salt !== 'string' || typeof v.iv !== 'string' || typeof v.ciphertext !== 'string') invalid();
  if (from64(v.salt).length !== 16 || from64(v.iv).length !== 12) invalid();
  return v as unknown as Envelope;
}
async function decryptWorld(passphrase: string, envelope: Envelope) {
  const validated = parseEnvelope(JSON.stringify(envelope)); const candidate = await derive(passphrase, validated.salt);
  let plaintext: ArrayBuffer;
  try { plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: from64(validated.iv), additionalData: encoder.encode('black-wall:v2') }, candidate, from64(validated.ciphertext)); }
  catch { throw new Error('The passphrase is incorrect, or this backup is damaged. Your saved archive is unchanged.'); }
  const world = validateWorld(JSON.parse(new TextDecoder().decode(plaintext)), true);
  return { world, candidate, validated };
}
async function openVaultOperation(passphrase: string): Promise<World> {
  await acquireWriter();
  try {
    // Read only after owning the writer lock: a waiting tab's cached envelope
    // can predate another tab's latest save or restored backup.
    const envelope = await readEnvelope();
    if (!envelope) throw new Error('No saved archive was found. Reload this page to create or restore one.');
    const { world, candidate, validated } = await decryptWorld(passphrase, envelope);
    key = candidate; salt = validated.salt;
    useStorage.setState({ status: 'saved', error: '' });
    return world;
  } catch (error) { releaseWriteLock(); throw error; }
}
async function createVaultOperation(passphrase: string, world: World) {
  if (legacyError) throw new Error(legacyError);
  if (passphrase.length < 12) throw new Error('Use at least 12 characters for your passphrase.');
  const newSalt = to64(crypto.getRandomValues(new Uint8Array(16))); const candidate = await derive(passphrase, newSalt);
  const envelope = await seal(JSON.stringify(validateWorld(world)), candidate, newSalt);
  await acquireWriter();
  try {
    if (await readEnvelope()) throw new Error('An archive was created in another tab. Reload this page to unlock it.');
    await writeEnvelope(envelope);
  } catch (error) { releaseWriteLock(); throw error; }
  key = candidate; salt = newSalt; localStorage.removeItem(LEGACY);
  useStorage.setState({ status: 'saved', error: '' });
}
async function restoreVaultOperation(passphrase: string, envelope: Envelope, allowReplace = false) {
  const { world, candidate, validated } = await decryptWorld(passphrase, envelope);
  await acquireWriter();
  try {
    if (!allowReplace && await readEnvelope()) throw new Error('An archive appeared in another tab. Reload and confirm before replacing it with a backup.');
    await writeEnvelope(validated);
  }
  catch (error) { if (!key) releaseWriteLock(); throw error; }
  key = candidate; salt = validated.salt; legacyError = '';
  localStorage.removeItem(LEGACY);
  useStorage.setState({ status: 'saved', error: '' });
  return world;
}
export function saveWorld(world: World): void {
  if (!key) { useStorage.setState({ status: 'error', error: 'The archive is locked. Unlock before saving.' }); return; }
  pending = JSON.stringify(validateWorld(world, true)); useStorage.setState({ status: 'saving', error: '' }); if (writing || changingPassphrase) return;
  writing = (async () => {
    try { while (pending !== null) { const snapshot = pending; pending = null; await writeEnvelope(await seal(snapshot)); } useStorage.setState({ status: 'saved', error: '' }); }
    catch (error) { useStorage.setState({ status: 'error', error: error instanceof Error ? error.message : 'Saving failed. Export a backup before leaving.' }); }
    finally { writing = null; }
  })();
}
export async function flushWorld() { await writing; if (useStorage.getState().status === 'error') throw new Error(useStorage.getState().error); }
export async function exportVault(world: World) {
  if (!key) throw new Error('Unlock the archive first.');
  const envelope = await seal(JSON.stringify(validateWorld(world, true)));
  downloadEnvelope(envelope);
}
function downloadEnvelope(envelope: Envelope) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(envelope)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = `black-wall-${new Date().toISOString().slice(0,10)}.encrypted.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function forgetKey() { await Promise.allSettled([...entryOperations]); await changingPassphrase; await flushWorld(); key = null; salt = ''; pending = null; releaseWriteLock(); useStorage.setState({ status: 'locked' }); }


/** An unlocked archive can be re-encrypted without knowing the previous passphrase. */
export async function changePassphrase(passphrase: string, currentWorld: () => World) {
  if (!key) throw new Error('Unlock the archive before changing its passphrase.');
  if (passphrase.length < 12 || passphrase.length > 200) throw new Error('Use between 12 and 200 characters for your new passphrase.');
  if (changingPassphrase) throw new Error('A passphrase change is already in progress.');
  useStorage.setState({ status: 'saving', error: '' });
  changingPassphrase = (async () => {
    await writing;
    const newSalt = to64(crypto.getRandomValues(new Uint8Array(16)));
    const candidate = await derive(passphrase, newSalt);
    const snapshot = JSON.stringify(validateWorld(currentWorld(), true));
    // This snapshot includes edits queued while the new key was being derived.
    pending = null;
    await writeEnvelope(await seal(snapshot, candidate, newSalt));
    key = candidate; salt = newSalt;
    useStorage.setState({ status: pending === null ? 'saved' : 'saving', error: '' });
  })();
  try { await changingPassphrase; }
  catch (error) { useStorage.setState({ status: 'error', error: 'The passphrase was not changed. Retry or export your notes before leaving.' }); throw error; }
  finally {
    changingPassphrase = null;
    // Edits arriving during encryption are written with whichever key committed.
    if (pending !== null) saveWorld(JSON.parse(pending));
  }
}

export async function exportLockedVault(): Promise<Envelope> {
  const envelope = await readEnvelope();
  if (!envelope) throw new Error('No saved archive was found.');
  downloadEnvelope(envelope);
  return envelope;
}

/** Only the explicit start-over form calls this. No attempt is made to decrypt old notes. */
async function startFreshVaultOperation(passphrase: string, exported: Envelope) {
  if (key) throw new Error('Your archive is unlocked. Change its passphrase to keep your notes instead.');
  if (passphrase.length < 12 || passphrase.length > 200) throw new Error('Use between 12 and 200 characters for your new passphrase.');
  await acquireWriter();
  try {
    const current = await readEnvelope();
    if (!current || JSON.stringify(current) !== JSON.stringify(exported)) throw new Error('The archive changed in another tab. Download its latest encrypted copy before starting over.');
    const newSalt = to64(crypto.getRandomValues(new Uint8Array(16)));
    const candidate = await derive(passphrase, newSalt);
    await writeEnvelope(await seal(JSON.stringify({ rooms: [], stickies: [] }), candidate, newSalt));
    key = candidate; salt = newSalt; pending = null;
    useStorage.setState({ status: 'saved', error: '' });
  } catch (error) { releaseWriteLock(); throw error; }
}

export const openVault = (passphrase: string) => trackEntry(() => openVaultOperation(passphrase));
export const createVault = (passphrase: string, world: World) => trackEntry(() => createVaultOperation(passphrase, world));
export const restoreVault = (passphrase: string, envelope: Envelope, allowReplace = false) => trackEntry(() => restoreVaultOperation(passphrase, envelope, allowReplace));
export const startFreshVault = (passphrase: string, exported: Envelope) => trackEntry(() => startFreshVaultOperation(passphrase, exported));
