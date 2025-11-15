import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    // 페이지 제목 확인
    await expect(page).toHaveTitle(/WeddingAI/);

    // 주요 헤딩 확인
    await expect(page.getByRole('heading', { name: /AI로 만드는 완벽한/ })).toBeVisible();

    // CTA 버튼 확인
    await expect(page.getByRole('link', { name: /지금 시작하기/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /샘플 갤러리 보기/ })).toBeVisible();
  });

  test('should display features section', async ({ page }) => {
    await page.goto('/');

    // 주요 기능 섹션 확인
    await expect(page.getByText('왜 WeddingAI를 선택해야 할까요?')).toBeVisible();
    await expect(page.getByText('빠른 생성')).toBeVisible();
    await expect(page.getByText('다양한 스타일')).toBeVisible();
    await expect(page.getByText('안전한 보안')).toBeVisible();
  });

  test('should display how it works section', async ({ page }) => {
    await page.goto('/');

    // 작동 방식 섹션 확인
    await expect(page.getByText('어떻게 작동하나요?')).toBeVisible();
    await expect(page.getByText('사진 업로드')).toBeVisible();
    await expect(page.getByText('스타일 선택')).toBeVisible();
    await expect(page.getByText('결과 확인')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');

    // "지금 시작하기" 버튼 클릭
    await page.getByRole('link', { name: /지금 시작하기/ }).first().click();

    // 업로드 페이지로 이동 확인
    await expect(page).toHaveURL(/\/upload/);
  });
});
