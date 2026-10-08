import { test, expect, openNote, encrypt, world, SHARED_PHRASE } from './fixtures';

test('room switches and keyboard movement preserve state', async ({ authedPage: page }) => {
  await page.getByRole('link', { name: 'Open Test room 0', exact: true }).click();
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'Falling letters on', exact: true }).click();
    await expect(page.getByTestId('note-n0')).toHaveAttribute('data-piled', 'false');
    await page.getByRole('button', { name: 'Falling letters off', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Falling letters on', exact: true })).toHaveAttribute('aria-pressed', 'true');
  }
  await page.getByRole('button', { name: 'Sound off', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sound on', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Sound on', exact: true }).click();
  const light = page.getByRole('button', { name: /Turn room light/ });
  await light.click(); await expect(light).toHaveAttribute('aria-pressed', 'false');
  await light.click(); await expect(light).toHaveAttribute('aria-pressed', 'true');
  const tape = page.getByRole('button', { name: 'Move note. Use arrow keys to reposition.' });
  await tape.focus(); await tape.press('ArrowRight');
  await expect(tape).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('help preserves writing, keyboard exits and narrow editor fits', async ({ authedPage: page }) => {
  await openNote(page);
  await page.getByLabel('Your thought').fill('Long multilingual thought 日本語 '.repeat(50));
  await page.getByRole('button', { name: 'Help & guide', exact: true }).last().click();
  const guide = page.getByRole('dialog', { name: 'Your guide to The Black Wall' });
  await guide.getByLabel('Find a feature or question').fill('nonexistent-topic-xyz');
  await guide.getByRole('button', { name: 'Show all topics' }).click();
  await guide.getByRole('button', { name: 'Close help' }).click();
  await expect(page.getByLabel('Your thought')).toHaveValue('Long multilingual thought 日本語 '.repeat(50));
  expect(await page.getByRole('dialog').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
});

test('fairy lights retain a visible keyboard tab stop on resize', async ({ authedPage: page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByTestId('main-fairy-lights').getByRole('button', { name: 'Illuminate fairy light 2', exact: true }).focus();
  await page.setViewportSize({ width: 360, height: 800 });
  await expect.poll(() => page.getByTestId('main-fairy-lights').getByRole('button').evaluateAll(buttons => buttons.filter(b => b.tabIndex === 0 && (b as HTMLElement).offsetParent !== null).length)).toBe(1);
});

test('recipient reduced motion and repeated ambient toggle restart', async ({ page }) => {
  await page.goto(`shared/#${encodeURIComponent(JSON.stringify(await encrypt(world(), SHARED_PHRASE, true)))}`);
  await expect(page.getByTestId('falling-letters').locator('[data-letter-id]')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'Falling letters on', exact: true }).click();
    await expect(page.getByTestId('falling-letters').locator('[data-letter-id]')).toHaveCount(0);
    await page.getByRole('button', { name: 'Falling letters off', exact: true }).click();
    await expect.poll(() => page.getByTestId('falling-letters').locator('[data-letter-id]').count()).toBeGreaterThan(0);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByTestId('falling-letters').locator('[data-letter-id]')).toHaveCount(0);
});
