// Render the original SVG mark; no generated artwork or external assets.
const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {});
  try {
    const svg = await fs.readFile(path.join(__dirname, '../public/favicon.svg'), 'utf8');
    const page = await browser.newPage();
    for (const [size, name] of [[192, 'icon-192.png'], [512, 'icon-512.png'], [180, 'apple-touch-icon.png']]) {
      await page.setViewportSize({ width: size, height: size });
      await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:100vw;height:100vh}</style>${svg}`);
      await page.screenshot({ path: path.join(__dirname, '../public', name), omitBackground: true });
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
