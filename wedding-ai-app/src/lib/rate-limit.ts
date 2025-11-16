/**
 * API Rate Limiting
 *
 * 과도한 API 요청을 방지하기 위한 속도 제한 시스템
 * 현재는 인메모리 방식이며, 프로덕션에서는 Redis 기반으로 교체 권장
 *
 * @module lib/rate-limit
 */

import { RateLimitError } from "./error-handler";

interface RateLimitConfig {
  /**
   * 시간 윈도우 (밀리초)
   * @default 60000 (1분)
   */
  windowMs: number;

  /**
   * 시간 윈도우 내 최대 요청 수
   * @default 10
   */
  maxRequests: number;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

/**
 * 인메모리 Rate Limiter
 *
 * 주의: 서버리스 환경에서는 각 인스턴스마다 별도의 메모리를 사용하므로
 * 프로덕션에서는 Redis 같은 공유 저장소 사용 권장
 */
class InMemoryRateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      windowMs: config.windowMs || 60000, // 기본 1분
      maxRequests: config.maxRequests || 10, // 기본 10회
    };

    // 메모리 정리를 위한 주기적 cleanup (5분마다)
    if (typeof setInterval !== "undefined") {
      setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  /**
   * 요청 허용 여부 확인
   *
   * @param identifier - 식별자 (보통 userId 또는 IP)
   * @returns 허용 여부와 남은 횟수, 리셋 시간
   */
  async check(identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
  }> {
    const now = Date.now();
    const record = this.store.get(identifier);

    // 기록이 없거나 시간 윈도우가 지난 경우
    if (!record || now >= record.resetAt) {
      const newRecord: RateLimitRecord = {
        count: 1,
        resetAt: now + this.config.windowMs,
      };
      this.store.set(identifier, newRecord);

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetAt: newRecord.resetAt,
      };
    }

    // 제한 초과
    if (record.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.resetAt,
      };
    }

    // 카운트 증가
    record.count++;
    this.store.set(identifier, record);

    return {
      allowed: true,
      remaining: this.config.maxRequests - record.count,
      resetAt: record.resetAt,
    };
  }

  /**
   * 만료된 레코드 정리
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now >= record.resetAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * 특정 식별자의 제한 초기화
   *
   * @param identifier - 식별자
   */
  async reset(identifier: string): Promise<void> {
    this.store.delete(identifier);
  }
}

/**
 * Rate Limiter 인스턴스들
 */
const limiters = {
  // API 전체에 대한 일반적인 제한 (분당 60회)
  general: new InMemoryRateLimiter({ windowMs: 60000, maxRequests: 60 }),

  // 이미지 생성 API (분당 5회)
  imageGeneration: new InMemoryRateLimiter({ windowMs: 60000, maxRequests: 5 }),

  // 결제 API (분당 10회)
  payment: new InMemoryRateLimiter({ windowMs: 60000, maxRequests: 10 }),

  // 로그인 시도 (5분당 5회)
  auth: new InMemoryRateLimiter({ windowMs: 5 * 60000, maxRequests: 5 }),
};

/**
 * Rate Limit 타입
 */
export type RateLimitType = keyof typeof limiters;

/**
 * Rate Limit 체크
 *
 * @param identifier - 식별자 (userId 또는 IP)
 * @param type - Rate Limit 타입
 * @throws {RateLimitError} 제한 초과 시
 *
 * @example
 * ```typescript
 * // API 라우트에서 사용
 * export async function POST(request: NextRequest) {
 *   const userId = await getUserId(request);
 *   await checkRateLimit(userId, 'imageGeneration');
 *
 *   // 로직 계속...
 * }
 * ```
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = "general"
): Promise<void> {
  const limiter = limiters[type];
  const result = await limiter.check(identifier);

  if (!result.allowed) {
    const resetInSeconds = Math.ceil((result.resetAt - Date.now()) / 1000);
    throw new RateLimitError(
      `요청 한도를 초과했습니다. ${resetInSeconds}초 후에 다시 시도하세요.`
    );
  }
}

/**
 * Rate Limit 정보 조회 (헤더 추가용)
 *
 * @param identifier - 식별자
 * @param type - Rate Limit 타입
 * @returns Rate Limit 정보
 *
 * @example
 * ```typescript
 * const info = await getRateLimitInfo(userId, 'imageGeneration');
 * return NextResponse.json(data, {
 *   headers: {
 *     'X-RateLimit-Limit': String(info.limit),
 *     'X-RateLimit-Remaining': String(info.remaining),
 *     'X-RateLimit-Reset': String(info.resetAt),
 *   }
 * });
 * ```
 */
export async function getRateLimitInfo(
  identifier: string,
  type: RateLimitType = "general"
): Promise<{
  limit: number;
  remaining: number;
  resetAt: number;
}> {
  const limiter = limiters[type];
  const config =
    type === "general"
      ? { maxRequests: 60 }
      : type === "imageGeneration"
        ? { maxRequests: 5 }
        : type === "payment"
          ? { maxRequests: 10 }
          : { maxRequests: 5 };

  const result = await limiter.check(identifier);

  return {
    limit: config.maxRequests,
    remaining: result.remaining,
    resetAt: result.resetAt,
  };
}

/**
 * Rate Limit 초기화
 *
 * @param identifier - 식별자
 * @param type - Rate Limit 타입
 */
export async function resetRateLimit(
  identifier: string,
  type: RateLimitType = "general"
): Promise<void> {
  const limiter = limiters[type];
  await limiter.reset(identifier);
}

/**
 * IP 주소 추출 헬퍼
 *
 * @param request - Next.js Request 객체
 * @returns IP 주소
 */
export function getClientIp(request: Request): string {
  // Vercel, Cloudflare 등의 프록시 헤더 확인
  const headers = request.headers;
  const forwarded = headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // 기본값
  return "unknown";
}
