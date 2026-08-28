import { chromium } from 'playwright';
const page = await (await chromium.launch()).newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.evaluate(() => localStorage.removeItem('black-wall:v1'));
await page.goto('http://localhost:5173/new', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('input');
await page.fill('input', 'Sunroom');
await page.click('button[type=submit]');
await page.waitForURL('**/r/**');
await page.waitForSelector('.room__topbar');
const add = page.locator('.icon-btn').last();
for (let i = 0; i < 7; i++) { await add.click(); await page.waitForTimeout(130); }
await page.waitForSelector('.sticky');
const texts = ['breathe in', 'let it be easy', 'small joys', 'note to self', 'one thing at a time', 'rest is productive', 'make it gentle'];
const bodies = page.locator('.sticky__body');
for (let i = 0; i < 7; i++) { await bodies.nth(i).fill(texts[i]); }
await page.locator('.font-pick__btn').nth(1).click(); // Gaegu
await page.waitForTimeout(400);
await page.screenshot({ path: '/tmp/bw-beauty-wall.png' });
// maximize one note for the close-up shot
await page.locator('.sticky').nth(3).hover();
await page.locator('.sticky__zoom').nth(3).click();
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/bw-beauty-max.png' });
