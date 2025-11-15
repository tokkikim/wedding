import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to all main pages', async ({ page }) => {
    await page.goto('/');

    // 갤러리 페이지로 이동
    await page.getByRole('link', { name: /갤러리/i }).click();
    await expect(page).toHaveURL(/\/gallery/);

    // 가격 페이지로 이동
    await page.getByRole('link', { name: /가격/i }).click();
    await expect(page).toHaveURL(/\/pricing/);

    // 홈으로 돌아가기
    await page.getByRole('link', { name: /WeddingAI/i }).first().click();
    await expect(page).toHaveURL('/');
  });

  test('should redirect to signin when accessing protected pages', async ({ page }) => {
    // 로그인 없이 업로드 페이지 접근
    await page.goto('/upload');

    // 로그인 페이지 또는 로그인 필요 메시지 확인
    const isSigninPage = page.url().includes('/auth/signin');
    const hasLoginMessage = await page.getByText(/로그인이 필요합니다/i).isVisible().catch(() => false);

    expect(isSigninPage || hasLoginMessage).toBeTruthy();
  });

  test('should show signin page', async ({ page }) => {
    await page.goto('/auth/signin');

    // 로그인 페이지 요소 확인
    await expect(page).toHaveURL(/\/auth\/signin/);

    // 소셜 로그인 버튼 확인 (있다면)
    const hasGoogleButton = await page.getByText(/Google/i).isVisible().catch(() => false);
    const hasKakaoButton = await page.getByText(/Kakao/i).isVisible().catch(() => false);

    // 최소한 하나의 로그인 옵션은 있어야 함
    expect(hasGoogleButton || hasKakaoButton).toBeTruthy();
  });
});
