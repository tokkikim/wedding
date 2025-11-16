/**
 * 성능 모니터링 및 최적화 유틸리티
 *
 * 데이터베이스 쿼리, API 호출, 컴포넌트 렌더링 성능 추적
 *
 * @module lib/performance
 */

import { prisma } from "./prisma";

/**
 * 성능 측정 결과
 */
export interface PerformanceMeasurement {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  metadata?: Record<string, unknown>;
}

/**
 * 함수 실행 시간 측정
 *
 * @param name - 측정 이름
 * @param fn - 실행할 함수
 * @param metadata - 추가 메타데이터
 * @returns 함수 실행 결과
 *
 * @example
 * ```typescript
 * const result = await measurePerformance('user-query', async () => {
 *   return await prisma.user.findMany();
 * }, { count: 100 });
 * ```
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;

    // 성능 로깅
    logPerformance({
      name,
      duration,
      startTime,
      endTime,
      metadata,
    });

    // 느린 쿼리 경고 (1초 이상)
    if (duration > 1000) {
      console.warn(
        `⚠️  Slow operation detected: ${name} took ${duration.toFixed(2)}ms`
      );
    }

    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    logPerformance({
      name,
      duration,
      startTime,
      endTime,
      metadata: { ...metadata, error: true },
    });

    throw error;
  }
}

/**
 * 데이터베이스 쿼리 성능 측정
 *
 * @param name - 쿼리 이름
 * @param query - 실행할 쿼리 함수
 * @param metadata - 추가 메타데이터
 * @returns 쿼리 결과
 *
 * @example
 * ```typescript
 * const users = await measureDbQuery('find-active-users', async () => {
 *   return await prisma.user.findMany({ where: { active: true } });
 * });
 * ```
 */
export async function measureDbQuery<T>(
  name: string,
  query: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  return measurePerformance(`db:${name}`, query, metadata);
}

/**
 * API 호출 성능 측정
 *
 * @param name - API 이름
 * @param apiCall - API 호출 함수
 * @param metadata - 추가 메타데이터
 * @returns API 응답
 *
 * @example
 * ```typescript
 * const data = await measureApiCall('gemini-generate', async () => {
 *   return await geminiClient.generate(prompt);
 * });
 * ```
 */
export async function measureApiCall<T>(
  name: string,
  apiCall: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  return measurePerformance(`api:${name}`, apiCall, metadata);
}

/**
 * 성능 데이터 로깅
 *
 * @param measurement - 성능 측정 결과
 */
function logPerformance(measurement: PerformanceMeasurement): void {
  // 개발 환경에서는 콘솔에 출력
  if (process.env.NODE_ENV === "development") {
    console.log(
      `⏱️  ${measurement.name}: ${measurement.duration.toFixed(2)}ms`,
      measurement.metadata
    );
  }

  // 프로덕션 환경에서는 외부 모니터링 서비스로 전송
  // TODO: DataDog, New Relic 등의 서비스 연동
}

/**
 * 데이터베이스 성능 메트릭 저장
 *
 * @param url - 요청 URL
 * @param userAgent - User Agent
 * @param metrics - 성능 메트릭
 * @param metadata - 추가 메타데이터
 */
export async function savePerformanceMetric(
  url: string,
  userAgent: string,
  metrics: Record<string, number>,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.performanceMetric.create({
      data: {
        url,
        userAgent,
        timestamp: new Date(),
        metrics: metrics as never,
        metadata: metadata as never,
      },
    });
  } catch (error) {
    console.error("Failed to save performance metric:", error);
  }
}

/**
 * 성능 메트릭 분석
 *
 * @param period - 분석 기간 (밀리초)
 * @returns 평균, 최소, 최대, 중앙값
 */
export async function analyzePerformanceMetrics(period: number = 24 * 60 * 60 * 1000): Promise<{
  average: number;
  min: number;
  max: number;
  median: number;
  count: number;
}> {
  const since = new Date(Date.now() - period);

  const metrics = await prisma.performanceMetric.findMany({
    where: {
      timestamp: {
        gte: since,
      },
    },
    select: {
      metrics: true,
    },
  });

  if (metrics.length === 0) {
    return { average: 0, min: 0, max: 0, median: 0, count: 0 };
  }

  // load 시간 추출 (예시)
  const loadTimes = metrics
    .map((m) => {
      const metricsData = m.metrics as { load?: number };
      return metricsData.load || 0;
    })
    .filter((time) => time > 0)
    .sort((a, b) => a - b);

  if (loadTimes.length === 0) {
    return { average: 0, min: 0, max: 0, median: 0, count: 0 };
  }

  const sum = loadTimes.reduce((acc, time) => acc + time, 0);
  const average = sum / loadTimes.length;
  const min = loadTimes[0];
  const max = loadTimes[loadTimes.length - 1];
  const median = loadTimes[Math.floor(loadTimes.length / 2)];

  return {
    average,
    min,
    max,
    median,
    count: loadTimes.length,
  };
}

/**
 * 캐시 래퍼 함수
 *
 * 간단한 인메모리 캐싱 (프로덕션에서는 Redis 권장)
 *
 * @param key - 캐시 키
 * @param fn - 데이터를 가져오는 함수
 * @param ttl - Time To Live (밀리초)
 * @returns 캐시된 데이터 또는 새로 가져온 데이터
 *
 * @example
 * ```typescript
 * const user = await withCache(
 *   `user:${userId}`,
 *   () => prisma.user.findUnique({ where: { id: userId } }),
 *   5 * 60 * 1000 // 5분
 * );
 * ```
 */
const cache = new Map<string, { data: unknown; expiresAt: number }>();

export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 기본 5분
): Promise<T> {
  const now = Date.now();

  // 캐시 확인
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.data as T;
  }

  // 데이터 가져오기
  const data = await fn();

  // 캐시 저장
  cache.set(key, {
    data,
    expiresAt: now + ttl,
  });

  return data;
}

/**
 * 캐시 무효화
 *
 * @param key - 캐시 키 (와일드카드 지원)
 *
 * @example
 * ```typescript
 * invalidateCache('user:*'); // user:로 시작하는 모든 키 삭제
 * invalidateCache('user:123'); // 특정 키만 삭제
 * ```
 */
export function invalidateCache(key: string): void {
  if (key.includes("*")) {
    const pattern = new RegExp(key.replace(/\*/g, ".*"));
    for (const k of cache.keys()) {
      if (pattern.test(k)) {
        cache.delete(k);
      }
    }
  } else {
    cache.delete(key);
  }
}

/**
 * 전체 캐시 초기화
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * 캐시 정리 (만료된 항목 제거)
 */
export function cleanupCache(): void {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (value.expiresAt <= now) {
      cache.delete(key);
    }
  }
}

// 주기적 캐시 정리 (5분마다)
if (typeof setInterval !== "undefined") {
  setInterval(cleanupCache, 5 * 60 * 1000);
}
