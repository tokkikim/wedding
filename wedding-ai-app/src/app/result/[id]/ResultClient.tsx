"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Download,
  Share2,
  RotateCcw,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/Card";
import { LoadingSpinner } from "@/app/_components/ui/LoadingSpinner";
import type { GeneratedImage } from "@/types";

interface ResultClientProps {
  generatedImage: GeneratedImage;
}

export function ResultClient({
  generatedImage: initialImage,
}: ResultClientProps) {
  const [generatedImage, setGeneratedImage] = useState(initialImage);
  const [isPolling, setIsPolling] = useState(
    initialImage.status === "PROCESSING"
  );

  // 이미지 생성 상태를 폴링으로 확인
  useEffect(() => {
    if (!isPolling) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/images/${generatedImage.id}/status`);
        if (response.ok) {
          const updatedImage = await response.json();
          setGeneratedImage(updatedImage);

          if (updatedImage.status !== "PROCESSING") {
            setIsPolling(false);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    const interval = setInterval(pollStatus, 2000); // 2초마다 상태 확인
    return () => clearInterval(interval);
  }, [isPolling, generatedImage.id]);

  const handleDownload = async () => {
    if (!generatedImage.generatedUrl) return;

    try {
      const response = await fetch(generatedImage.generatedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `wedding-ai-${generatedImage.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("다운로드 중 오류가 발생했습니다.");
    }
  };

  const handleShare = async () => {
    if (navigator.share && generatedImage.generatedUrl) {
      try {
        await navigator.share({
          title: "AI 웨딩 사진",
          text: "WeddingAI로 만든 완벽한 웨딩 사진을 확인해보세요!",
          url: window.location.href,
        });
      } catch (error) {
        console.error("Share error:", error);
      }
    } else {
      // 웹 공유 API가 지원되지 않는 경우 URL 복사
      navigator.clipboard.writeText(window.location.href);
      alert("링크가 클립보드에 복사되었습니다!");
    }
  };

  const getStatusIcon = () => {
    switch (generatedImage.status) {
      case "PROCESSING":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "FAILED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (generatedImage.status) {
      case "PROCESSING":
        return "AI가 사진을 생성 중입니다...";
      case "COMPLETED":
        return "사진 생성이 완료되었습니다!";
      case "FAILED":
        return "사진 생성에 실패했습니다.";
      default:
        return "";
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI 웨딩 사진 결과</h1>
        <div className="mt-4 inline-flex items-center space-x-2 rounded-full bg-gray-100 px-4 py-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-900">
            {getStatusText()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* 원본 이미지 */}
        <Card>
          <CardHeader>
            <CardTitle>원본 사진</CardTitle>
            <CardDescription>업로드하신 원본 사진입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={generatedImage.originalUrl}
                alt="원본 사진"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
                unoptimized
              />
            </div>
          </CardContent>
        </Card>

        {/* 생성된 이미지 */}
        <Card>
          <CardHeader>
            <CardTitle>AI 웨딩 사진</CardTitle>
            <CardDescription>
              {generatedImage.style} 스타일로 생성된 웨딩 사진
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              {generatedImage.status === "PROCESSING" ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-sm text-gray-600">
                      AI가 사진을 생성하고 있습니다...
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      보통 1-2분 정도 소요됩니다
                    </p>
                  </div>
                </div>
              ) : generatedImage.status === "COMPLETED" &&
                generatedImage.generatedUrl ? (
                <Image
                  src={generatedImage.generatedUrl}
                  alt="AI 웨딩 사진"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  unoptimized
                />
              ) : generatedImage.status === "FAILED" ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <XCircle className="mx-auto h-12 w-12 text-red-500" />
                    <p className="mt-2 text-sm text-gray-600">
                      사진 생성에 실패했습니다
                    </p>
                    <Link href="/upload" className="mt-2 inline-block">
                      <Button variant="outline" size="sm">
                        다시 시도하기
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 액션 버튼들 */}
      {generatedImage.status === "COMPLETED" && generatedImage.generatedUrl && (
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button
            onClick={handleDownload}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>고화질 다운로드</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleShare}
            className="flex items-center space-x-2"
          >
            <Share2 className="h-4 w-4" />
            <span>공유하기</span>
          </Button>

          <Link href="/upload">
            <Button variant="outline" className="flex items-center space-x-2">
              <RotateCcw className="h-4 w-4" />
              <span>새로운 사진 생성</span>
            </Button>
          </Link>
        </div>
      )}

      {/* 생성 정보 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>생성 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">스타일</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">
                {generatedImage.style}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">생성 시간</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(generatedImage.createdAt).toLocaleString("ko-KR")}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">
                사용된 프롬프트
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {generatedImage.prompt}
              </dd>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
