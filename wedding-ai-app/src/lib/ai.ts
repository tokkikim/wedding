import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini API 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ImageGenerationRequest {
  imageBuffer: Buffer;
  style: string;
  prompt?: string;
}

export interface ImageGenerationResponse {
  success: boolean;
  generatedImageUrl?: string;
  error?: string;
}

/**
 * Gemini API를 사용하여 이미지 생성
 */
export async function generateWeddingImage({
  imageBuffer,
  style,
  prompt,
}: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // 이미지를 base64로 변환
    const base64Image = imageBuffer.toString("base64");

    // 스타일별 프롬프트 생성
    const stylePrompts = {
      classic:
        "elegant classic wedding photography, soft lighting, romantic atmosphere, traditional wedding dress, beautiful bouquet, professional studio lighting",
      modern:
        "modern contemporary wedding photography, clean lines, minimalist aesthetic, contemporary wedding dress, sleek styling, modern venue",
      vintage:
        "vintage retro wedding photography, film grain, nostalgic mood, vintage wedding dress, classic styling, retro atmosphere",
      outdoor:
        "outdoor garden wedding photography, natural lighting, fresh atmosphere, outdoor venue, natural beauty, garden setting",
    };

    const basePrompt =
      stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.classic;
    const finalPrompt = prompt ? `${basePrompt}, ${prompt}` : basePrompt;

    // 이미지 생성 요청
    const result = await model.generateContent([
      {
        text: `Transform this image into a beautiful wedding photo with the following style: ${finalPrompt}. 
        The image should look like a professional wedding photograph with high quality, 
        proper lighting, and wedding-themed elements.`,
      },
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Gemini는 텍스트만 반환하므로, 실제 이미지 생성을 위해서는 다른 방법이 필요
    // 여기서는 시뮬레이션된 응답을 반환
    console.log("Gemini API Response:", text);

    // 실제 구현에서는 이미지 URL을 반환해야 함
    return {
      success: true,
      generatedImageUrl:
        "https://via.placeholder.com/800x600/FFB6C1/FFFFFF?text=Generated+Wedding+Photo",
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "이미지 생성 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 이미지 품질 검증
 */
export function validateImageQuality(imageBuffer: Buffer): {
  valid: boolean;
  error?: string;
} {
  // 최소 이미지 크기 확인 (1KB)
  if (imageBuffer.length < 1024) {
    return {
      valid: false,
      error: "이미지 파일이 너무 작습니다.",
    };
  }

  // 최대 이미지 크기 확인 (10MB)
  if (imageBuffer.length > 10 * 1024 * 1024) {
    return {
      valid: false,
      error: "이미지 파일이 너무 큽니다. (최대 10MB)",
    };
  }

  return { valid: true };
}

/**
 * 이미지 전처리 (리사이징, 최적화)
 */
export async function preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
  try {
    // Sharp를 사용한 이미지 최적화
    const sharp = (await import("sharp")).default;

    return await sharp(imageBuffer)
      .resize(1024, 1024, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 90 })
      .toBuffer();
  } catch (error) {
    console.error("Image preprocessing error:", error);
    return imageBuffer; // 전처리 실패 시 원본 반환
  }
}
