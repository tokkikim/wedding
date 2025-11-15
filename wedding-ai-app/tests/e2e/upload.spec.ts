import { test, expect } from '@playwright/test';

test.describe('Upload Page (Unauthenticated)', () => {
  test('should show login requirement when not authenticated', async ({ page }) => {
    await page.goto('/upload');

    // 로그인 필요 메시지 또는 리다이렉트 확인
    const isSigninRedirect = page.url().includes('/auth/signin');
    const hasLoginMessage = await page.getByText(/로그인이 필요합니다/i).isVisible().catch(() => false);
    const hasLoginButton = await page.getByRole('button', { name: /로그인하기/i }).isVisible().catch(() => false);

    expect(isSigninRedirect || hasLoginMessage || hasLoginButton).toBeTruthy();
  });
});

test.describe('Upload Page UI Elements', () => {
  test.skip('should display all upload form elements when authenticated', async ({ page }) => {
    // Note: 이 테스트는 실제 인증이 필요하므로 skip
    // 실제 환경에서는 테스트 사용자로 로그인 후 테스트해야 함

    await page.goto('/upload');

    // 페이지 제목 확인
    await expect(page.getByRole('heading', { name: /AI 웨딩 사진 생성/ })).toBeVisible();

    // 이미지 업로드 섹션 확인
    await expect(page.getByText(/1. 사진 업로드/)).toBeVisible();

    // 스타일 선택 섹션 확인
    await expect(page.getByText(/2. 웨딩 스타일 선택/)).toBeVisible();

    // 웨딩 스타일 옵션 확인
    await expect(page.getByText('클래식')).toBeVisible();
    await expect(page.getByText('모던')).toBeVisible();
    await expect(page.getByText('빈티지')).toBeVisible();
    await expect(page.getByText('야외')).toBeVisible();

    // 생성 버튼 확인 (초기에는 비활성화)
    const generateButton = page.getByRole('button', { name: /AI 웨딩 사진 생성하기/ });
    await expect(generateButton).toBeVisible();
    await expect(generateButton).toBeDisabled();
  });

  test.skip('should enable generate button when image and style are selected', async ({ page }) => {
    // Note: 실제 파일 업로드 및 스타일 선택 테스트
    // 인증 필요

    await page.goto('/upload');

    // 파일 업로드 시뮬레이션
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake image data'),
    });

    // 스타일 선택
    await page.getByText('클래식').click();

    // 생성 버튼 활성화 확인
    const generateButton = page.getByRole('button', { name: /AI 웨딩 사진 생성하기/ });
    await expect(generateButton).toBeEnabled();
  });
});
