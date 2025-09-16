import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/app/_components/SessionProvider";
import { Navigation } from "@/app/_components/Navigation";
import { ErrorBoundary } from "@/app/_components/ErrorBoundary";
import { AuthHydrator } from "@/app/_components/AuthHydrator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WeddingAI - AI로 만드는 완벽한 웨딩 사진",
  description:
    "고객이 업로드한 사진을 AI로 분석하여 웨딩촬영 스타일의 고품질 사진을 생성합니다.",
  keywords: "웨딩사진, AI, 인공지능, 사진편집, 웨딩촬영",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <AuthHydrator />
          <ErrorBoundary>
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <main className="pb-16">{children}</main>
            </div>
          </ErrorBoundary>
        </SessionProvider>
      </body>
    </html>
  );
}
