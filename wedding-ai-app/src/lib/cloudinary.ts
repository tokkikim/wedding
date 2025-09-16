import { v2 as cloudinary } from "cloudinary";

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

/**
 * 이미지를 Cloudinary에 업로드
 */
export async function uploadToCloudinary(
  imageBuffer: Buffer,
  folder: string = "wedding-ai",
  options: {
    publicId?: string;
    transformation?: any;
  } = {}
): Promise<UploadResult> {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error("Cloudinary 설정이 완료되지 않았습니다.");
    }

    // 이미지를 base64로 변환
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString(
      "base64"
    )}`;

    const uploadOptions = {
      folder,
      public_id: options.publicId,
      transformation: options.transformation || {
        quality: "auto",
        fetch_format: "auto",
        width: 1024,
        height: 1024,
        crop: "limit",
      },
      resource_type: "image" as const,
    };

    const result = await cloudinary.uploader.upload(base64Image, uploadOptions);

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "이미지 업로드 중 오류가 발생했습니다.",
    };
  }
}

/**
 * Cloudinary에서 이미지 삭제
 */
export async function deleteFromCloudinary(
  publicId: string
): Promise<UploadResult> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return { success: true };
    } else {
      return {
        success: false,
        error: "이미지 삭제에 실패했습니다.",
      };
    }
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "이미지 삭제 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 이미지 변환 URL 생성
 */
export function getCloudinaryUrl(
  publicId: string,
  transformations: any = {}
): string {
  const defaultTransformations = {
    quality: "auto",
    fetch_format: "auto",
    ...transformations,
  };

  return cloudinary.url(publicId, {
    transformation: defaultTransformations,
  });
}

/**
 * 이미지 최적화된 URL 생성 (웹용)
 */
export function getOptimizedImageUrl(
  publicId: string,
  width: number = 800,
  height: number = 600
): string {
  return cloudinary.url(publicId, {
    transformation: {
      width,
      height,
      crop: "fill",
      quality: "auto",
      fetch_format: "auto",
    },
  });
}

/**
 * 썸네일 URL 생성
 */
export function getThumbnailUrl(publicId: string, size: number = 300): string {
  return cloudinary.url(publicId, {
    transformation: {
      width: size,
      height: size,
      crop: "fill",
      quality: "auto",
      fetch_format: "auto",
    },
  });
}
