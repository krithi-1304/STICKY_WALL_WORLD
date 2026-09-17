const { chromium } = require('../web/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch();
  const artifacts = fs.mkdtempSync('/private/tmp/gallery-qa-');
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => {
      window.playedNotes = [];
      const create = AudioContext.prototype.createOscillator;
      AudioContext.prototype.createOscillator = function () {
        const oscillator = create.call(this);
        const descriptor = Object.getOwnPropertyDescriptor(AudioParam.prototype, 'value');
        Object.defineProperty(oscillator.frequency, 'value', { get() { return descriptor.get.call(this); }, set(value) { window.playedNotes.push(value); descriptor.set.call(this, value); } });
        return oscillator;
      };
    });
    await page.goto('http://127.0.0.1:5173');
    await page.getByRole('link', { name: 'Create a new room' }).click();
    await page.getByRole('textbox', { name: 'Room name' }).fill('Garden ideas');
    await page.getByRole('button', { name: 'Hang it up' }).click();
    await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('black-wall:v1'));
      const base = data.rooms[0];
      data.rooms = Array.from({ length: 10 }, (_, i) => ({ ...base, id: `room-${i}`, slug: `room-${i}`, name: i === 9 ? 'A'.repeat(60) : `Room ${i + 1}` }));
      localStorage.setItem('black-wall:v1', JSON.stringify(data));
    });
    await page.goto('http://127.0.0.1:5173');
    await page.waitForTimeout(1700);
    const bulb = page.locator('.lobby > .fairy-lights button').first();
    await bulb.click();
    assert.equal(await bulb.getAttribute('data-lit'), 'true');
    assert.equal(await page.locator('.rainbow-flame').count(), 1);
    assert.ok((await bulb.boundingBox()).width >= 44);
    await page.waitForTimeout(1700);
    assert.equal(await bulb.getAttribute('data-lit'), 'false');
    assert.equal(await page.locator('.rainbow-flame').count(), 0);
    await bulb.focus(); await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('.lobby > .fairy-lights button').nth(1).evaluate(e => e === document.activeElement), true);
    await page.getByRole('button', { name: 'Chimes off' }).click();
    await page.waitForTimeout(750);
    await page.evaluate(() => { window.playedNotes = []; });
    const first = page.getByRole('link', { name: 'Open Room 1', exact: true });
    await first.hover();
    await page.waitForTimeout(100);
    const a = await page.evaluate(() => window.playedNotes.slice());
    await page.waitForTimeout(750);
    await page.evaluate(() => { window.playedNotes = []; });
    await page.getByRole('link', { name: 'Open Room 2', exact: true }).hover();
    await page.waitForTimeout(100);
    const b = await page.evaluate(() => window.playedNotes.slice());
    assert.equal(a.length, 3); assert.equal(b.length, 3); assert.notDeepEqual(a, b);
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.mouse.move(0, 0);
      assert.equal(await page.locator('.lobby').evaluate(e => e.scrollWidth > e.clientWidth), false, `overflow at ${width}`);
      await page.getByRole('link', { name: `Open ${'A'.repeat(60)}` }).scrollIntoViewIfNeeded();
      await page.locator('.lobby').evaluate(e => { e.scrollTop = 0; });
      await page.screenshot({ path: `${artifacts}/gallery-${width}.png` });
      await page.getByRole('searchbox').fill('Z'.repeat(60));
      assert.equal(await page.locator('.lobby').evaluate(e => e.scrollWidth > e.clientWidth), false, `long search at ${width}`);
      await page.getByRole('button', { name: 'Show every room' }).click();
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await bulb.click();
    assert.equal(await page.locator('.rainbow-flame').count(), 0);
    assert.equal(await bulb.locator('span').evaluate(e => getComputedStyle(e).animationName), 'none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await first.focus(); await page.keyboard.press('Enter');
    assert.match(page.url(), /\/r\/room-0$/);
    assert.equal(await page.locator('.rainbow-flame').count(), 1, 'keyboard flame survives route change');
    assert.deepEqual(errors, []);
    const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const mobile = await touch.newPage();
    await mobile.goto('http://127.0.0.1:5173');
    await mobile.waitForTimeout(1700);
    await mobile.locator('.lobby > .fairy-lights button').first().tap();
    assert.equal(await mobile.locator('.lobby > .fairy-lights button').first().getAttribute('data-lit'), 'true');
    assert.equal(await mobile.locator('.match-cursor').evaluate(e => getComputedStyle(e).display), 'none');
    await mobile.getByRole('link', { name: 'Create a new room' }).tap();
    assert.match(mobile.url(), /\/new$/);
    await touch.close();
    console.log(`PASS: interactive bulbs, rainbow feedback, distinct chime pitches, ten-room wrapping, long names/search, 320–1440px, keyboard navigation, reduced motion. ${artifacts}`);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
