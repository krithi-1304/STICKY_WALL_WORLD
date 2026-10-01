const { chromium } = require('../web/node_modules/playwright');
const assert = require('node:assert/strict');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
async function contrast(locator) {
  const values = await locator.evaluateAll(buttons => buttons.filter(el => !el.disabled).map(el => {
    const style = getComputedStyle(el);
    const luminance = value => {
      const channels = value.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
      return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
    };
    const foreground = luminance(style.color), background = luminance(style.backgroundColor);
    return { name: el.textContent.trim(), ratio: (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05), background: style.backgroundColor };
  }));
  for (const value of values) assert.ok(value.ratio >= 4.5 && !value.background.startsWith('rgba'), JSON.stringify(value));
  return values;
}
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    await page.goto(base);
    await page.getByLabel('Passphrase', { exact: true }).fill('button contrast test phrase');
    await page.getByLabel('Repeat passphrase').fill('button contrast test phrase');
    await page.getByRole('button', { name: 'Create private archive' }).click();
    await page.getByLabel('What is on your mind?').fill('A clear place to write.');
    await page.getByRole('button', { name: 'Keep it', exact: true }).click();
    await page.getByRole('button', { name: 'Keep this thought' }).click();
    const measured = await contrast(page.locator('.diary-actions > button, .diary-actions > .item-controls > button'));
    await page.getByRole('button', { name: 'Chimes off', exact: true }).click();
    measured.push(...await contrast(page.locator('.diary-actions > button')));
    await page.getByRole('button', { name: 'Chimes on', exact: true }).click();
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.screenshot({ path: `/tmp/room-buttons-${width}.png` });
      assert.ok(await page.locator('.diary-bar').evaluate(el => el.scrollWidth <= el.clientWidth));
    }
    await page.locator('.note-open').click();
    const editor = page.getByRole('dialog', { name: 'Open note', exact: true });
    measured.push(...await contrast(editor.locator(':scope > :is(header,.editor-privacy,.item-controls,.editor-format,.attachment-choices,footer) > button')));
    await page.setViewportSize({ width: 390, height: 900 });
    await page.screenshot({ path: '/tmp/paper-buttons-390.png' });
    for (const name of ['Share note', 'Lock note', 'Change passphrase']) {
      await editor.getByRole('button', { name, exact: true }).click();
      const dialog = page.locator('.vault-panel[open]');
      measured.push(...await contrast(dialog.locator('button')));
      await page.screenshot({ path: `/tmp/room-${name.replaceAll(' ', '-')}.png` });
      await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    }
    assert.equal(await editor.getByLabel('Your thought').inputValue(), 'A clear place to write.');
    console.log(`PASS: ${measured.length} enabled button/state samples meet 4.5:1 contrast; minimum ${Math.min(...measured.map(v => v.ratio)).toFixed(2)}:1. Room toolbar, paper editor, nested share/lock/passphrase dialogs and 320/390/1440 layouts.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
