import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";
import {
  generateWeddingImage,
  preprocessImage,
  validateImageQuality,
} from "@/lib/ai";
import { uploadToCloudinary } from "@/lib/cloudinary";

let cachedAuthOptions: NextAuthOptions | null = null;

async function getAuthOptions(): Promise<NextAuthOptions> {
  if (!cachedAuthOptions) {
    cachedAuthOptions = (await import("@/lib/auth")).authOptions;
  }

  return cachedAuthOptions;
}

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    // 보안: TEST_SESSION_USER_ID는 개발 환경에서만 허용
    const session =
      process.env.NODE_ENV !== "production" && process.env.TEST_SESSION_USER_ID
        ? ({ user: { id: process.env.TEST_SESSION_USER_ID } } as {
            user: { id: string };
          })
        : await getServerSession(await getAuthOptions());

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 사용자 크레딧 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user || user.credits < 1) {
      return NextResponse.json(
        { success: false, error: "크레딧이 부족합니다." },
        { status: 400 }
      );
    }

    // FormData 파싱
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const style = formData.get("style") as string;
    const prompt = formData.get("prompt") as string;

    if (!imageFile || !style || !prompt) {
      return NextResponse.json(
        { success: false, error: "필수 데이터가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 이미지 파일 검증
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { success: false, error: "지원하지 않는 이미지 형식입니다." },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "파일 크기가 너무 큽니다. (최대 10MB)" },
        { status: 400 }
      );
    }

    // 이미지를 Buffer로 변환
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

    // 이미지 품질 검증
    const qualityCheck = validateImageQuality(imageBuffer);
    if (!qualityCheck.valid) {
      return NextResponse.json(
        { success: false, error: qualityCheck.error },
        { status: 400 }
      );
    }

    // 이미지 전처리
    const processedImageBuffer = await preprocessImage(imageBuffer);

    // 원본 이미지를 Cloudinary에 업로드
    const originalUploadResult = await uploadToCloudinary(
      processedImageBuffer,
      "wedding-ai/originals",
      { publicId: `original_${Date.now()}_${userId}` }
    );

    if (!originalUploadResult.success) {
      return NextResponse.json(
        { success: false, error: "이미지 업로드에 실패했습니다." },
        { status: 500 }
      );
    }

    // GeneratedImage 레코드 생성 (PROCESSING 상태)
    const generatedImage = await prisma.generatedImage.create({
      data: {
        userId,
        originalUrl: originalUploadResult.url!,
        prompt: `${prompt}, wedding photography style: ${style}`,
        style,
        status: "PROCESSING",
      },
    });

    // 크레딧 차감
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 1 } },
    });

    // TODO: 프로덕션 환경에서는 큐 시스템(Vercel Queue, BullMQ 등) 사용 필요
    // setTimeout은 서버리스 환경에서 응답 후 실행이 보장되지 않음
    //
    // 권장 아키텍처:
    // 1. 즉시 응답 반환 (imageId 제공)
    // 2. 백그라운드 작업을 큐에 추가
    // 3. 워커가 큐에서 작업을 가져와 처리
    // 4. 완료 시 웹훅 또는 폴링으로 클라이언트에 알림
    //
    // 현재는 개발 환경을 위해 즉시 처리하되, await 없이 비동기 실행
    processImageInBackground(generatedImage.id, processedImageBuffer, style, prompt).catch(
      (error) => {
        console.error("Background image processing failed:", error);
      }
    );

    return NextResponse.json({
      success: true,
      imageId: generatedImage.id,
      message: "이미지 생성이 시작되었습니다.",
    });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 백그라운드에서 이미지 생성 처리
 *
 * 주의: 이 함수는 서버리스 환경에서 제한적으로 동작합니다.
 * 프로덕션에서는 큐 시스템(Vercel Queue, AWS SQS, BullMQ 등)을 사용해야 합니다.
 */
async function processImageInBackground(
  imageId: string,
  imageBuffer: Buffer,
  style: string,
  prompt: string
): Promise<void> {
  try {
    // AI 이미지 생성
    const aiResult = await generateWeddingImage({
      imageBuffer,
      style,
      prompt,
    });

    if (!aiResult.success) {
      throw new Error(aiResult.error || "AI 이미지 생성 실패");
    }

    let generatedBuffer: Buffer | null = null;

    if (aiResult.imageBuffer?.length) {
      generatedBuffer = aiResult.imageBuffer;
    } else if (aiResult.generatedImageUrl) {
      const response = await fetch(aiResult.generatedImageUrl);
      const arrayBuffer = await response.arrayBuffer();
      generatedBuffer = Buffer.from(arrayBuffer);
    }

    if (!generatedBuffer) {
      throw new Error("생성된 이미지 데이터를 찾을 수 없습니다.");
    }

    const generatedUploadResult = await uploadToCloudinary(
      generatedBuffer,
      "wedding-ai/generated",
      {
        publicId: `generated_${imageId}`,
        mimeType: aiResult.mimeType,
      }
    );

    if (generatedUploadResult.success && generatedUploadResult.url) {
      await prisma.generatedImage.update({
        where: { id: imageId },
        data: {
          generatedUrl: generatedUploadResult.url,
          status: "COMPLETED",
        },
      });
    } else {
      throw new Error(
        generatedUploadResult.error || "생성된 이미지 업로드 실패"
      );
    }
  } catch (error) {
    console.error("AI generation error:", error);
    await prisma.generatedImage.update({
      where: { id: imageId },
      data: { status: "FAILED" },
    });
  }
}
