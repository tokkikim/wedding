import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 에러 로그를 데이터베이스에 저장
    await prisma.errorLog.create({
      data: {
        userId: data.userId || null,
        error: data.error,
        context: data.context,
        stack: data.stack || null,
        metadata: {
          url: data.url,
          userAgent: data.userAgent,
          timestamp: data.timestamp,
          ...data.metadata
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to store error log:', error);
    return NextResponse.json(
      { error: 'Failed to store error log' },
      { status: 500 }
    );
  }
}
