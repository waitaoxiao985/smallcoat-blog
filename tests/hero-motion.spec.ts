import { test, expect } from '@playwright/test';

test('entry screen keeps the animated grid sweep behind readable content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const light = await page.locator('.hero-grid').evaluate(el => {
    const style = getComputedStyle(el, '::after');
    return { content: style.content, animation: style.animationName, pointerEvents: style.pointerEvents };
  });
  expect(light.content).not.toBe('none');
  expect(light.animation).toBe('grid-sweep');
  expect(light.pointerEvents).toBe('none');
  const frames = await page.locator('.hero-grid').evaluate(el => {
    const animation = el.getAnimations({ subtree: true }).find(a => (a as CSSAnimation).animationName === 'grid-sweep')!;
    animation.pause();
    animation.currentTime = 2400;
    const first = getComputedStyle(el, '::after').transform;
    animation.currentTime = 6000;
    return { first, second: getComputedStyle(el, '::after').transform };
  });
  expect(frames.first).not.toBe(frames.second);
  await page.screenshot({ path: 'test-results/hub-grid.png' });
  await expect(page.getByRole('heading', { name: 'SmalLCoat', exact: true })).toBeVisible();
  await page.locator('[data-hub-link="projects"]').click();
  await expect(page).toHaveURL(/#projects$/);
});

test('reduced motion leaves the entry grid static', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const motion = await page.locator('.hero-grid').evaluate(el => ({
    sweep: getComputedStyle(el, '::after').animationName,
    glow: getComputedStyle(document.querySelector('.hub .hero-glow')!).animationName,
  }));
  expect(motion).toEqual({ sweep: 'none', glow: 'none' });
});

test('mobile entry screen fits and reading routes stay clean', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('[data-hub-link="articles"]').click();
  await expect(page.locator('.article-row')).toHaveCount(35);
  await page.goto('/posts/day-001/');
  await expect(page.locator('.hero-grid')).toHaveCount(0);
  await expect(page.locator('.article-body')).toBeVisible();
});
