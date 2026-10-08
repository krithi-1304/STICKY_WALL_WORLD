import { test as base, expect, type Page } from '@playwright/test';
import { webcrypto } from 'node:crypto';

export const PHRASE = 'synthetic archive phrase only';
export const SHARED_PHRASE = 'synthetic shared phrase only';
export const NOTE = 'Synthetic private thought — 日本語 தமிழ் ♡';
export function world(roomCount = 1, noteCount = 1) {
  return {
    rooms: Array.from({ length: roomCount }, (_, i) => ({ id: `r${i}`, slug: `room-${i}`, name: `Test room ${i}`, symbol: '✧', createdAt: 1, updatedAt: 1 })),
    stickies: Array.from({ length: noteCount }, (_, i) => ({ id: `n${i}`, roomId: `r${Math.floor(i / 200)}`, body: i === 0 ? NOTE : `Thought ${i}`, createdAt: 1, updatedAt: 1 })),
  };
}
export async function encrypt(value: unknown, phrase = PHRASE, shared = false) {
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const material = await webcrypto.subtle.importKey('raw', new TextEncoder().encode(phrase), 'PBKDF2', false, ['deriveKey']);
  const key = await webcrypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const ciphertext = await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(shared ? 'black-wall:private-content:1' : 'black-wall:v2') }, key, new TextEncoder().encode(JSON.stringify(value)));
  const common = { salt: Buffer.from(salt).toString('base64'), iv: Buffer.from(iv).toString('base64') };
  return shared ? { ...common, format: 'black-wall-private-content', version: 1, data: Buffer.from(ciphertext).toString('base64'), mediaBytes: 0 } : { ...common, format: 'black-wall', version: 2, ciphertext: Buffer.from(ciphertext).toString('base64') };
}
export async function seed(page: Page, envelope: Awaited<ReturnType<typeof encrypt>>) {
  await page.goto('./');
  await page.evaluate(async envelope => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('black-wall-private', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('vault');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('vault', 'readwrite');
        tx.objectStore('vault').put(envelope, 'world');
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onabort = tx.onerror = () => { db.close(); reject(tx.error); };
      };
    });
  }, envelope);
  await page.reload();
}
export async function unlock(page: Page, phrase = PHRASE) {
  await page.getByLabel('Passphrase', { exact: true }).fill(phrase);
  await page.getByRole('button', { name: 'Unlock archive', exact: true }).click();
  await expect(page.getByLabel('What is on your mind?')).toBeVisible();
}
export async function openNote(page: Page) {
  await page.getByRole('link', { name: 'Open Test room 0', exact: true }).click();
  await page.getByTestId('note-n0').getByRole('button', { name: /^Open note from/ }).click();
  await expect(page.getByLabel('Your thought')).toBeVisible();
}
export async function saved(page: Page) {
  await expect(page.getByText('Saved encrypted on this device', { exact: true })).toBeVisible();
}
export async function hide(page: Page) {
  await page.getByRole('button', { name: 'Hide screen', exact: true }).last().click();
  await page.getByRole('button', { name: 'Return', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Unlock archive', exact: true })).toBeVisible();
}
export const test = base.extend<{ authedPage: Page; cleanConsole: void }, { seedEnvelope: Awaited<ReturnType<typeof encrypt>> }>({
  seedEnvelope: [async ({ browserName }, provide) => { void browserName; await provide(await encrypt(world())); }, { scope: 'worker' }],
  authedPage: async ({ page, seedEnvelope }, provide) => {
    await seed(page, seedEnvelope);
    await unlock(page);
    await provide(page);
    // Playwright destroys the isolated context, including IndexedDB, at teardown.
  },
  cleanConsole: [async ({ context }, provide, info) => {
    const errors: string[] = [];
    context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
    await provide();
    if (errors.length) await info.attach('uncaught-errors', { body: JSON.stringify(errors), contentType: 'application/json' });
    expect(errors).toEqual([]);
  }, { auto: true }],
});
export { expect };
