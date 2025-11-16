/**
 * 에러 처리 유틸리티
 *
 * 애플리케이션 전반의 에러를 로깅하고 추적하기 위한 유틸리티
 *
 * @module lib/error-handler
 */

import { prisma } from "./prisma";

export interface ErrorLogOptions {
  userId?: string;
  context: string;
  metadata?: Record<string, unknown>;
}

/**
 * 에러를 데이터베이스에 로깅
 *
 * @param error - 발생한 에러
 * @param options - 로깅 옵션 (userId, context, metadata)
 * @returns 생성된 에러 로그 ID
 *
 * @example
 * ```typescript
 * try {
 *   await someOperation();
 * } catch (error) {
 *   await logError(error, {
 *     userId: session.user.id,
 *     context: 'image-generation',
 *     metadata: { imageId: '123' }
 *   });
 * }
 * ```
 */
export async function logError(
  error: unknown,
  options: ErrorLogOptions
): Promise<string> {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  try {
    const errorLog = await prisma.errorLog.create({
      data: {
        userId: options.userId,
        error: errorMessage,
        context: options.context,
        stack,
        metadata: options.metadata as never,
      },
    });

    // 프로덕션 환경에서는 외부 모니터링 서비스로 전송
    // 예: Sentry, DataDog, LogRocket 등
    if (process.env.NODE_ENV === "production") {
      // TODO: Sentry 등의 서비스로 전송
      // Sentry.captureException(error, { user: { id: options.userId }, contexts: { ...options.metadata } });
    }

    return errorLog.id;
  } catch (logError) {
    // 로깅 실패 시 콘솔에만 출력
    console.error("Failed to log error to database:", logError);
    console.error("Original error:", error);
    throw logError;
  }
}

/**
 * API 응답을 위한 에러 포맷팅
 *
 * @param error - 발생한 에러
 * @param defaultMessage - 기본 에러 메시지
 * @returns 포맷된 에러 메시지
 *
 * @example
 * ```typescript
 * catch (error) {
 *   return NextResponse.json(
 *     { success: false, error: formatErrorMessage(error, '작업 실패') },
 *     { status: 500 }
 *   );
 * }
 * ```
 */
export function formatErrorMessage(
  error: unknown,
  defaultMessage = "오류가 발생했습니다."
): string {
  if (error instanceof Error) {
    // 개발 환경에서는 자세한 에러 메시지 반환
    if (process.env.NODE_ENV === "development") {
      return error.message;
    }
    // 프로덕션에서는 일반적인 메시지만 반환 (보안)
    return defaultMessage;
  }

  return defaultMessage;
}

/**
 * 에러 타입별 HTTP 상태 코드 반환
 *
 * @param error - 발생한 에러
 * @returns HTTP 상태 코드
 *
 * @example
 * ```typescript
 * catch (error) {
 *   const statusCode = getErrorStatusCode(error);
 *   return NextResponse.json({ error: 'Failed' }, { status: statusCode });
 * }
 * ```
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof Error) {
    // 커스텀 에러 클래스들
    if (error.name === "ValidationError") return 400;
    if (error.name === "UnauthorizedError") return 401;
    if (error.name === "ForbiddenError") return 403;
    if (error.name === "NotFoundError") return 404;
    if (error.name === "ConflictError") return 409;
    if (error.name === "RateLimitError") return 429;
  }

  return 500; // 기본값: Internal Server Error
}

/**
 * 커스텀 에러 클래스들
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "인증이 필요합니다.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "권한이 없습니다.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "리소스를 찾을 수 없습니다.") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  constructor(message = "중복된 리소스가 존재합니다.") {
    super(message);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends Error {
  constructor(message = "요청 한도를 초과했습니다.") {
    super(message);
    this.name = "RateLimitError";
  }
}

/**
 * 에러 핸들러 래퍼 함수
 *
 * API 라우트를 감싸서 자동으로 에러 처리
 *
 * @param handler - API 핸들러 함수
 * @param context - 에러 컨텍스트
 * @returns 래핑된 핸들러
 *
 * @example
 * ```typescript
 * export const POST = withErrorHandler(async (request) => {
 *   // 로직
 * }, 'api/generate');
 * ```
 */
export function withErrorHandler<T>(
  handler: (request: Request) => Promise<T>,
  context: string
) {
  return async (request: Request): Promise<T> => {
    try {
      return await handler(request);
    } catch (error) {
      await logError(error, { context });
      throw error;
    }
  };
}
