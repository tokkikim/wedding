"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Heart, User, CreditCard, LogOut } from "lucide-react";
import { Button } from "./ui/Button";
import { useAuthStore } from "@/store/useAuthStore";

export function Navigation() {
  const { data: session } = useSession();
  const { user } = useAuthStore();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-rose-600" />
            <span className="text-xl font-bold text-gray-900">WeddingAI</span>
          </Link>

          {/* 네비게이션 메뉴 */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/upload"
              className="text-gray-700 hover:text-rose-600 font-medium transition-colors"
            >
              사진 생성
            </Link>
            <Link
              href="/gallery"
              className="text-gray-700 hover:text-rose-600 font-medium transition-colors"
            >
              갤러리
            </Link>
            <Link
              href="/pricing"
              className="text-gray-700 hover:text-rose-600 font-medium transition-colors"
            >
              요금제
            </Link>
          </div>

          {/* 사용자 메뉴 */}
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                {/* 크레딧 표시 */}
                <div className="flex items-center space-x-1 rounded-full bg-rose-100 px-3 py-1">
                  <CreditCard className="h-4 w-4 text-rose-600" />
                  <span className="text-sm font-medium text-rose-900">
                    {user?.credits || 0} 크레딧
                  </span>
                </div>

                {/* 사용자 메뉴 */}
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "사용자"}
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">
                      {session.user?.name}
                    </span>
                  </Button>

                  {/* 드롭다운 메뉴 */}
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      <Link
                        href="/my-page"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="mr-2 h-4 w-4" />
                        마이페이지
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        로그아웃
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Button onClick={() => signIn()}>로그인</Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
