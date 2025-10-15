import Link from "next/link";
import { Heart, Sparkles, Shield, Zap } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/Card";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-pink-50">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="fade-in">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                AI로 만드는 완벽한
                <span className="text-rose-600"> 웨딩 사진</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                고객님의 소중한 사진을 AI가 분석하여 드림같은 웨딩촬영 스타일로
                변환해드립니다. 단 몇 분만에 전문 스튜디오 수준의 웨딩 사진을
                만나보세요.
              </p>
            </div>

            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/upload">
                <Button size="lg" className="px-8">
                  <Sparkles className="mr-2 h-5 w-5" />
                  지금 시작하기
                </Button>
              </Link>
              <Link href="/gallery">
                <Button variant="outline" size="lg">
                  샘플 갤러리 보기
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 배경 장식 */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-rose-400 to-pink-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              왜 WeddingAI를 선택해야 할까요?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              최첨단 AI 기술로 당신만의 특별한 웨딩 사진을 만들어보세요
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100">
                  <Zap className="h-6 w-6 text-rose-600" />
                </div>
                <CardTitle>빠른 생성</CardTitle>
                <CardDescription>
                  단 몇 분만에 전문가 수준의 웨딩 사진을 생성합니다
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100">
                  <Heart className="h-6 w-6 text-rose-600" />
                </div>
                <CardTitle>다양한 스타일</CardTitle>
                <CardDescription>
                  클래식, 모던, 빈티지 등 원하는 웨딩 스타일을 선택하세요
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100">
                  <Shield className="h-6 w-6 text-rose-600" />
                </div>
                <CardTitle>안전한 보안</CardTitle>
                <CardDescription>
                  업로드된 이미지는 암호화되어 안전하게 보호됩니다
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              어떻게 작동하나요?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              간단한 3단계로 완성되는 AI 웨딩 사진
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-600 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                사진 업로드
              </h3>
              <p className="mt-2 text-gray-600">
                변환하고 싶은 사진을 업로드하세요
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-600 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                스타일 선택
              </h3>
              <p className="mt-2 text-gray-600">
                원하는 웨딩 촬영 스타일을 선택하세요
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-600 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                결과 확인
              </h3>
              <p className="mt-2 text-gray-600">
                AI가 생성한 완벽한 웨딩 사진을 다운로드하세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-rose-600">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              지금 바로 시작해보세요!
            </h2>
            <p className="mt-4 text-xl text-rose-100">
              첫 3장은 무료로 체험하실 수 있습니다
            </p>
            <div className="mt-8">
              <Link href="/upload">
                <Button variant="secondary" size="lg" className="px-8">
                  무료로 시작하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
