const { chromium } = require('../web/node_modules/playwright');
const assert = require('node:assert/strict');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';

(async () => {
  const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE} : {});
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);
    await page.locator('.arrival').waitFor({ state: 'detached' });
    const help = page.getByRole('button', { name: 'Help & guide', exact: true });
    await help.click();
    const guide = page.getByRole('dialog', { name: 'Your guide to The Black Wall' });
    assert.ok(await guide.locator('details').count() === 13);
    await guide.getByLabel('Find a feature or question').fill('heart lock');
    assert.ok(await guide.locator('details[open]').count() > 0);
    await guide.getByLabel('Find a feature or question').fill('xyzzynotatopic');
    await guide.getByRole('button', { name: 'Show all topics' }).click();
    const download = page.waitForEvent('download');
    await guide.getByRole('link', { name: 'Download guide' }).click();
    assert.equal((await download).suggestedFilename(), 'The-Black-Wall-Guide.md');
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await guide.evaluate(el => el.scrollWidth <= el.clientWidth));
      assert.ok(await guide.evaluate(el => { const r = el.getBoundingClientRect(); return r.x >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; }));
      await guide.evaluate(el => { el.scrollTop = 0; });
      await page.screenshot({ path: `/tmp/black-wall-help-${width}.png` });
    }
    await guide.getByRole('button', { name: 'Close help' }).click();
    assert.ok(await help.evaluate(el => el === document.activeElement));
    await page.getByLabel('Passphrase', { exact: true }).fill('help guide testing phrase');
    await page.getByLabel('Repeat passphrase').fill('help guide testing phrase');
    await page.getByRole('button', { name: 'Create private archive' }).click();
    await page.getByLabel('What is on your mind?').fill('Keep this draft while reading help');
    await help.click();
    await page.keyboard.press('Escape');
    assert.equal(await page.getByLabel('What is on your mind?').inputValue(), 'Keep this draft while reading help');
    await page.getByRole('button', { name: 'Keep it', exact: true }).click();
    await page.getByRole('button', { name: 'Keep this thought' }).click();
    await page.getByTitle('Rename room').click();
    await page.getByLabel('Room name', { exact: true }).fill('Quiet corner');
    await page.getByLabel('Room name', { exact: true }).press('Enter');
    await page.getByRole('link', { name: '← Lobby' }).click();
    await page.getByLabel('Search rooms').fill('Quiet');
    await page.getByRole('link', { name: 'Open Quiet corner', exact: true }).waitFor();
    await page.getByLabel('Search rooms').fill('no such room');
    await page.getByRole('button', { name: 'Show every room' }).click();
    await page.getByRole('link', { name: 'Open Quiet corner', exact: true }).click();
    const tape = page.getByRole('button', { name: 'Move note. Use arrow keys to reposition.' });
    await tape.focus();
    await tape.press('ArrowRight');
    assert.equal(await page.locator('.diary-note').evaluate(el => el.style.getPropertyValue('--dx')), '4px');
    await page.locator('.note-open').click();
    const editor = page.getByRole('dialog', { name: 'Open note', exact: true });
    await editor.getByRole('button', { name: 'Help & guide', exact: true }).click();
    await guide.getByRole('button', { name: 'Close help' }).click();
    assert.equal(await editor.getByLabel('Your thought').inputValue(), 'Keep this draft while reading help');
    await editor.getByRole('button', { name: 'Help & guide', exact: true }).click();
    await guide.getByRole('button', { name: 'Hide screen', exact: true }).click();
    assert.equal(await page.locator('dialog[open]').count(), 0);
    await page.getByRole('button', { name: 'Return', exact: true }).click();
    await page.getByRole('button', { name: 'Unlock archive' }).waitFor();
    await page.goto(`${base.replace(/\/$/, '')}/shared/`);
    await help.click();
    await page.keyboard.press('Escape');
    await page.getByRole('heading', { name: 'A note was left for you.' }).waitFor();
    await help.click();
    await guide.getByRole('button', { name: 'Hide screen', exact: true }).click();
    await page.getByRole('button', { name: 'Return', exact: true }).waitFor();

    // Actual touch events, with reduced motion, preserve help and entry controls.
    const touch = await browser.newPage({ viewport: { width: 320, height: 700 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
    await touch.goto(base);
    await touch.getByRole('button', { name: 'Help & guide' }).tap();
    await touch.getByRole('button', { name: 'Close help' }).tap();
    assert.ok(await touch.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.equal(await touch.locator('.ambient-depth').evaluate(el => getComputedStyle(el).transform), 'none');
    assert.ok(await touch.locator('.ambient-scene').evaluate(el => el.getAnimations({ subtree: true }).length === 0));
    assert.deepEqual(errors, []);
    console.log('PASS: searchable/downloadable help; 320/390/1440 layouts; focus return; preserved lobby/editor drafts; nested modal hide; shared-page help/hide; touch and reduced motion.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
