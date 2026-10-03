const { chromium } = require('../web/node_modules/playwright');
const assert = require('node:assert/strict');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
(async () => {
  const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE} : {});
  try {
    const page = await browser.newPage();
    await page.addInitScript(() => {
      const connect = AudioNode.prototype.connect;
      AudioNode.prototype.connect = function (destination, ...args) {
        if (destination instanceof AudioDestinationNode) {
          const analyser = this.context.createAnalyser();
          analyser.fftSize = 2048;
          window.qaAudio = analyser;
          connect.call(analyser, destination);
          return connect.call(this, analyser, ...args);
        }
        return connect.call(this, destination, ...args);
      };
    });
    await page.goto(base);
    await page.getByLabel('Passphrase', { exact: true }).fill('sound state test phrase');
    await page.getByLabel('Repeat passphrase').fill('sound state test phrase');
    await page.getByRole('button', { name: 'Create private archive' }).click();
    const toggle = page.locator('[data-sound-toggle]');
    assert.equal(await toggle.innerText(), 'Sound off');
    const level = () => page.evaluate(() => {
      if (!window.qaAudio) return 0;
      const samples = new Float32Array(window.qaAudio.fftSize);
      window.qaAudio.getFloatTimeDomainData(samples);
      return Math.max(...samples.map(Math.abs));
    });
    assert.equal(await level(), 0);
    await toggle.click();
    assert.equal(await toggle.innerText(), 'Sound on');
    assert.equal(await toggle.getAttribute('aria-pressed'), 'true');
    await page.waitForTimeout(120);
    assert.ok(await level() > 0.0001, 'On must produce an actual audio signal');
    await toggle.click();
    await page.waitForTimeout(100);
    assert.equal(await level(), 0, 'Off must silence the output, including existing tails');
    await toggle.hover();
    await page.getByRole('link', { name: 'Create a new room' }).hover();
    assert.equal(await level(), 0);
    // A rapid on/off cannot leave a delayed preview sounding in the off state.
    await toggle.evaluate(el => { el.click(); el.click(); el.click(); el.click(); });
    await page.waitForTimeout(150);
    assert.equal(await toggle.innerText(), 'Sound off');
    assert.equal(await level(), 0);
    await toggle.click();
    await page.waitForTimeout(120);
    assert.ok(await level() > 0.0001, 'Re-enable must not be blocked by an earlier suspend');
    await toggle.click();
    await page.reload();
    await page.getByLabel('Passphrase', { exact: true }).fill('sound state test phrase');
    await page.getByRole('button', { name: 'Unlock archive' }).click();
    assert.equal(await toggle.innerText(), 'Sound off');
    assert.equal(await level(), 0);
    console.log('PASS: actual audio signal agrees with On/Off; mute stops tails; no off-state hover sounds; rapid toggles; re-enable; persisted mute.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
