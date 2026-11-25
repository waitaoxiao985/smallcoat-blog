import { test, expect } from '@playwright/test';

test('panel bar switches directly between sections and updates document title', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('[data-hub-link="projects"]').click();
  await expect(page).toHaveTitle(/项目 — SmalLCoat/);
  await expect(page.locator('.build-log')).not.toContainText('Cyber_Platform');
  await expect(page.locator('.build-log')).toContainText('dengbao-assessment-practice');

  await page.locator('[data-panel-switch="articles"]').click();
  await expect(page.locator('#articles')).toBeVisible();
  await expect(page.locator('.panel-label')).toHaveText('学习记录');
  await expect(page).toHaveTitle(/学习记录 — SmalLCoat/);

  await page.locator('[data-panel-switch="about"]').click();
  await expect(page.locator('#about')).toBeVisible();
  await expect(page.locator('.panel-label')).toHaveText('关于我');
  await expect(page.locator('.about-skills')).toBeVisible();
  await expect(page.locator('.roadmap-item')).toHaveCount(6);
});

test('search supports multi-word AND matching, highlights, quick chips, and / shortcut', async ({ page }) => {
  await page.goto('/#articles');
  await expect(page.locator('#articles')).toBeVisible();

  await page.keyboard.press('/');
  const input = page.locator('[data-sc-input]');
  await expect(input).toBeFocused();

  await input.fill('SQL 盲注');
  await page.locator('[data-sc-form]').press('Enter');
  const hits = page.locator('.sc-hit');
  const hitCount = await hits.count();
  expect(hitCount).toBeGreaterThanOrEqual(2);
  await expect(hits.first().locator('.sc-mark').first()).toBeVisible();

  await page.locator('[data-sc-quick="WAF"]').click();
  await expect(input).toHaveValue('WAF');
  await expect(page.locator('.sc-hit').first()).toContainText('WAF');
});

test('continue reading remembers the last visited article', async ({ page }) => {
  await page.goto('/posts/day-031/');
  await page.goto('/#articles');
  await expect(page.locator('[data-aq-badge]')).toHaveText('继续阅读');
  await expect(page.locator('[data-aq-link]')).toHaveAttribute('href', '/posts/day-031/');
});

test('desktop entry screen fits without scrollbars and core pages emit no runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });

  for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const fits = await page.evaluate(() => ({
      w: document.documentElement.scrollWidth <= innerWidth,
      h: document.documentElement.scrollHeight <= innerHeight,
    }));
    expect(fits, JSON.stringify(viewport)).toEqual({ w: true, h: true });
  }

  for (const route of ['/posts/day-035/', '/tags/', '/archive/']) {
    await page.goto(route);
    await expect(page.locator('#main-content')).toBeVisible();
  }
  expect(errors).toEqual([]);
});
