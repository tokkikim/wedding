import { GoogleGenerativeAI } from "@google/generative-ai";

type SupportedMimeType = "image/jpeg" | "image/png" | "image/webp";

const DEFAULT_MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.0-flash-exp";

let genAI: GoogleGenerativeAI | null = null;

function getGeminiModel() {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  return genAI.getGenerativeModel({ model: DEFAULT_MODEL });
}

export interface ImageGenerationRequest {
  imageBuffer: Buffer;
  style: string;
  prompt?: string;
}

export interface ImageGenerationResponse {
  success: boolean;
  imageBuffer?: Buffer;
  generatedImageUrl?: string;
  mimeType?: SupportedMimeType;
  provider?: "gemini" | "local";
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
    const base64Image = imageBuffer.toString("base64");

    const stylePrompts = {
      classic:
        "elegant classic wedding photography, soft lighting, romantic atmosphere, traditional wedding dress, beautiful bouquet, professional studio lighting",
      modern:
        "modern contemporary wedding photography, clean lines, minimalist aesthetic, contemporary wedding dress, sleek styling, modern venue",
      vintage:
        "vintage retro wedding photography, film grain, nostalgic mood, vintage wedding dress, classic styling, retro atmosphere",
      outdoor:
        "outdoor garden wedding photography, natural lighting, fresh atmosphere, outdoor venue, natural beauty, garden setting",
    } as const;

    const basePrompt =
      stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.classic;
    const finalPrompt = prompt ? `${basePrompt}, ${prompt}` : basePrompt;

    const geminiModel = getGeminiModel();

    if (geminiModel) {
      const geminiImage = await tryGenerateWithGemini({
        model: geminiModel,
        base64Image,
        prompt: finalPrompt,
      });

      if (geminiImage) {
        return {
          success: true,
          imageBuffer: geminiImage.buffer,
          mimeType: geminiImage.mimeType,
          provider: "gemini",
        };
      }
    }

    const locallyStylizedImage = await applyLocalWeddingStyle({
      imageBuffer,
      style,
      prompt: finalPrompt,
    });

    return {
      success: true,
      imageBuffer: locallyStylizedImage,
      mimeType: "image/jpeg",
      provider: "local",
    };
  } catch (error) {
    console.error("Wedding image generation error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "이미지 생성 중 오류가 발생했습니다.",
    };
  }
}

async function tryGenerateWithGemini({
  model,
  base64Image,
  prompt,
}: {
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>;
  base64Image: string;
  prompt: string;
}): Promise<{ buffer: Buffer; mimeType: SupportedMimeType } | null> {
  try {
    const result = await model.generateContent([
      {
        text: `Transform this reference into a high-end wedding photograph. Focus on wedding-themed styling, graceful posing, and cohesive lighting while keeping recognizable facial features. Style guidance: ${prompt}. Return the finished image as inline binary data.`,
      },
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    const candidates = response.candidates ?? [];

    for (const candidate of candidates) {
      const parts = candidate.content?.parts ?? [];
      for (const part of parts) {
        const inline = (part as { inlineData?: { data?: string; mimeType?: string } })
          .inlineData;
        if (inline?.data) {
          const mimeType = normalizeMimeType(inline.mimeType);
          const buffer = Buffer.from(inline.data, "base64");
          if (buffer.length > 0) {
            return { buffer, mimeType };
          }
        }

        const text = (part as { text?: string }).text;
        if (text) {
          const parsed = extractBase64Image(text);
          if (parsed) {
            return parsed;
          }
        }
      }
    }

    const fallbackText = response.text();
    const parsed = extractBase64Image(fallbackText);
    if (parsed) {
      return parsed;
    }
  } catch (error) {
    console.warn("Gemini image generation failed, falling back to local styling.", error);
  }

  return null;
}

async function applyLocalWeddingStyle({
  imageBuffer,
  style,
  prompt,
}: {
  imageBuffer: Buffer;
  style: string;
  prompt: string;
}): Promise<Buffer> {
  const sharp = (await import("sharp")).default;

  const base = sharp(imageBuffer).rotate().resize(1400, 940, {
    fit: "cover",
    position: "attention",
  });

  const lowerPrompt = prompt.toLowerCase();

  let styled = base.clone();

  switch (style) {
    case "modern":
      styled = styled
        .modulate({ saturation: 1.2, brightness: 1.1 })
        .linear(1.08, -12)
        .sharpen();
      break;
    case "vintage":
      styled = styled
        .modulate({ saturation: 0.72, brightness: 1.08 })
        .gamma(1.05)
        .tint("#d6b28a");
      break;
    case "outdoor":
      styled = styled
        .modulate({ saturation: 1.32, brightness: 1.18, hue: -4 })
        .sharpen();
      break;
    case "classic":
    default:
      styled = styled.modulate({ saturation: 0.94, brightness: 1.06 }).sharpen();
      break;
  }

  if (lowerPrompt.includes("sunset") || lowerPrompt.includes("golden hour")) {
    styled = styled.modulate({ saturation: 1.1, brightness: 1.05, hue: 6 });
  }

  if (lowerPrompt.includes("romantic") || lowerPrompt.includes("dreamy")) {
    styled = styled.blur(0.3).modulate({ saturation: 1.08 });
  }

  if (lowerPrompt.includes("night") || lowerPrompt.includes("evening")) {
    styled = styled.linear(0.9, -12);
  }

  if (lowerPrompt.includes("floral") || lowerPrompt.includes("garden")) {
    styled = styled.modulate({ saturation: 1.1, hue: -2 });
  }

  const overlayOpacity = style === "vintage" ? 0.24 : 0.14;
  const overlayColor =
    style === "modern"
      ? { r: 255, g: 255, b: 255, alpha: overlayOpacity }
      : { r: 255, g: 214, b: 196, alpha: overlayOpacity };

  const overlay = await sharp({
    create: {
      width: 1400,
      height: 940,
      channels: 4,
      background: overlayColor,
    },
  })
    .png()
    .toBuffer();

  styled = styled.composite([
    {
      input: overlay,
      blend: style === "modern" ? "soft-light" : "overlay",
    },
  ]);

  return styled.jpeg({ quality: 92 }).toBuffer();
}

function extractBase64Image(
  payload: string
): { buffer: Buffer; mimeType: SupportedMimeType } | null {
  const dataUriRegex = /data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)/i;
  const markdownRegex = /!\[[^\]]*\]\((data:image\/(?:png|jpe?g|webp);base64,[A-Za-z0-9+/=]+)\)/i;

  const directMatch = payload.match(dataUriRegex);
  const markdownMatch = payload.match(markdownRegex);

  const source = directMatch?.[0] ?? markdownMatch?.[1];

  if (!source) {
    return null;
  }

  const [, type, data] = dataUriRegex.exec(source) ?? [];

  if (!type || !data) {
    return null;
  }

  const mimeType = normalizeMimeType(`image/${type.replace("jpg", "jpeg")}`);
  const buffer = Buffer.from(data, "base64");

  if (buffer.length === 0) {
    return null;
  }

  return { buffer, mimeType };
}

function normalizeMimeType(mimeType?: string): SupportedMimeType {
  if (mimeType === "image/png" || mimeType === "image/webp") {
    return mimeType;
  }

  return "image/jpeg";
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
