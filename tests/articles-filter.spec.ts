import { test, expect } from '@playwright/test';

const openArticles = async (page: import('@playwright/test').Page) => {
  await page.goto('/');
  await page.locator('[data-hub-link="articles"]').click();
  await expect(page.locator('#articles')).toBeVisible();
};

test('week filter shows seven chips and the total count', async ({ page }) => {
  await openArticles(page);
  const bar = page.locator('[data-articles-filter]');
  await expect(bar).toBeVisible();
  const chips = bar.locator('[data-af-week]');
  await expect(chips).toHaveCount(7);
  await expect(chips.first()).toHaveText('全部');
  await expect(bar.locator('[data-af-status]')).toHaveText('共 35 篇');
});

test('choosing a week shows only that week, expanded', async ({ page }) => {
  await openArticles(page);
  await page.locator('[data-af-week="2"]').click();
  await expect(page.locator('#articles .week-group:not([hidden])')).toHaveCount(1);
  await expect(page.locator('#articles .week-group:not([hidden])')).toHaveAttribute('id', 'week-2');
  await expect(page.locator('#week-articles-2')).toBeVisible();
  await expect(page.locator('[data-week-toggle][aria-controls="week-articles-2"]')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#articles .article-row:visible')).toHaveCount(7);
  await expect(page.locator('[data-af-week="2"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-af-status]')).toHaveText('匹配 7 篇');
});

test('the newest weeks are selectable and hold the imported notes', async ({ page }) => {
  await openArticles(page);
  await page.locator('[data-af-week="6"]').click();
  await expect(page.locator('#articles .article-row:visible')).toHaveCount(5);
  await expect(page.locator('#week-6')).toHaveText('SQL 注入进阶');
  await page.locator('[data-af-week="5"]').click();
  await expect(page.locator('#articles .article-row:visible')).toHaveCount(2);
  await expect(page.locator('#week-5')).toHaveText('第一阶段收官');
});

test('returning to all restores the collapsed default list', async ({ page }) => {
  await openArticles(page);
  await page.locator('[data-af-week="6"]').click();
  await page.locator('[data-af-week="all"]').click();
  await expect(page.locator('[data-articles-gate]')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('[data-articles-weeks]')).toBeHidden();
  await expect(page.locator('[data-af-status]')).toHaveText('共 35 篇');
  await expect(page.locator('#articles .week-group:not([hidden])')).toHaveCount(6);
});

test('without JavaScript the filter stays hidden and every article is reachable', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await expect(page.locator('[data-articles-filter]')).toBeHidden();
  await expect(page.locator('.article-row')).toHaveCount(35);
  await expect(page.locator('.article-row').last()).toBeVisible();
  await context.close();
});

test('mobile filter row fits without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openArticles(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('[data-af-week="6"]')).toBeVisible();
});
