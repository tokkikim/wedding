"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Share2, Heart, Calendar, Filter } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/Card";
import { GeneratedImage } from "@/types";

interface GalleryClientProps {
  images: GeneratedImage[];
}

export function GalleryClient({ images }: GalleryClientProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  // 스타일 필터링
  const filteredImages = images.filter((image) => {
    if (selectedStyle === "all") return true;
    return image.style === selectedStyle;
  });

  // 정렬
  const sortedImages = [...filteredImages].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
  });

  // 고유한 스타일 목록
  const styles = [
    "all",
    ...Array.from(new Set(images.map((img) => img.style))),
  ];

  const handleDownload = async (imageUrl: string, imageId: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `wedding-ai-${imageId}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("다운로드 중 오류가 발생했습니다.");
    }
  };

  const handleShare = async (imageUrl: string, imageId: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI 웨딩 사진",
          text: "WeddingAI로 만든 완벽한 웨딩 사진을 확인해보세요!",
          url: `${window.location.origin}/result/${imageId}`,
        });
      } catch (error) {
        console.error("Share error:", error);
      }
    } else {
      // 웹 공유 API가 지원되지 않는 경우 URL 복사
      navigator.clipboard.writeText(
        `${window.location.origin}/result/${imageId}`
      );
      alert("링크가 클립보드에 복사되었습니다!");
    }
  };

  if (images.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">내 갤러리</h1>
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>아직 생성된 이미지가 없습니다</CardTitle>
              <CardDescription>
                첫 번째 AI 웨딩 사진을 만들어보세요!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/upload">
                <Button className="w-full">사진 생성하기</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">내 갤러리</h1>
        <p className="text-gray-600 mb-6">
          총 {images.length}개의 AI 웨딩 사진이 있습니다.
        </p>

        {/* 필터 및 정렬 */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {styles.map((style) => (
                <option key={style} value={style}>
                  {style === "all" ? "모든 스타일" : style}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="newest">최신순</option>
              <option value="oldest">오래된순</option>
            </select>
          </div>
        </div>
      </div>

      {/* 이미지 그리드 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedImages.map((image) => (
          <Card
            key={image.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-square relative">
              <Image
                src={image.generatedUrl || image.originalUrl}
                alt={`${image.style} 웨딩 사진`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      handleDownload(
                        image.generatedUrl || image.originalUrl,
                        image.id
                      )
                    }
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      handleShare(
                        image.generatedUrl || image.originalUrl,
                        image.id
                      )
                    }
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {image.style}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(image.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">
                {image.prompt}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 더 많은 사진 생성 CTA */}
      <div className="mt-12 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>더 많은 사진을 만들어보세요</CardTitle>
            <CardDescription>
              다양한 스타일로 새로운 웨딩 사진을 생성해보세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/upload">
              <Button className="w-full">새로운 사진 생성하기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
