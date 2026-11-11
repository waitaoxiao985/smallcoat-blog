import { test, expect } from '@playwright/test';

const NEW_POSTS = ['day-029', 'day-030', 'day-031', 'day-032', 'day-033', 'day-034', 'day-035'];

test('articles panel lists six weeks including the new ones', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-hub-link="articles"]').click();
  await expect(page.locator('#articles .week-group')).toHaveCount(6);
  await expect(page.locator('#week-5')).toHaveText('第一阶段收官');
  await expect(page.locator('#week-6')).toHaveText('SQL 注入进阶');
  await expect(page.locator('#articles .article-row')).toHaveCount(35);
  await expect(page.locator('[data-af-status]')).toHaveText('共 35 篇');
});

test('each new post page renders with its images', async ({ page, request }) => {
  for (const slug of NEW_POSTS) {
    const response = await page.goto(`/posts/${slug}/`);
    expect(response?.status(), slug).toBe(200);
    await expect(page.locator('.article-body h2').first()).toBeVisible();
    const sources = await page.locator('.article-body img').evaluateAll(images => images.map(image => image.getAttribute('src')!));
    expect(sources.length, slug).toBeGreaterThan(0);
    for (const src of sources) {
      const head = await request.get(src);
      expect(head.status(), `${slug} ${src}`).toBe(200);
    }
    const firstImage = page.locator('.article-body img').first();
    await firstImage.scrollIntoViewIfNeeded();
    await expect.poll(() => firstImage.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
});

test('week five and six posts are reachable from the list', async ({ page }) => {
  await page.goto('/#articles');
  await page.locator('[data-af-week="6"]').click();
  await expect(page.locator('#articles .article-row:not([hidden])')).toHaveCount(5);
  await page.locator('[data-af-week="5"]').click();
  await expect(page.locator('#articles .article-row:not([hidden])')).toHaveCount(2);
  await page.locator('.article-row:not([hidden])').first().click();
  await expect(page).toHaveURL(/day-029\/$/);
});

test('published notes carry no personal identifiers', async ({ page }) => {
  const needles = ['熊卫涛', '3124260109', '网安 241'];
  const pages = ['/', '/posts/day-029/', '/posts/day-031/', '/posts/day-035/'];
  for (const path of pages) {
    await page.goto(path);
    const text = await page.evaluate(() => document.body.innerText);
    for (const needle of needles) expect(text, `${path} contains ${needle}`).not.toContain(needle);
  }
});
