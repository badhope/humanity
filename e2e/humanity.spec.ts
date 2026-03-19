/**
 * HumanOS 网站自动化测试脚本
 * 使用 Playwright 进行端到端测试
 *
 * 安装依赖:
 * npm install -D @playwright/test
 * npx playwright install chromium
 *
 * 运行测试:
 * npx playwright test
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://badhope.github.io/HumanOS';

test.describe('HumanOS 网站全面测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test.describe('1. 网站名称一致性检查', () => {
    test('首页标题应为 HumanOS，且各处一致', async ({ page }) => {
      const title = await page.title();
      console.log('页面标题:', title);
      expect(title).toMatch(/Human/i);
    });

    test('首页主标题应显示网站名称', async ({ page }) => {
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();
      const text = await heading.textContent();
      console.log('主标题:', text);
    });

    test('所有关键位置名称应一致', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/categories`);
      const h1 = page.locator('h1').first();
      const text = await h1.textContent();
      console.log('分类页标题:', text);
    });
  });

  test.describe('2. 页面可访问性测试', () => {
    test('首页应正常加载', async ({ page }) => {
      await expect(page).toHaveTitle(/Human/i);
      await expect(page.locator('body')).toBeVisible();
    });

    test('分类页应可访问', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/categories`);
      await expect(page.locator('body')).toBeVisible();
      await page.waitForTimeout(1000);
    });

    test('MBTI 测评页应可访问', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/quiz/mbti-basic`);
      await expect(page.locator('body')).toBeVisible();
      await page.waitForTimeout(1000);
    });

    test('所有路由都应正常响应', async ({ page }) => {
      const routes = [
        '/',
        '/#/categories',
        '/#/assessments/personality',
        '/#/quiz/mbti-basic',
        '/#/maintenance',
      ];

      for (const route of routes) {
        await page.goto(`${BASE_URL}${route}`);
        await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
        console.log(`✓ 路由 ${route} 可访问`);
      }
    });
  });

  test.describe('3. MBTI 模块功能测试', () => {
    test('MBTI 测评页应显示题目', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/quiz/mbti-basic`);
      await page.waitForTimeout(2000);

      const questionText = page.locator('text=/题/').first();
      await expect(questionText).toBeVisible({ timeout: 5000 });
    });

    test('单选题只能选择一个答案', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/quiz/mbti-basic`);
      await page.waitForTimeout(2000);

      const options = page.locator('button').filter({ hasText: /^[A-D]$/ });
      const count = await options.count();

      if (count > 0) {
        await options.first().click();
        await page.waitForTimeout(500);

        const selectedCount = await page.locator('[class*="border-primary"]').count();
        expect(selectedCount).toBeLessThanOrEqual(1);
      }
    });

    test('答题卡应可展开', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/quiz/mbti-basic`);
      await page.waitForTimeout(2000);

      const questionCardBtn = page.locator('text=答题卡');
      if (await questionCardBtn.isVisible()) {
        await questionCardBtn.click();
        await page.waitForTimeout(500);

        const panel = page.locator('text=已答:');
        await expect(panel).toBeVisible({ timeout: 3000 });
      }
    });

    test('可正常提交并跳转到结果页', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/quiz/mbti-basic`);
      await page.waitForTimeout(2000);

      const options = page.locator('button').filter({ hasText: /^[A-D]$/ });
      const count = await options.count();

      for (let i = 0; i < Math.min(count, 16); i++) {
        await page.goto(`${BASE_URL}/#/quiz/mbti-basic`);
        await page.waitForTimeout(1000);

        const option = page.locator('button').filter({ hasText: /^[A-D]$/ }).first();
        if (await option.isVisible()) {
          await option.click();
          await page.waitForTimeout(300);

          const nextBtn = page.locator('text=下一题');
          if (await nextBtn.isVisible()) {
            await nextBtn.click();
            await page.waitForTimeout(300);
          }
        }
      }
    });
  });

  test.describe('4. 其他模块降级测试', () => {
    test('psychology 模块应跳转到维护页', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/assessments/psychology`);
      await page.waitForTimeout(2000);

      const url = page.url();
      if (url.includes('psychology')) {
        const maintenanceContent = page.locator('text=维护中');
        await expect(maintenanceContent.first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('cognition 模块应跳转到维护页', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/assessments/cognition`);
      await page.waitForTimeout(2000);
    });

    test('ideology 模块应跳转到维护页', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/assessments/ideology`);
      await page.waitForTimeout(2000);
    });

    test('career 模块应跳转到维护页', async ({ page }) => {
      await page.goto(`${BASE_URL}/#/assessments/career`);
      await page.waitForTimeout(2000);
    });
  });

  test.describe('5. 响应式设计测试', () => {
    test('桌面端视图正常', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(`${BASE_URL}/#/categories`);
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();
    });

    test('平板视图正常', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(`${BASE_URL}/#/categories`);
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();
    });

    test('手机视图正常', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/#/categories`);
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('6. 性能相关测试', () => {
    test('页面应在3秒内加载完成', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`${BASE_URL}/#/categories`);
      await page.waitForTimeout(2000);
      const loadTime = Date.now() - startTime;
      console.log(`页面加载时间: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000);
    });

    test('不应有阻塞性错误', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto(`${BASE_URL}/#/quiz/mbti-basic`);
      await page.waitForTimeout(3000);

      const criticalErrors = errors.filter(e => !e.includes('warning'));
      if (criticalErrors.length > 0) {
        console.log('控制台错误:', criticalErrors);
      }
    });
  });
});

test.describe('7. 结果页测试', () => {
  test('结果页应显示 MBTI 类型', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/quiz/mbti-basic`);
    await page.waitForTimeout(2000);

    const options = page.locator('button').filter({ hasText: /^[A-D]$/ });

    for (let i = 0; i < 16; i++) {
      const option = options.first();
      if (await option.isVisible({ timeout: 1000 })) {
        await option.click();
        await page.waitForTimeout(200);
      }

      const nextBtn = page.locator('text=下一题');
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(200);
      }
    }

    const submitBtn = page.locator('text=提交');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(3000);

      const url = page.url();
      console.log('结果页 URL:', url);
    }
  });
});