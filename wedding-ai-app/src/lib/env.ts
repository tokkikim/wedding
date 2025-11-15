/**
 * 환경 변수 검증 및 관리
 *
 * 앱 시작 시 필수 환경 변수를 검증하여 런타임 에러를 방지합니다.
 */

// 프로덕션 환경에서 필수인 환경 변수
const requiredProductionEnvVars = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
] as const;

// 개발 환경을 포함한 모든 환경에서 권장되는 환경 변수
const recommendedEnvVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "KAKAO_CLIENT_ID",
  "KAKAO_CLIENT_SECRET",
  "GEMINI_API_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
] as const;

/**
 * 환경 변수 검증
 *
 * 프로덕션 환경에서 필수 환경 변수가 없으면 에러를 발생시킵니다.
 * 개발 환경에서는 경고만 표시합니다.
 */
export function validateEnv(): void {
  const isProduction = process.env.NODE_ENV === "production";

  // 필수 환경 변수 체크
  const missingRequired = requiredProductionEnvVars.filter(
    (key) => !process.env[key]
  );

  if (missingRequired.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingRequired.join(", ")}`;

    if (isProduction) {
      throw new Error(errorMessage);
    } else {
      console.warn(`⚠️  ${errorMessage}`);
    }
  }

  // 권장 환경 변수 체크 (경고만)
  const missingRecommended = recommendedEnvVars.filter(
    (key) => !process.env[key]
  );

  if (missingRecommended.length > 0 && !isProduction) {
    console.warn(
      `⚠️  Missing recommended environment variables: ${missingRecommended.join(", ")}`
    );
    console.warn(
      "   Some features may not work correctly. See env.example for details."
    );
  }

  // 프로덕션에서 테스트 환경 변수 사용 방지
  if (isProduction && process.env.TEST_SESSION_USER_ID) {
    throw new Error(
      "TEST_SESSION_USER_ID is not allowed in production environment"
    );
  }
}

/**
 * 환경 변수를 안전하게 가져오기
 *
 * @param key - 환경 변수 키
 * @param defaultValue - 기본값 (선택사항)
 * @returns 환경 변수 값 또는 기본값
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];

  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new Error(`Environment variable ${key} is not defined`);
  }

  return value;
}

/**
 * 선택적 환경 변수 가져오기
 *
 * @param key - 환경 변수 키
 * @returns 환경 변수 값 또는 undefined
 */
export function getOptionalEnv(key: string): string | undefined {
  return process.env[key];
}

/**
 * Boolean 환경 변수 가져오기
 *
 * @param key - 환경 변수 키
 * @param defaultValue - 기본값
 * @returns boolean 값
 */
export function getBooleanEnv(key: string, defaultValue = false): boolean {
  const value = process.env[key];

  if (value === undefined) {
    return defaultValue;
  }

  return value === "true" || value === "1";
}
