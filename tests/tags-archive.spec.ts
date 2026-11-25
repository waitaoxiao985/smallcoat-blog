import { test, expect } from '@playwright/test';

test('tags index lists all 29 topic tags and navigates to tag archive pages', async ({ page }) => {
  await page.goto('/tags/');
  const cards = page.locator('[data-tag-card]');
  await expect(cards).toHaveCount(29);

  await page.locator('a[href="/tags/sql-injection/"]').first().click();
  await expect(page).toHaveURL(/\/tags\/sql-injection\/$/);
  await expect(page.locator('h1')).toContainText('SQL 注入');
  const postLinks = page.locator('.tag-post-card .tpc-title a');
  expect(await postLinks.count()).toBeGreaterThanOrEqual(2);
  await postLinks.first().click();
  await expect(page).toHaveURL(/\/posts\/day-\d+\/$/);
});

test('archive page lists all 42 posts, works without JS, and fits on mobile', async ({ browser, baseURL, page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/archive/');
  await expect(page.locator('.aw-item')).toHaveCount(42);
  await expect(page.locator('.archive-stats')).toContainText('42');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  const context = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await context.newPage();
  await noJsPage.goto(new URL('/archive/', baseURL).href);
  await expect(noJsPage.locator('.aw-item')).toHaveCount(42);
  await context.close();
});

test('rss feed and 404 page meet metadata and reduced-motion requirements', async ({ page, request }) => {
  const rssResponse = await request.get('/rss.xml');
  expect(rssResponse.status()).toBe(200);
  const rssBody = await rssResponse.text();
  const itemCount = (rssBody.match(/<item>/g) ?? []).length;
  expect(itemCount).toBe(42);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const notFoundRes = await page.goto('/non-existent-route-check');
  expect(notFoundRes?.status()).toBe(404);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('#nf-title')).toHaveText('404');
});
