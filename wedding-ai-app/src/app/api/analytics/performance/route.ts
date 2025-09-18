import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 성능 데이터를 데이터베이스에 저장
    await prisma.performanceMetric.create({
      data: {
        url: data.url,
        userAgent: data.userAgent,
        timestamp: new Date(data.timestamp),
        metrics: data.metrics,
        // 추가 메타데이터
        metadata: {
          referrer: request.headers.get('referer'),
          ip: request.ip || request.headers.get('x-forwarded-for'),
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to store performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to store performance metrics' },
      { status: 500 }
    );
  }
}
