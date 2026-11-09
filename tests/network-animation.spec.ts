import { test, expect } from '@playwright/test';

test('homepage has a decorative HTML network animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const visual = page.locator('.network-visual');
  await expect(visual).toHaveCount(1);
  await expect(visual.locator('svg')).toHaveAttribute('aria-hidden', 'true');
  await expect(visual.locator('.network-node')).toHaveCount(9);
  await expect(visual.locator('.network-pulse')).toHaveCount(3);
  await expect(visual).toHaveCSS('pointer-events', 'none');
  const animated = await visual.locator('.network-node').first().evaluate(el => getComputedStyle(el).animationName);
  expect(animated).toBe('node-breathe');
  const pulseAnimation = await visual.locator('.network-pulse').first().evaluate(el => getComputedStyle(el).animationName);
  expect(pulseAnimation).toBe('data-pulse');
  await page.screenshot({ path: 'test-results/network-animation.png' });
});

test('network animation becomes static for reduced motion and does not appear on articles', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.network-visual')).toBeVisible();
  expect(await page.locator('.network-node').first().evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  expect(await page.locator('.network-pulse').first().evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await page.goto('/posts/day-001/');
  await expect(page.locator('.network-visual')).toHaveCount(0);
});

test('network animation does not create horizontal overflow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('.network-visual')).toHaveCSS('display', 'none');
});
