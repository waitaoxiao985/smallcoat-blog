import { test, expect } from '@playwright/test';

const openArticles = async (page: import('@playwright/test').Page) => {
  await page.goto('/');
  await page.locator('[data-hub-link="articles"]').click();
  await expect(page.locator('#articles')).toBeVisible();
};

test('search console starts idle and answers a query on submit', async ({ page }) => {
  await openArticles(page);
  const console_ = page.locator('[data-article-search]');
  await expect(console_).toBeVisible();
  await expect(console_.locator('[data-sc-idle]')).toContainText('待命');
  await console_.locator('[data-sc-input]').fill('盲注');
  await console_.locator('[data-sc-form]').press('Enter');
  const hits = console_.locator('.sc-hit');
  const count = await hits.count();
  expect(count).toBeGreaterThanOrEqual(3);
  await expect(console_.locator('.sc-meta')).toContainText(`匹配 ${count} 篇`);
});

test('every hit belongs to a record that matches the query', async ({ page }) => {
  await openArticles(page);
  const console_ = page.locator('[data-article-search]');
  await console_.locator('[data-sc-input]').fill('nmap');
  await console_.locator('[data-sc-form]').press('Enter');
  const hits = await console_.locator('.sc-hit').evaluateAll(links => links.map(link => ({
    href: link.getAttribute('href') || '',
    title: link.querySelector('.sc-hit-title')?.textContent?.trim() || '',
  })));
  expect(hits.length).toBeGreaterThan(0);
  const matches = await page.locator('#articles .article-row').evaluateAll(rows => rows.map(row => ({
    href: row.getAttribute('href') || '',
    search: (row.dataset.search || '').toLowerCase(),
  })));
  for (const hit of hits) {
    const record = matches.find(row => row.href === hit.href);
    expect(record, hit.href).toBeTruthy();
    expect(record!.search).toContain('nmap');
  }
});

test('a hit opens the article and an empty result is reported', async ({ page }) => {
  await openArticles(page);
  const console_ = page.locator('[data-article-search]');
  await console_.locator('[data-sc-input]').fill('宽字节');
  await console_.locator('[data-sc-form]').press('Enter');
  await console_.locator('.sc-hit').first().click();
  await expect(page).toHaveURL(/\/posts\/day-035\/$/);
  await page.goBack();
  await expect(page.locator('#articles')).toBeVisible();
  await page.locator('[data-sc-input]').fill('不存在的关键词xyz');
  await page.locator('[data-sc-form]').press('Enter');
  await expect(page.locator('[data-sc-results] .sc-none')).toContainText('0 RESULTS');
  await expect(page.locator('[data-sc-results] .sc-hit')).toHaveCount(0);
});

test('escape clears the console back to idle', async ({ page }) => {
  await openArticles(page);
  const input = page.locator('[data-sc-input]');
  await input.fill('盲注');
  await page.locator('[data-sc-form]').press('Enter');
  await expect(page.locator('[data-sc-results] .sc-hit').first()).toBeVisible();
  await input.press('Escape');
  await expect(input).toHaveValue('');
  await expect(page.locator('[data-sc-idle]')).toBeVisible();
  await expect(page.locator('[data-sc-results] .sc-hit')).toHaveCount(0);
});

test('console fits on mobile without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openArticles(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('[data-sc-input]')).toBeVisible();
});
