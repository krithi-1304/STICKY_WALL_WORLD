import { test, expect, encrypt, world, openNote, NOTE, SHARED_PHRASE } from './fixtures';

async function openShare(page: import('@playwright/test').Page) {
  await page.getByLabel('Share passphrase').fill(SHARED_PHRASE);
  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await page.getByRole('button', { name: /Open your letter/ }).click();
}

test('recipient: missing invitation, wrong phrase, reveal, Close and refresh', async ({ page }) => {
  const envelope = await encrypt(world(), SHARED_PHRASE, true);
  await page.goto('shared/');
  await expect(page.getByRole('button', { name: 'Open', exact: true })).toBeDisabled();
  await page.goto(`shared/#${encodeURIComponent(JSON.stringify(envelope))}`);
  await expect(page.getByLabel('Share passphrase')).toBeEnabled();
  await page.getByLabel('Share passphrase').fill('wrong phrase');
  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Not quite');
  await openShare(page);
  await expect(page.getByRole('heading', { name: 'Test room 0' })).toBeVisible();
  await expect(page.getByText(NOTE, { exact: true }).first()).toBeAttached();
  expect(new URL(page.url()).hash).toBe('');
  await page.getByRole('button', { name: 'Close the room' }).click();
  await expect(page.getByText(NOTE, { exact: true })).toHaveCount(0);
  await page.reload(); await expect(page.getByRole('button', { name: 'Open', exact: true })).toBeDisabled();
});

test('recipient: corrupt file recovery, empty room and no persistence', async ({ page }) => {
  await page.goto('shared/');
  await page.getByLabel('Open shared file').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{}') });
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByLabel('Open shared file').setInputFiles({ name: 'empty.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(await encrypt(world(1, 0), SHARED_PHRASE, true))) });
  await page.getByLabel('Share passphrase').fill(SHARED_PHRASE);
  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A little room to breathe' })).toBeVisible();
  expect(await page.evaluate(async () => (await indexedDB.databases()).length)).toBe(0);
});

test('note lock: wrong phrase, temporary view, close remains locked', async ({ authedPage: page }) => {
  await openNote(page);
  await page.getByRole('button', { name: 'Lock note', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Lock item', exact: true });
  await dialog.getByLabel('New item passphrase', { exact: true }).fill(SHARED_PHRASE);
  await dialog.getByLabel('Repeat passphrase').fill(SHARED_PHRASE);
  await dialog.getByRole('button', { name: 'Lock item', exact: true }).click();
  await page.getByRole('button', { name: 'Unlock note', exact: true }).click();
  const peek = page.getByRole('dialog', { name: 'Unlock item', exact: true });
  await peek.getByLabel('Item passphrase', { exact: true }).fill('wrong');
  await peek.getByRole('button', { name: 'Unlock item', exact: true }).click();
  await expect(peek.getByRole('alert')).toContainText('Incorrect');
  await peek.getByLabel('Item passphrase', { exact: true }).fill(SHARED_PHRASE);
  await peek.getByRole('button', { name: 'Unlock item', exact: true }).click();
  await expect(peek.getByRole('region', { name: 'Private view' })).toContainText(NOTE);
  await peek.getByRole('button', { name: 'Close and keep locked' }).click();
  await expect(page.getByRole('button', { name: 'Unlock note', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Share room', exact: true }).click();
  const share = page.getByRole('dialog', { name: 'Share privately' });
  await expect(share).toContainText('0 note(s)');
  await share.getByLabel('Share passphrase', { exact: true }).fill(SHARED_PHRASE);
  await share.getByLabel('Repeat passphrase').fill(SHARED_PHRASE);
  await share.getByRole('button', { name: 'Prepare private share' }).click();
  await expect(share.getByRole('alert')).toContainText('no unlocked notes');
});

test('real share form produces a decryptable read-only invitation', async ({ authedPage: page, context, baseURL }) => {
  await page.getByRole('link', { name: 'Open Test room 0', exact: true }).click();
  await page.getByRole('button', { name: 'Share room', exact: true }).click();
  const share = page.getByRole('dialog', { name: 'Share privately' });
  await share.getByLabel('Share passphrase', { exact: true }).fill(SHARED_PHRASE);
  await share.getByLabel('Repeat passphrase').fill(SHARED_PHRASE);
  await share.getByRole('button', { name: 'Prepare private share' }).click();
  const url = await share.getByLabel('Protected share link').inputValue();
  expect(url).not.toContain(NOTE); expect(url).not.toContain(SHARED_PHRASE);
  const receiver = await context.newPage();
  await receiver.goto(new URL(`shared/${new URL(url).hash}`, baseURL).href);
  await openShare(receiver);
  await expect(receiver.getByText(NOTE, { exact: true }).first()).toBeAttached();
  await expect(receiver.getByLabel('Your thought')).toHaveCount(0);
});

test('media validation rejects corrupt uploads and accepts a real image', async ({ authedPage: page }) => {
  await openNote(page);
  const upload = page.locator('input[type=file]').last();
  await upload.setInputFiles({ name: 'bad.png', mimeType: 'image/png', buffer: Buffer.from('not a picture') });
  await expect(page.getByRole('alert')).toContainText('photo');
  await upload.setInputFiles({ name: 'tiny.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aC1cAAAAASUVORK5CYII=', 'base64') });
  await expect(page.getByRole('img', { name: 'tiny.png' })).toBeVisible();
});
