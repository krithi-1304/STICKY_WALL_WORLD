const { chromium } = require('../web/node_modules/playwright');
const assert = require('node:assert/strict');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
(async () => {
 const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {});
 try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  await page.goto(base);
  await page.getByLabel('Passphrase', { exact: true }).fill('public link test archive');
  await page.getByLabel('Repeat passphrase').fill('public link test archive');
  await page.getByRole('button', { name: 'Create private archive' }).click();
  await page.getByLabel('What is on your mind?').fill('Synthetic public-link round trip.');
  await page.getByRole('button', { name: 'Keep it', exact: true }).click();
  await page.getByRole('button', { name: 'Keep this thought' }).click();
  await page.getByRole('button', { name: 'Share room', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Share privately' });
  await dialog.getByLabel('Share passphrase', { exact: true }).fill('public link test phrase');
  await dialog.getByLabel('Repeat passphrase').fill('public link test phrase');
  await dialog.getByRole('button', { name: 'Prepare private share' }).click();
  const link = await dialog.getByLabel('Protected share link').inputValue();
  assert.ok(link.startsWith('https://krithi-1304.github.io/STICKY_WALL_WORLD/shared/#'));
  assert.ok(!link.includes('Synthetic') && !link.includes('public link test phrase'));
  const recipient = await browser.newPage({ reducedMotion: 'reduce' });
  const errors = []; recipient.on('pageerror', error => errors.push(error.message));
  assert.equal((await recipient.goto(link)).status(), 200);
  await recipient.getByLabel('Share passphrase', { exact: true }).fill('public link test phrase');
  await recipient.getByRole('button', { name: /^(Open|Open shared snapshot)$/ }).click();
  // Public version can precede the local design; encryption format remains compatible.
  await recipient.waitForFunction(() => document.body.textContent.includes('Synthetic public-link round trip.') || document.querySelector('.shared-envelope'));
  if (await recipient.locator('.shared-envelope').count()) await recipient.locator('.shared-envelope').click();
  await recipient.waitForFunction(() => document.body.textContent.includes('Synthetic public-link round trip.'));
  assert.equal(new URL(recipient.url()).hash, '');
  assert.deepEqual(errors, []);
  const routes = await page.evaluate(async () => {
   const { sharedEntryUrl } = await import('/src/domain/shareUrl.ts');
   return [sharedEntryUrl('http://localhost:5173','/'), sharedEntryUrl('http://[::1]:5173','/'), sharedEntryUrl('https://example.org','/archive/')];
  });
  assert.deepEqual(routes, ['https://krithi-1304.github.io/STICKY_WALL_WORLD/shared/','https://krithi-1304.github.io/STICKY_WALL_WORLD/shared/','https://example.org/archive/shared/']);
  console.log('PASS: real local Share room generates public HTTPS link; live recipient decrypts synthetic note; fragment cleared; custom hosted base preserved.');
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
