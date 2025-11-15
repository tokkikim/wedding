import { test, expect } from '@playwright/test';

test.describe('API Health Check', () => {
  test('should return successful health check', async ({ request }) => {
    const response = await request.get('/api/health');

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe('ok');
  });
});

test.describe('API Error Handling', () => {
  test('should return 401 for unauthorized generate request', async ({ request }) => {
    const formData = new FormData();
    formData.append('image', 'fake-data');
    formData.append('style', 'classic');
    formData.append('prompt', 'test prompt');

    const response = await request.post('/api/generate', {
      multipart: {
        image: 'fake-data',
        style: 'classic',
        prompt: 'test prompt',
      },
    });

    // 인증되지 않은 요청은 401 반환
    expect(response.status()).toBe(401);
  });

  test('should return 401 for unauthorized payment intent', async ({ request }) => {
    const response = await request.post('/api/payment/create-intent', {
      data: {
        credits: 10,
      },
    });

    // 인증되지 않은 요청은 401 반환
    expect(response.status()).toBe(401);
  });
});
