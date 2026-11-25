import { test, expect } from '@playwright/test';

test('article header, reading metadata, TOC, and SEO tags render accurately', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/posts/day-035/');

  await expect(page.locator('.post-meta time')).toHaveText('2026-11-15');
  await expect(page.locator('.post-meta')).toContainText('分钟阅读');
  await expect(page.locator('.post-meta')).toContainText('字');

  const tagLinks = page.locator('.post-tags .post-tag-link');
  await expect(tagLinks.first()).toHaveAttribute('href', /\/tags\/.+\//);

  await expect(page.locator('.post-toc')).toBeVisible();
  await expect(page.locator('.post-toc [data-toc-link]').first()).toBeVisible();

  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute('content', /2026-11-15/);

  const ldJson = await page.locator('script[type="application/ld+json"]').textContent();
  expect(ldJson).toBeTruthy();
  const parsed = JSON.parse(ldJson!);
  expect(Array.isArray(parsed)).toBe(true);
  expect(parsed[0]['@type']).toBe('BlogPosting');

  await expect(page.locator('.hub')).toHaveCount(0);
  await expect(page.locator('.hero-grid')).toHaveCount(0);
  await expect(page.locator('.hero-spotlight')).toHaveCount(0);
  await expect(page.locator('[data-reveal-state]')).toHaveCount(0);
});

test('code blocks have language headers, visible copy buttons, and figures with captions', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/posts/day-001/');

  const firstFrame = page.locator('.code-frame').first();
  await expect(firstFrame.locator('.code-lang')).toBeVisible();
  await expect(firstFrame.locator('.copy-btn')).toBeVisible();

  const figure = page.locator('.article-body figure.article-figure').first();
  await expect(figure).toBeVisible();
  await expect(figure.locator('figcaption')).not.toHaveText('');

  const img = figure.locator('img');
  await img.scrollIntoViewIfNeeded();
  await img.click();

  const dialog = page.locator('dialog[data-lightbox]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-lb-counter]')).toContainText('1 /');
  await dialog.locator('[data-lb-next]').click();
  await expect(dialog.locator('[data-lb-counter]')).toContainText('2 /');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('reading progress, back-to-top, week path, and mobile TOC work without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/posts/day-035/');

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('.toc-mobile')).toBeVisible();
  await page.locator('.toc-mobile summary').click();
  await expect(page.locator('.toc-mobile .toc-list')).toBeVisible();

  await expect(page.locator('.week-path')).toBeVisible();
  await expect(page.locator('.week-path-item.is-current')).toContainText('DAY 35');

  const backTop = page.locator('[data-back-to-top]');
  await expect(backTop).toBeHidden();
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
  await expect(backTop).toBeVisible();

  const scale = await page.locator('[data-reading-progress]').evaluate((el) => getComputedStyle(el).transform);
  expect(scale).not.toBe('none');

  await backTop.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(20);
});
