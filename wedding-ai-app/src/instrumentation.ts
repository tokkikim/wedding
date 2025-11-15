/**
 * Next.js Instrumentation
 *
 * 앱 시작 시 실행되는 코드를 정의합니다.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // 서버 사이드에서만 실행
    const { validateEnv } = await import("./lib/env");

    try {
      validateEnv();
      console.log("✓ Environment variables validated successfully");
    } catch (error) {
      console.error("✗ Environment validation failed:", error);

      // 프로덕션에서는 앱 시작을 중단
      if (process.env.NODE_ENV === "production") {
        throw error;
      }
    }
  }
}
