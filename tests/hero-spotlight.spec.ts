import { test, expect } from '@playwright/test';

test('desktop spotlight follows mouse and fades on exit without blocking links', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const light = page.locator('.hero-spotlight');
  await expect(light).toHaveCount(1);
  await page.mouse.move(280, 230);
  await expect(page.locator('.hero')).toHaveAttribute('data-spotlight-active', 'true');
  const first = await light.evaluate(el => getComputedStyle(el).transform);
  await page.mouse.move(580, 350);
  await expect.poll(() => light.evaluate(el => getComputedStyle(el).transform)).not.toBe(first);
  expect(await light.evaluate(el => getComputedStyle(el).pointerEvents)).toBe('none');
  await page.screenshot({ path: 'test-results/hero-spotlight.png' });
  await page.mouse.move(800, 710);
  await expect(page.locator('.hero')).not.toHaveAttribute('data-spotlight-active');
  await page.getByRole('link', { name: '探索我的项目' }).click();
  await expect(page).toHaveURL(/#projects$/);
});

test('reduced-motion setting disables and clears an active spotlight', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.mouse.move(400, 250);
  await expect(page.locator('.hero')).toHaveAttribute('data-spotlight-active', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.hero')).not.toHaveAttribute('data-spotlight-active');
  await expect(page.locator('.hero-spotlight')).toBeHidden();
  await page.mouse.move(600, 350);
  await expect(page.locator('.hero')).not.toHaveAttribute('data-spotlight-active');
});

test('touch devices and article pages have no active spotlight', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await page.touchscreen.tap(220, 280);
  await expect(page.locator('.hero')).not.toHaveAttribute('data-spotlight-active');
  await expect(page.locator('.hero-spotlight')).toBeHidden();
  await page.goto(new URL('/posts/day-001/', page.url()).href);
  await expect(page.locator('.hero-spotlight')).toHaveCount(0);
  await context.close();
});
