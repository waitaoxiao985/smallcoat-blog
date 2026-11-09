import { test, expect } from '@playwright/test';

test('project panel scrubs and reverses its pinned stage', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('[data-hub-link="projects"]').click();
  await expect(page.locator('#projects')).toBeVisible();
  await page.evaluate(() => Promise.allSettled(document.getAnimations().map(animation => animation.finished)));
  await expect(page.locator('html')).toHaveAttribute('data-cinematic', 'true');
  const seek = async (progress: number) => {
    await page.evaluate(p => { const el = document.querySelector<HTMLElement>('#projects')!; window.scrollTo({ top: el.offsetTop + (el.offsetHeight - innerHeight) * p, behavior: 'instant' }); }, progress);
  };
  await seek(.5);
  await expect(page.locator('.project[data-active="true"] .project-title')).toHaveText('Cyber_Platform');
  const stageTop = await page.locator('.projects-stage').evaluate(el => el.getBoundingClientRect().top);
  expect(Math.abs(stageTop - 56)).toBeLessThan(2);
  await seek(1);
  await expect(page.locator('.project[data-active="true"] .project-title')).toHaveText('CyberSpace_Notes');
  await seek(0);
  await expect(page.locator('.project[data-active="true"] .project-title')).toHaveText('SecGuard');
  await page.getByRole('button', { name: '展示项目 3' }).click();
  await expect(page.locator('.project[data-active="true"] .project-title')).toHaveText('CyberSpace_Notes');
  await page.screenshot({ path: 'test-results/project-stage.png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('mobile, reduced motion and no-JS keep the three normal project links', async ({ browser, baseURL }) => {
  for (const options of [{ viewport: { width: 390, height: 844 } }, { reducedMotion: 'reduce' as const }]) {
    const context = await browser.newContext(options);
    const page = await context.newPage();
    await page.goto(baseURL!);
    await page.locator('[data-hub-link="projects"]').click();
    await expect(page.locator('html')).not.toHaveAttribute('data-cinematic');
    await expect(page.locator('.project')).toHaveCount(3);
    await expect(page.locator('.project[inert]')).toHaveCount(0);
    for (const project of await page.locator('.project').all()) await expect(project).toBeVisible();
    await context.close();
  }
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await expect(page.locator('#projects')).toBeVisible();
  await expect(page.locator('.project')).toHaveCount(3);
  await context.close();
});

test('changing motion preference restores the normal project list', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('[data-hub-link="projects"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-cinematic', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).not.toHaveAttribute('data-cinematic');
  await expect(page.locator('.project[inert]')).toHaveCount(0);
  expect(await page.locator('.project').first().evaluate(el => getComputedStyle(el).transform)).toBe('none');
});
