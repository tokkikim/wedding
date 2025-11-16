/**
 * 작업 큐 시스템
 *
 * 서버리스 환경에서 안정적인 백그라운드 작업 처리를 위한 DB 기반 큐 시스템
 * 프로덕션 환경에서는 Redis나 전문 큐 시스템(BullMQ, AWS SQS 등)으로 교체 권장
 *
 * @module lib/queue
 */

import { prisma } from "./prisma";
import { JobStatus } from "@prisma/client";

export interface JobPayload {
  [key: string]: unknown;
}

export interface Job {
  id: string;
  type: string;
  payload: JobPayload;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  error?: string | null;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date | null;
  completedAt?: Date | null;
}

export type JobHandler<T extends JobPayload = JobPayload> = (
  payload: T
) => Promise<void>;

/**
 * 작업 큐 매니저
 */
export class QueueManager {
  private handlers = new Map<string, JobHandler>();

  /**
   * 작업 타입에 대한 핸들러 등록
   *
   * @param type - 작업 타입
   * @param handler - 작업 처리 함수
   *
   * @example
   * ```typescript
   * queueManager.registerHandler('image-generation', async (payload) => {
   *   // 이미지 생성 로직
   * });
   * ```
   */
  registerHandler<T extends JobPayload>(
    type: string,
    handler: JobHandler<T>
  ): void {
    this.handlers.set(type, handler as JobHandler);
  }

  /**
   * 새 작업을 큐에 추가
   *
   * @param type - 작업 타입
   * @param payload - 작업 데이터
   * @param maxAttempts - 최대 재시도 횟수 (기본값: 3)
   * @returns 생성된 작업 ID
   *
   * @example
   * ```typescript
   * const jobId = await queueManager.enqueue('image-generation', {
   *   imageId: '123',
   *   userId: 'user-456'
   * });
   * ```
   */
  async enqueue(
    type: string,
    payload: JobPayload,
    maxAttempts = 3
  ): Promise<string> {
    const job = await prisma.jobQueue.create({
      data: {
        type,
        payload: payload as never,
        maxAttempts,
      },
    });

    return job.id;
  }

  /**
   * 대기 중인 작업을 처리
   *
   * @param batchSize - 한 번에 처리할 작업 수 (기본값: 10)
   * @returns 처리된 작업 수
   */
  async processJobs(batchSize = 10): Promise<number> {
    // PENDING 또는 RETRYING 상태의 작업을 가져옴
    const jobs = await prisma.jobQueue.findMany({
      where: {
        status: {
          in: [JobStatus.PENDING, JobStatus.RETRYING],
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: batchSize,
    });

    let processedCount = 0;

    for (const job of jobs) {
      await this.processJob(job);
      processedCount++;
    }

    return processedCount;
  }

  /**
   * 단일 작업 처리
   *
   * @param job - 처리할 작업
   */
  private async processJob(job: Job): Promise<void> {
    const handler = this.handlers.get(job.type);

    if (!handler) {
      console.error(`No handler registered for job type: ${job.type}`);
      await prisma.jobQueue.update({
        where: { id: job.id },
        data: {
          status: JobStatus.FAILED,
          error: `No handler registered for job type: ${job.type}`,
        },
      });
      return;
    }

    // 작업 시작
    await prisma.jobQueue.update({
      where: { id: job.id },
      data: {
        status: JobStatus.PROCESSING,
        startedAt: new Date(),
        attempts: { increment: 1 },
      },
    });

    try {
      // 핸들러 실행
      await handler(job.payload as JobPayload);

      // 성공 시 완료 상태로 변경
      await prisma.jobQueue.update({
        where: { id: job.id },
        data: {
          status: JobStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const attempts = job.attempts + 1;

      // 재시도 가능한지 확인
      if (attempts < job.maxAttempts) {
        await prisma.jobQueue.update({
          where: { id: job.id },
          data: {
            status: JobStatus.RETRYING,
            error: errorMessage,
          },
        });
      } else {
        await prisma.jobQueue.update({
          where: { id: job.id },
          data: {
            status: JobStatus.FAILED,
            error: errorMessage,
          },
        });
      }

      console.error(`Job ${job.id} failed:`, error);
    }
  }

  /**
   * 작업 상태 조회
   *
   * @param jobId - 작업 ID
   * @returns 작업 정보
   */
  async getJobStatus(jobId: string): Promise<Job | null> {
    return prisma.jobQueue.findUnique({
      where: { id: jobId },
    });
  }

  /**
   * 완료된 작업 정리 (30일 이상 지난 작업)
   *
   * @returns 삭제된 작업 수
   */
  async cleanupCompletedJobs(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.jobQueue.deleteMany({
      where: {
        status: JobStatus.COMPLETED,
        completedAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    return result.count;
  }
}

// 전역 인스턴스
export const queueManager = new QueueManager();
