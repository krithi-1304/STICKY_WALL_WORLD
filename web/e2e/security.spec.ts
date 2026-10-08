import { createServer } from 'node:http';
import { test, expect, openNote, saved, PHRASE, NOTE, encrypt, world, SHARED_PHRASE } from './fixtures';

test('production policy blocks inline script; all entry points carry CSP', async ({ page, request, baseURL }) => {
  for (const path of ['', 'shared/', 'new/', '404.html']) {
    const html = await (await request.get(new URL(path, baseURL).href)).text();
    expect(html).toContain('http-equiv="Content-Security-Policy"');
    expect(html).toContain('name="referrer" content="no-referrer"');
  }
  await page.goto('./');
  await page.evaluate(() => {
    const script = document.createElement('script'); script.textContent = 'window.injected=true'; document.head.append(script);
  });
  expect(await page.evaluate(() => (window as unknown as { injected?: boolean }).injected)).toBeUndefined();
});

test('cross-origin frame cannot mount interactive controls', async ({ page, baseURL }) => {
  const server = createServer((_request, response) => {
    response.setHeader('Content-Type', 'text/html');
    response.end(`<iframe src="${baseURL}shared/" style="width:800px;height:600px"></iframe>`);
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address(); if (!address || typeof address === 'string') throw new Error('No audit server port');
    await page.goto(`http://127.0.0.1:${address.port}`);
    const frame = page.frameLocator('iframe');
    await expect(frame.getByRole('link', { name: 'Open The Black Wall in its own tab' })).toBeVisible();
    await expect(frame.locator('input,button')).toHaveCount(0);
  } finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
});

test('injected markup and unsafe links remain inert in received content', async ({ page }) => {
  const content = world();
  content.stickies[0].body = '<img src=x onerror="window.bad=1"> [bad](javascript:alert(1)) [safe](https://example.com)';
  await page.goto(`shared/#${encodeURIComponent(JSON.stringify(await encrypt(content, SHARED_PHRASE, true)))}`);
  await page.getByLabel('Share passphrase').fill(SHARED_PHRASE);
  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await page.getByRole('button', { name: /Open your letter/ }).click();
  await expect(page.getByRole('link', { name: 'bad', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'safe', exact: true })).toHaveAttribute('rel', 'noopener noreferrer');
  expect(await page.evaluate(() => (window as unknown as { bad?: boolean }).bad)).toBeUndefined();
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('link', { name: 'safe', exact: true }).click();
  expect(page.context().pages()).toHaveLength(1);
});

test('private markers do not leak into requests or plaintext storage', async ({ authedPage: page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url() + (request.postData() ?? '')));
  await openNote(page); await page.getByLabel('Your thought').fill('PRIVATE_NETWORK_MARKER_2026'); await saved(page);
  const storage = await page.evaluate(async () => {
    const envelope = await new Promise<unknown>((resolve, reject) => {
      const open = indexedDB.open('black-wall-private'); open.onerror = () => reject(open.error);
      open.onsuccess = () => { const db = open.result; const read = db.transaction('vault').objectStore('vault').get('world'); read.onsuccess = () => { db.close(); resolve(read.result); }; read.onerror = () => { db.close(); reject(read.error); }; };
    });
    return JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage }, cookie: document.cookie, envelope });
  });
  for (const marker of [NOTE, PHRASE, 'PRIVATE_NETWORK_MARKER_2026']) {
    expect(storage).not.toContain(marker); expect(requests.join('\n')).not.toContain(marker);
  }
});

test('font-network failure and offline editing preserve local functionality', async ({ authedPage: page, context }) => {
  await context.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
  await page.reload();
  await page.getByLabel('Passphrase', { exact: true }).fill(PHRASE);
  await page.getByRole('button', { name: 'Unlock archive' }).click();
  await openNote(page);
  await context.setOffline(true);
  await page.getByLabel('Your thought').fill('Saved offline without a data API');
  await saved(page);
  await context.setOffline(false);
  await page.reload();
  await page.getByLabel('Passphrase', { exact: true }).fill(PHRASE);
  await page.getByRole('button', { name: 'Unlock archive' }).click();
  await page.getByTestId('note-n0').getByRole('button', { name: /^Open note from/ }).click();
  await expect(page.getByLabel('Your thought')).toHaveValue('Saved offline without a data API');
});
