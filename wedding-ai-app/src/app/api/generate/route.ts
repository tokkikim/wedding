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
    const session = process.env.TEST_SESSION_USER_ID
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

    // 백그라운드에서 AI 이미지 생성 처리
    setTimeout(async () => {
      try {
        // AI 이미지 생성
        const aiResult = await generateWeddingImage({
          imageBuffer: processedImageBuffer,
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
            publicId: `generated_${generatedImage.id}`,
            mimeType: aiResult.mimeType,
          }
        );

        if (generatedUploadResult.success && generatedUploadResult.url) {
          await prisma.generatedImage.update({
            where: { id: generatedImage.id },
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
          where: { id: generatedImage.id },
          data: { status: "FAILED" },
        });
      }
    }, 2000); // 2초 후 시작

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
