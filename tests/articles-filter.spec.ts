import { test, expect } from '@playwright/test';

const openArticles = async (page: import('@playwright/test').Page) => {
  await page.goto('/');
  await page.locator('[data-hub-link="articles"]').click();
  await expect(page.locator('#articles')).toBeVisible();
};

test('filter bar shows with search box, week chips and a status line', async ({ page }) => {
  await openArticles(page);
  const bar = page.locator('[data-articles-filter]');
  await expect(bar).toBeVisible();
  await expect(bar.locator('[data-af-input]')).toBeVisible();
  const chips = bar.locator('[data-af-week]');
  await expect(chips).toHaveCount(5);
  await expect(chips.first()).toHaveText('全部');
  await expect(bar.locator('[data-af-status]')).toHaveText('共 28 篇');
});

test('search keeps only matching rows and auto-expands their weeks', async ({ page }) => {
  await openArticles(page);
  await page.locator('[data-af-input]').fill('盲注');
  const visible = page.locator('#articles .article-row:not([hidden])');
  const count = await visible.count();
  expect(count).toBeGreaterThan(0);
  for (const row of await visible.all()) {
    expect((await row.getAttribute('data-search'))!).toContain('盲注');
  }
  await expect(page.locator('#articles .week-group:not([hidden]) .week-toggle')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-af-status]')).toContainText(`匹配 ${count} 篇`);
  await expect(page.locator('[data-af-empty]')).toBeHidden();
});

test('week chip filters to that week only', async ({ page }) => {
  await openArticles(page);
  await page.locator('[data-af-week="2"]').click();
  const visible = page.locator('#articles .article-row:not([hidden])');
  await expect(visible).toHaveCount(7);
  for (const row of await visible.all()) {
    expect(await row.getAttribute('data-week')).toBe('2');
  }
  await expect(page.locator('[data-af-week="2"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-af-status]')).toHaveText('匹配 7 篇');
});

test('search and week chip combine', async ({ page }) => {
  await openArticles(page);
  await page.locator('[data-af-week="2"]').click();
  await page.locator('[data-af-input]').fill('端口');
  const visible = page.locator('#articles .article-row:not([hidden])');
  const count = await visible.count();
  expect(count).toBeGreaterThan(0);
  for (const row of await visible.all()) {
    expect(await row.getAttribute('data-week')).toBe('2');
    expect((await row.getAttribute('data-search'))!).toContain('端口');
  }
  await expect(page.locator('[data-af-status]')).toContainText(`匹配 ${count} 篇`);
});

test('no results shows the empty hint and zero count', async ({ page }) => {
  await openArticles(page);
  await page.locator('[data-af-input]').fill('不存在的关键词xyz');
  await expect(page.locator('[data-af-empty]')).toBeVisible();
  await expect(page.locator('[data-af-status]')).toHaveText('匹配 0 篇');
  await expect(page.locator('#articles .week-group:not([hidden])')).toHaveCount(0);
});

test('clearing search and chips restores the collapsed default list', async ({ page }) => {
  await openArticles(page);
  await page.locator('[data-af-input]').fill('盲注');
  await page.locator('[data-af-input]').fill('');
  await page.locator('[data-af-week="all"]').click();
  await expect(page.locator('[data-articles-gate]')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('[data-articles-weeks]')).toBeHidden();
  await expect(page.locator('#articles .article-row:not([hidden])')).toHaveCount(28);
  await expect(page.locator('[data-af-status]')).toHaveText('共 28 篇');
});

test('without JavaScript the filter stays hidden and every article is reachable', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await expect(page.locator('[data-articles-filter]')).toBeHidden();
  await expect(page.locator('.article-row')).toHaveCount(28);
  await expect(page.locator('.article-row').last()).toBeVisible();
  await context.close();
});

test('mobile filter bar fits without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openArticles(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('[data-af-input]')).toBeVisible();
});
