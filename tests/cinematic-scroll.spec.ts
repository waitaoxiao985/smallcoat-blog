import { test, expect } from '@playwright/test';

test('project panel scrubs and reverses its pinned stage', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('[data-hub-link="projects"]').click();
  await expect(page.locator('#projects')).toBeVisible();
  await expect.poll(() => page.locator('#projects').evaluate(el => getComputedStyle(el).transform)).toBe('none');
  await expect(page.locator('html')).toHaveAttribute('data-cinematic', 'true');
  const seek = async (progress: number) => {
    await page.evaluate(p => { const el = document.querySelector<HTMLElement>('#projects')!; window.scrollTo({ top: el.offsetTop + (el.offsetHeight - innerHeight) * p, behavior: 'instant' }); }, progress);
  };
  const titles = await page.locator('.project-title').evaluateAll(elements => elements.map(element => element.textContent!.trim()));
  expect(titles.length).toBe(3);
  const activeTitle = () => page.locator('.project[data-active="true"] .project-title');
  await seek(.5);
  await expect(activeTitle()).toHaveText(titles[1]);
  const stageTop = await page.locator('.projects-stage').evaluate(el => el.getBoundingClientRect().top);
  expect(Math.abs(stageTop - 56)).toBeLessThan(2);
  await seek(1);
  await expect(activeTitle()).toHaveText(titles[2]);
  await seek(0);
  await expect(activeTitle()).toHaveText(titles[0]);
  await page.getByRole('button', { name: '展示项目 3' }).click();
  await expect(activeTitle()).toHaveText(titles[2]);
  await page.screenshot({ path: 'test-results/project-stage.png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('mid-scroll positions never show overlapping semi-transparent project cards', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#projects');
  await expect(page.locator('html')).toHaveAttribute('data-cinematic', 'true');

  for (const progress of [0.15, 0.24, 0.26, 0.35, 0.65, 0.74, 0.76]) {
    await page.evaluate((p) => {
      const el = document.querySelector<HTMLElement>('#projects')!;
      window.scrollTo({ top: el.offsetTop + (el.offsetHeight - innerHeight) * p, behavior: 'instant' });
    }, progress);

    await expect.poll(async () => {
      const states = await page.locator('#projects .project').evaluateAll((els) =>
        els.map((el) => ({
          active: el.dataset.active,
          opacity: getComputedStyle(el).opacity,
          visibility: getComputedStyle(el).visibility,
        })),
      );
      const visible = states.filter((s) => s.opacity === '1' && s.visibility === 'visible');
      const hidden = states.filter((s) => s.opacity === '0' && s.visibility === 'hidden');
      return visible.length === 1 && hidden.length === 2 && visible[0].active === 'true';
    }).toBe(true);
  }
});

test('wheel steps cleanly one project card at a time and releases at footer', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#projects');
  await expect(page.locator('html')).toHaveAttribute('data-cinematic', 'true');

  const position = page.locator('.project-position');
  await expect(position).toHaveText('01 / 03');

  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 120);
  await expect(position).toHaveText('02 / 03');
  await expect.poll(async () => page.evaluate(() => {
    const el = document.querySelector<HTMLElement>('#projects')!;
    const expected = el.offsetTop + (el.offsetHeight - innerHeight) * 0.5;
    return Math.abs(window.scrollY - expected) < 8;
  })).toBe(true);

  await page.waitForTimeout(450);
  await page.mouse.wheel(0, 120);
  await expect(position).toHaveText('03 / 03');

  await page.waitForTimeout(450);
  await page.mouse.wheel(0, -120);
  await expect(position).toHaveText('02 / 03');

  await page.waitForTimeout(450);
  await page.mouse.wheel(0, 120);
  await expect(position).toHaveText('03 / 03');
  await expect.poll(async () => page.evaluate(() => {
    const el = document.querySelector<HTMLElement>('#projects')!;
    const expected = el.offsetTop + (el.offsetHeight - innerHeight);
    return Math.abs(window.scrollY - expected) < 8;
  })).toBe(true);

  await page.waitForTimeout(450);
  const beforeFooterWheel = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 120);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(beforeFooterWheel);
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
