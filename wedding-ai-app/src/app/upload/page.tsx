"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ImageUpload } from "@/app/_components/ImageUpload";
import { Button } from "@/app/_components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/Card";
import { useImageStore } from "@/store/useImageStore";
import { useAuthStore } from "@/store/useAuthStore";
import type { WeddingStyle } from "@/types";

const weddingStyles: WeddingStyle[] = [
  {
    id: "classic",
    name: "클래식",
    description: "우아하고 전통적인 웨딩 스타일",
    thumbnail: "/styles/classic.jpg",
    prompt:
      "elegant classic wedding photography, soft lighting, romantic atmosphere",
  },
  {
    id: "modern",
    name: "모던",
    description: "세련되고 현대적인 웨딩 스타일",
    thumbnail: "/styles/modern.jpg",
    prompt:
      "modern contemporary wedding photography, clean lines, minimalist aesthetic",
  },
  {
    id: "vintage",
    name: "빈티지",
    description: "레트로하고 감성적인 웨딩 스타일",
    thumbnail: "/styles/vintage.jpg",
    prompt: "vintage retro wedding photography, film grain, nostalgic mood",
  },
  {
    id: "outdoor",
    name: "야외",
    description: "자연스럽고 화사한 야외 웨딩",
    thumbnail: "/styles/outdoor.jpg",
    prompt:
      "outdoor garden wedding photography, natural lighting, fresh atmosphere",
  },
];

export default function UploadPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { currentImage, selectedStyle, setSelectedStyle } = useImageStore();
  const { user } = useAuthStore();

  const handleStyleSelect = (style: WeddingStyle) => {
    setSelectedStyle(style);
  };

  const handleGenerate = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (!currentImage || !selectedStyle) {
      alert("사진과 스타일을 모두 선택해주세요.");
      return;
    }

    if (!user?.credits || user.credits < 1) {
      alert("크레딧이 부족합니다. 크레딧을 충전해주세요.");
      router.push("/pricing");
      return;
    }

    setIsLoading(true);

    try {
      // 이미지를 FormData로 준비
      const formData = new FormData();
      formData.append("image", currentImage);
      formData.append("style", selectedStyle.id);
      formData.append("prompt", selectedStyle.prompt);

      // API 호출
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("이미지 생성에 실패했습니다.");
      }

      const result = await response.json();

      if (result.success) {
        router.push(`/result/${result.imageId}`);
      } else {
        throw new Error(result.error || "이미지 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("Generation error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "이미지 생성 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="text-center">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>
              AI 웨딩 사진 생성 서비스를 이용하려면 로그인해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/auth/signin")}>
              로그인하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI 웨딩 사진 생성</h1>
        <p className="mt-2 text-gray-600">
          사진을 업로드하고 원하는 스타일을 선택하세요
        </p>
        <div className="mt-4 inline-flex items-center rounded-full bg-rose-100 px-4 py-2">
          <span className="text-sm font-medium text-rose-900">
            보유 크레딧: {user?.credits || 0}개
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {/* 이미지 업로드 */}
        <Card>
          <CardHeader>
            <CardTitle>1. 사진 업로드</CardTitle>
            <CardDescription>
              변환하고 싶은 사진을 업로드해주세요 (JPEG, PNG, WebP, 최대 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload />
          </CardContent>
        </Card>

        {/* 스타일 선택 */}
        <Card>
          <CardHeader>
            <CardTitle>2. 웨딩 스타일 선택</CardTitle>
            <CardDescription>
              원하는 웨딩 촬영 스타일을 선택해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {weddingStyles.map((style) => (
                <div
                  key={style.id}
                  className={`
                    cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md
                    ${
                      selectedStyle?.id === style.id
                        ? "border-rose-500 bg-rose-50"
                        : "border-gray-200 hover:border-rose-300"
                    }
                  `}
                  onClick={() => handleStyleSelect(style)}
                >
                  <div className="aspect-square rounded-lg bg-gray-100 mb-3 flex items-center justify-center">
                    <span className="text-2xl">{style.name[0]}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{style.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {style.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 생성 버튼 */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={handleGenerate}
            loading={isLoading}
            disabled={!currentImage || !selectedStyle || isLoading}
            className="px-8"
          >
            {isLoading
              ? "AI가 사진을 생성 중입니다..."
              : "AI 웨딩 사진 생성하기 (1 크레딧)"}
          </Button>

          {(!currentImage || !selectedStyle) && (
            <p className="mt-2 text-sm text-gray-500">
              사진과 스타일을 모두 선택해주세요
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
