import { test, expect } from '@playwright/test';

test('homepage blocks animate on entry once, with short staggered project delays', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const project = page.locator('.project').first();
  await expect(project).toHaveAttribute('data-reveal-state', 'pending');
  await page.evaluate(() => document.querySelector('#projects')!.scrollIntoView({ behavior: 'instant' }));
  await expect(project).toHaveAttribute('data-reveal-state', 'revealed');
  await expect.poll(() => project.evaluate(el => el.getAnimations().length)).toBe(0);
  await expect(project).toHaveCSS('opacity', '1');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.evaluate(() => document.querySelector('#projects')!.scrollIntoView({ behavior: 'instant' }));
  expect(await project.evaluate(el => el.getAnimations().length)).toBe(0);
  const delays = await page.locator('.project').evaluateAll(els => els.map(el => el.getAttribute('data-reveal-delay')));
  expect(delays).toEqual(['0', '70', '140']);
  await page.screenshot({ path: 'test-results/scroll-reveal.png' });
});

test('reducing motion during a visit reveals all content without further animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('.article-list').last()).toHaveAttribute('data-reveal-state', 'pending');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('[data-reveal-state="pending"]')).toHaveCount(0);
  await page.locator('.article-list').last().scrollIntoViewIfNeeded();
  expect(await page.locator('.article-list').last().evaluate(el => el.getAnimations().length)).toBe(0);
  await expect(page.locator('.article-list').last()).toHaveCSS('opacity', '1');
});

test('no JavaScript or observer support leaves content visible and links usable', async ({ browser, baseURL, page }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const noJS = await context.newPage();
  await noJS.goto(baseURL!);
  await expect(noJS.locator('.article-row')).toHaveCount(28);
  await expect(noJS.locator('.article-list').last()).toHaveCSS('opacity', '1');
  await noJS.locator('.article-row').last().click();
  await expect(noJS).toHaveURL(/day-028\/$/);
  await context.close();
  await page.addInitScript(() => { Object.defineProperty(window, 'IntersectionObserver', { value: undefined }); });
  await page.goto('/');
  await expect(page.locator('.article-list').last()).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-reveal-state]')).toHaveCount(0);
});

test('article content has no reveal effects', async ({ page }) => {
  await page.goto('/posts/day-015/');
  await expect(page.locator('[data-reveal-state]')).toHaveCount(0);
  await expect(page.locator('.article-body')).toHaveCSS('opacity', '1');
});
