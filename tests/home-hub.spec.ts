import { test, expect } from '@playwright/test';

test('homepage is an entry console with four choices and a tech illustration', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('.hub')).toBeVisible();
  await expect(page.locator('[data-hub-link]')).toHaveCount(4);
  await expect(page.locator('#projects')).toBeHidden();
  await expect(page.locator('#articles')).toBeHidden();
  await expect(page.locator('#about')).toBeHidden();
  await expect(page.locator('.panel-bar')).toBeHidden();
  const art = page.locator('.tech-illustration');
  await expect(art).toBeVisible();
  await expect(art).toHaveCSS('pointer-events', 'none');
  expect(await art.locator('.ti-radar-sweep').evaluate(el => getComputedStyle(el).animationName)).toBe('radar-sweep');
  await expect(art.locator('.ti-pulse').first()).toBeVisible();
  await page.screenshot({ path: 'test-results/home-hub.png' });
});

test('choosing an entry opens only that section and the back control restores the hub', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /学习记录/ }).click();
  await expect(page).toHaveURL(/#articles$/);
  await expect(page.locator('#articles')).toBeVisible();
  await expect(page.locator('#projects')).toBeHidden();
  await expect(page.locator('#about')).toBeHidden();
  await expect(page.locator('.hub')).toBeHidden();
  await expect(page.locator('.panel-bar')).toBeVisible();
  await expect(page.locator('.panel-label')).toHaveText('学习记录');
  await expect(page.locator('.article-row')).toHaveCount(28);
  await page.getByRole('button', { name: '返回入口' }).click();
  await expect(page.locator('.hub')).toBeVisible();
  await expect(page.locator('#articles')).toBeHidden();
  expect(await page.evaluate(() => location.hash)).toBe('');
});

test('deep links open the matching section and browser back returns to the hub', async ({ page }) => {
  await page.goto('/#about');
  await expect(page.locator('#about')).toBeVisible();
  await expect(page.locator('.hub')).toBeHidden();
  await page.goto('/');
  await page.getByRole('link', { name: /项目/ }).click();
  await expect(page.locator('#projects')).toBeVisible();
  await page.goBack();
  await expect(page.locator('.hub')).toBeVisible();
  await expect(page.locator('#projects')).toBeHidden();
});

test('without JavaScript every section stays readable', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await expect(page.locator('.hub')).toBeVisible();
  await expect(page.locator('#projects')).toBeVisible();
  await expect(page.locator('#articles')).toBeVisible();
  await expect(page.locator('#about')).toBeVisible();
  await expect(page.locator('.article-row')).toHaveCount(28);
  await context.close();
});

test('illustration stops animating under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const selector of ['.ti-radar-sweep', '.ti-pulse', '.ti-blip', '.ti-code-caret', '.ti-frame']) {
    expect(await page.locator(selector).first().evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  }
});

test('mobile entry screen fits and keeps tappable choices', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('.tech-illustration')).toBeVisible();
  const heights = await page.locator('.hub-entry').evaluateAll(els => els.map(el => el.getBoundingClientRect().height));
  expect(heights.length).toBe(4);
  for (const height of heights) expect(height).toBeGreaterThanOrEqual(44);
});

test('article pages keep their own reading layout', async ({ page }) => {
  await page.goto('/posts/day-015/');
  await expect(page.locator('.hub')).toHaveCount(0);
  await expect(page.locator('.article-body')).toBeVisible();
});
