import { test, expect } from '@playwright/test';

test('desktop scroll scrubs and reverses the hero and pinned project stage', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-cinematic', 'true');
  const hero = page.locator('.hero-content');
  const first = await hero.evaluate(el => getComputedStyle(el).transform);
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }));
  await expect.poll(() => hero.evaluate(el => getComputedStyle(el).transform)).not.toBe(first);
  const seek = async (progress: number) => {
    await page.evaluate(p => { const el = document.querySelector<HTMLElement>('#projects')!; window.scrollTo({ top: el.offsetTop + (el.offsetHeight - innerHeight) * p, behavior: 'instant' }); }, progress);
  };
  await seek(.5);
  await expect(page.locator('.project[data-active="true"] .project-title')).toHaveText('Cyber_Platform');
  await expect(page.locator('.project').nth(1)).not.toHaveAttribute('inert');
  const stageTop = await page.locator('.projects-stage').evaluate(el => el.getBoundingClientRect().top);
  expect(Math.abs(stageTop)).toBeLessThan(2);
  await seek(1);
  await expect(page.locator('.project[data-active="true"] .project-title')).toHaveText('CyberSpace_Notes');
  await seek(0);
  await expect(page.locator('.project[data-active="true"] .project-title')).toHaveText('SecGuard');
  await page.getByRole('button', { name: '展示项目 3' }).click();
  await expect(page.locator('.project[data-active="true"] .project-title')).toHaveText('CyberSpace_Notes');
  await page.screenshot({ path: 'test-results/cinematic-projects.png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('.article-row')).toHaveCount(28);
});

test('mobile, reduced motion and no-JS retain all three normal project links', async ({ browser, baseURL }) => {
  for (const options of [{ viewport: { width: 390, height: 844 } }, { reducedMotion: 'reduce' as const }, { javaScriptEnabled: false }]) {
    const context = await browser.newContext(options);
    const page = await context.newPage();
    await page.goto(baseURL!);
    await expect(page.locator('html')).not.toHaveAttribute('data-cinematic');
    await expect(page.locator('.project')).toHaveCount(3);
    await expect(page.locator('.project[inert]')).toHaveCount(0);
    for (const project of await page.locator('.project').all()) await expect(project).toBeVisible();
    await context.close();
  }
});

test('changing motion preference restores visible normal flow without stale transforms', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-cinematic', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).not.toHaveAttribute('data-cinematic');
  await expect(page.locator('.project[inert]')).toHaveCount(0);
  await expect(page.locator('.hero-content')).toHaveCSS('transform', 'none');
});
