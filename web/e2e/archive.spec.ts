import { test, expect, encrypt, world, seed, unlock, openNote, saved, hide, PHRASE, NOTE } from './fixtures';

test('create archive: mismatch, valid creation, empty state and relock', async ({ page }) => {
  await page.goto('./');
  await page.getByLabel('Passphrase', { exact: true }).fill(PHRASE);
  await page.getByLabel('Repeat passphrase').fill('different phrase');
  await page.getByRole('button', { name: 'Create private archive' }).click();
  await expect(page.getByRole('alert')).toContainText('do not match');
  await page.getByLabel('Repeat passphrase').fill(PHRASE);
  await page.getByRole('button', { name: 'Create private archive' }).click();
  await expect(page.getByLabel('What is on your mind?')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Keep it', exact: true })).toBeDisabled();
  await hide(page);
  await page.getByLabel('Passphrase', { exact: true }).fill('incorrect');
  await page.getByRole('button', { name: 'Unlock archive' }).click();
  await expect(page.getByRole('alert')).toContainText('incorrect');
  await unlock(page);
});

test('malformed backup does not overwrite an existing archive', async ({ page, seedEnvelope }) => {
  await seed(page, seedEnvelope);
  await page.getByLabel('Choose an encrypted backup').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{broken') });
  await expect(page.getByRole('alert')).toBeVisible();
  await unlock(page);
  await openNote(page);
  await expect(page.getByLabel('Your thought')).toHaveValue(NOTE);
});

test('rooms: create, rename, cancel rename and search empty result', async ({ authedPage: page }) => {
  await page.getByRole('link', { name: 'Create a new room' }).click();
  await page.getByLabel('Room name').fill('月の部屋');
  await page.getByRole('button', { name: 'Hang it up' }).click();
  await page.getByTitle('Rename room').click();
  await page.getByLabel('Room name').fill('discarded');
  await page.getByLabel('Room name').press('Escape');
  await expect(page.getByRole('button', { name: '月の部屋', exact: true })).toBeVisible();
  await page.getByTitle('Rename room').click();
  await page.getByLabel('Room name').fill('Renamed room');
  await page.getByLabel('Room name').press('Enter');
  await page.getByRole('link', { name: '← Lobby' }).click();
  await page.getByLabel('Search rooms').fill('no-matching-room');
  await expect(page.getByRole('link', { name: 'Open Renamed room', exact: true })).toHaveCount(0);
  await page.getByLabel('Search rooms').fill('Renamed');
  await expect(page.getByRole('link', { name: 'Open Renamed room', exact: true })).toBeVisible();
});

test('composer revalidates a cleared draft at final Keep', async ({ authedPage: page }) => {
  await page.getByLabel('What is on your mind?').fill('temporary');
  await page.getByRole('button', { name: 'Keep it', exact: true }).click();
  await page.getByLabel('What is on your mind?').fill('');
  await page.getByRole('button', { name: 'Keep this thought' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Write a thought' })).toBeVisible();
  await expect(page.getByRole('link', { name: /^Open / })).toHaveCount(1);
});

test('editing multilingual text and rapid changes survives reload', async ({ authedPage: page }) => {
  await openNote(page);
  const writing = page.getByLabel('Your thought');
  for (const text of ['  keep spaces  ', '日本語 العربية தமிழ் 👩🏽‍💻', '<script>window.bad=true</script>', 'x'.repeat(10000)]) {
    await writing.fill(text);
    await saved(page);
    await expect(writing).toHaveValue(text);
  }
  await writing.fill('Last write: ');
  await writing.pressSequentially('the final private thought');
  await saved(page);
  await page.reload();
  await page.getByLabel('Passphrase', { exact: true }).fill(PHRASE);
  await page.getByRole('button', { name: 'Unlock archive' }).click();
  await page.getByTestId('note-n0').getByRole('button', { name: /^Open note from/ }).click();
  await expect(writing).toHaveValue('Last write: the final private thought');
  expect(await page.evaluate(() => (window as unknown as { bad?: boolean }).bad)).toBeUndefined();
});

test('note release: cancellation preserves it, confirmation removes it', async ({ authedPage: page }) => {
  await page.getByRole('link', { name: 'Open Test room 0', exact: true }).click();
  await page.getByTestId('note-n0').getByRole('button', { name: 'Let this note go' }).click();
  await page.getByRole('dialog', { name: 'Let this go?' }).getByRole('button', { name: 'Keep it' }).click();
  await expect(page.getByTestId('note-n0')).toBeVisible();
  await page.getByTestId('note-n0').getByRole('button', { name: 'Let this note go' }).click();
  await page.getByRole('dialog', { name: 'Let this go?' }).getByRole('button', { name: 'Let it go' }).click();
  await expect(page.getByTestId('note-n0')).toHaveCount(0);
});

test('500-room limit rejects creation and still reloads', async ({ page }) => {
  await seed(page, await encrypt(world(500, 0))); await unlock(page);
  await page.getByRole('link', { name: 'Create a new room' }).click();
  await page.getByLabel('Room name').fill('Room 501');
  await page.getByRole('button', { name: 'Hang it up' }).click();
  await expect(page.getByRole('alert')).toContainText('500-room limit');
  await page.goto('./'); await page.reload(); await unlock(page);
  await expect(page.getByRole('link', { name: /^Open Test room / })).toHaveCount(500);
});

test('hide cancels pending unlock and requires another unlock', async ({ page, seedEnvelope }) => {
  await seed(page, seedEnvelope);
  await page.evaluate(() => {
    const original = crypto.subtle.decrypt.bind(crypto.subtle);
    crypto.subtle.decrypt = async (...args: Parameters<SubtleCrypto['decrypt']>) => { await new Promise(r => setTimeout(r, 1000)); return original(...args); };
  });
  await page.getByLabel('Passphrase', { exact: true }).fill(PHRASE);
  await page.getByRole('button', { name: 'Unlock archive' }).click();
  await page.getByRole('button', { name: 'Help & guide' }).click();
  await page.getByRole('button', { name: 'Hide screen', exact: true }).click();
  await page.getByRole('button', { name: 'Return', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Unlock archive', exact: true })).toBeVisible();
  await expect(page.getByLabel('What is on your mind?')).toHaveCount(0);
  await unlock(page);
});

test('quota failure: Hide conceals draft, export and retry recover it', async ({ authedPage: page }, info) => {
  await openNote(page);
  await page.evaluate(() => {
    const original = IDBDatabase.prototype.transaction;
    (window as unknown as { restoreStorage: () => void }).restoreStorage = () => { IDBDatabase.prototype.transaction = original; };
    IDBDatabase.prototype.transaction = function (...args: Parameters<IDBDatabase['transaction']>) {
      if (args[1] === 'readwrite') throw new DOMException('Storage full', 'QuotaExceededError');
      return original.apply(this, args);
    };
  });
  await page.getByLabel('Your thought').fill('Unsaved synthetic recovery marker');
  await expect(page.getByText('Not saved — retry or export', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Hide screen', exact: true }).last().click();
  await page.getByRole('button', { name: 'Return', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your notes are concealed' })).toBeVisible();
  await expect(page.getByText('Unsaved synthetic recovery marker', { exact: true })).toHaveCount(0);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export encrypted backup' }).click();
  await (await download).saveAs(info.outputPath('recovery.encrypted.json'));
  await page.evaluate(() => (window as unknown as { restoreStorage: () => void }).restoreStorage());
  await page.getByRole('button', { name: 'Retry saving and lock' }).click();
  await unlock(page); await openNote(page);
  await expect(page.getByLabel('Your thought')).toHaveValue('Unsaved synthetic recovery marker');
});

test('another tab cannot unlock until the writer hides', async ({ authedPage: page, context }) => {
  const second = await context.newPage(); await second.goto('./');
  await second.getByLabel('Passphrase', { exact: true }).fill(PHRASE);
  await second.getByRole('button', { name: 'Unlock archive' }).click();
  await expect(second.getByRole('alert')).toContainText('another tab');
  await hide(page); await unlock(second);
});

test('backup restore and changed passphrase preserve notes', async ({ authedPage: page }, info) => {
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export encrypted backup' }).click();
  const path = info.outputPath('backup.encrypted.json'); await (await download).saveAs(path);
  await page.getByRole('button', { name: 'Change passphrase', exact: true }).click();
  await page.getByLabel('New passphrase', { exact: true }).fill('replacement synthetic phrase');
  await page.getByLabel('Repeat new passphrase').fill('replacement synthetic phrase');
  await page.getByRole('button', { name: 'Save new passphrase' }).click();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await hide(page);
  await page.getByLabel('Passphrase', { exact: true }).fill(PHRASE);
  await page.getByRole('button', { name: 'Unlock archive' }).click();
  await expect(page.getByRole('alert')).toContainText('incorrect');
  page.on('dialog', d => d.accept());
  await page.getByLabel('Choose an encrypted backup').setInputFiles(path);
  await page.getByRole('button', { name: 'Restore backup' }).click();
  await openNote(page); await expect(page.getByLabel('Your thought')).toHaveValue(NOTE);
});

test('confirmed start-fresh requires backup and leaves the old backup restorable', async ({ page, seedEnvelope }, info) => {
  await seed(page, seedEnvelope);
  await page.getByRole('button', { name: 'Forgot passphrase?' }).click();
  await expect(page.getByRole('button', { name: 'Replace with empty archive' })).toHaveCount(0);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download old encrypted archive' }).click();
  const path = info.outputPath('old.encrypted.json'); await (await download).saveAs(path);
  await page.getByLabel('New passphrase', { exact: true }).fill('fresh synthetic archive');
  await page.getByLabel('Repeat new passphrase').fill('fresh synthetic archive');
  await expect(page.getByRole('button', { name: 'Replace with empty archive' })).toBeDisabled();
  await page.getByLabel('Type START FRESH', { exact: false }).fill('START FRESH');
  await page.getByRole('button', { name: 'Replace with empty archive' }).click();
  await expect(page.getByLabel('What is on your mind?')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Test room 0', exact: true })).toHaveCount(0);
  await hide(page); page.on('dialog', dialog => dialog.accept());
  await page.getByLabel('Choose an encrypted backup').setInputFiles(path);
  await page.getByLabel('Passphrase', { exact: true }).fill(PHRASE);
  await page.getByRole('button', { name: 'Restore backup' }).click();
  await openNote(page); await expect(page.getByLabel('Your thought')).toHaveValue(NOTE);
});

test('room deletion requires confirmation and removes its notes', async ({ authedPage: page }) => {
  await page.getByRole('button', { name: 'Let Test room 0 go', exact: true }).click();
  await page.getByRole('dialog', { name: 'Let this go?' }).getByRole('button', { name: 'Keep it' }).click();
  await expect(page.getByRole('link', { name: 'Open Test room 0', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Let Test room 0 go', exact: true }).click();
  await page.getByRole('dialog', { name: 'Let this go?' }).getByRole('button', { name: 'Let it go' }).click();
  await expect(page.getByRole('link', { name: 'Open Test room 0', exact: true })).toHaveCount(0);
  await saved(page); await page.reload(); await unlock(page);
  await expect(page.getByRole('link', { name: 'Open Test room 0', exact: true })).toHaveCount(0);
});
