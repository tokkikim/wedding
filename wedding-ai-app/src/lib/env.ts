/**
 * 환경 변수 검증 및 관리
 *
 * Zod를 사용하여 타입 안전한 환경 변수 검증
 * 앱 시작 시 필수 환경 변수를 검증하여 런타임 에러를 방지합니다.
 *
 * @module lib/env
 */

import { z } from "zod";

/**
 * 환경 변수 스키마 정의
 *
 * 프로덕션에서 필수인 변수와 선택적 변수를 구분하여 정의
 */
const envSchema = z.object({
  // Node 환경
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // 데이터베이스 (필수)
  DATABASE_URL: z.string().url("유효한 데이터베이스 URL이 필요합니다."),

  // NextAuth (필수)
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET은 최소 32자 이상이어야 합니다."),
  NEXTAUTH_URL: z.string().url("유효한 NEXTAUTH_URL이 필요합니다."),

  // OAuth - Google (선택)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // OAuth - Kakao (선택)
  KAKAO_CLIENT_ID: z.string().optional(),
  KAKAO_CLIENT_SECRET: z.string().optional(),

  // AI - Gemini (선택)
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_IMAGE_MODEL: z.string().default("gemini-2.0-flash-exp"),

  // Cloudinary (선택)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Stripe (선택)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // 테스트용 (개발 환경에서만)
  TEST_SESSION_USER_ID: z.string().optional(),
});

/**
 * 환경 변수 타입
 */
export type Env = z.infer<typeof envSchema>;

/**
 * 파싱된 환경 변수
 *
 * 타입 안전한 환경 변수 접근
 */
let parsedEnv: Env | null = null;

/**
 * 환경 변수 검증 및 초기화
 *
 * 앱 시작 시 호출하여 환경 변수를 검증하고 파싱합니다.
 * 검증 실패 시 상세한 에러 메시지와 함께 예외 발생
 *
 * @throws {Error} 환경 변수 검증 실패 시
 *
 * @example
 * ```typescript
 * // instrumentation.ts
 * import { validateEnv } from '@/lib/env';
 *
 * export function register() {
 *   validateEnv();
 * }
 * ```
 */
export function validateEnv(): void {
  const isProduction = process.env.NODE_ENV === "production";

  // 프로덕션에서 테스트 환경 변수 사용 방지
  if (isProduction && process.env.TEST_SESSION_USER_ID) {
    throw new Error(
      "TEST_SESSION_USER_ID is not allowed in production environment"
    );
  }

  try {
    parsedEnv = envSchema.parse(process.env);

    // 프로덕션에서 OAuth 제공자 체크
    if (isProduction) {
      const hasGoogle =
        parsedEnv.GOOGLE_CLIENT_ID && parsedEnv.GOOGLE_CLIENT_SECRET;
      const hasKakao =
        parsedEnv.KAKAO_CLIENT_ID && parsedEnv.KAKAO_CLIENT_SECRET;

      if (!hasGoogle && !hasKakao) {
        console.warn(
          "⚠️  프로덕션 환경에서 OAuth 제공자가 설정되지 않았습니다."
        );
      }

      if (!parsedEnv.GEMINI_API_KEY) {
        console.warn("⚠️  GEMINI_API_KEY가 설정되지 않았습니다. 로컬 이미지 처리만 사용됩니다.");
      }

      if (!parsedEnv.CLOUDINARY_CLOUD_NAME) {
        console.warn("⚠️  Cloudinary가 설정되지 않았습니다.");
      }

      if (!parsedEnv.STRIPE_SECRET_KEY) {
        console.warn("⚠️  Stripe가 설정되지 않았습니다. 결제 기능이 비활성화됩니다.");
      }
    }

    console.log("✅ 환경 변수 검증 완료");
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ 환경 변수 검증 실패:");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });

      if (isProduction) {
        throw new Error(
          "필수 환경 변수가 올바르게 설정되지 않았습니다. 위 메시지를 확인하세요."
        );
      } else {
        console.warn(
          "⚠️  일부 기능이 제대로 작동하지 않을 수 있습니다. .env.example을 참조하세요."
        );
      }
    } else {
      throw error;
    }
  }
}

/**
 * 타입 안전한 환경 변수 접근
 *
 * @returns 파싱된 환경 변수 객체
 * @throws {Error} validateEnv()가 먼저 호출되지 않은 경우
 *
 * @example
 * ```typescript
 * import { getEnv } from '@/lib/env';
 *
 * const env = getEnv();
 * const dbUrl = env.DATABASE_URL; // 타입 안전
 * ```
 */
export function getEnv(): Env {
  if (!parsedEnv) {
    // 런타임에 파싱 시도
    parsedEnv = envSchema.parse(process.env);
  }

  return parsedEnv;
}

/**
 * 개별 환경 변수 가져오기
 *
 * @param key - 환경 변수 키
 * @returns 환경 변수 값
 *
 * @example
 * ```typescript
 * const dbUrl = getEnvVar('DATABASE_URL');
 * ```
 */
export function getEnvVar<K extends keyof Env>(key: K): Env[K] {
  return getEnv()[key];
}

/**
 * Boolean 환경 변수 가져오기
 *
 * @param key - 환경 변수 키
 * @param defaultValue - 기본값
 * @returns boolean 값
 *
 * @example
 * ```typescript
 * const isDebug = getBooleanEnv('DEBUG', false);
 * ```
 */
export function getBooleanEnv(key: string, defaultValue = false): boolean {
  const value = process.env[key];

  if (value === undefined) {
    return defaultValue;
  }

  return value === "true" || value === "1";
}
