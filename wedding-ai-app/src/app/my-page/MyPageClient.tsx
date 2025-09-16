"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  CreditCard,
  Image as ImageIcon,
  ShoppingBag,
  DollarSign,
  Calendar,
  Settings,
} from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/Card";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  credits: number;
  createdAt: Date;
}

interface Stats {
  totalImages: number;
  completedImages: number;
  totalOrders: number;
  totalSpent: number;
}

interface MyPageClientProps {
  user: User;
  stats: Stats;
}

export function MyPageClient({ user, stats }: MyPageClientProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "settings"
  >("overview");

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const tabs = [
    { id: "overview", label: "개요", icon: User },
    { id: "orders", label: "주문 내역", icon: ShoppingBag },
    { id: "settings", label: "설정", icon: Settings },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "사용자"}
              width={80}
              height={80}
              className="rounded-full"
            />
          ) : (
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-rose-600" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.name || "사용자"}
            </h1>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500">
              가입일: {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* 크레딧 표시 */}
        <div className="inline-flex items-center rounded-full bg-rose-100 px-4 py-2">
          <CreditCard className="h-4 w-4 text-rose-600 mr-2" />
          <span className="text-sm font-medium text-rose-900">
            {user.credits} 크레딧 보유
          </span>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-rose-500 text-rose-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* 통계 카드 */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  총 생성 이미지
                </CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalImages}</div>
                <p className="text-xs text-muted-foreground">
                  완료: {stats.completedImages}개
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  보유 크레딧
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.credits}</div>
                <p className="text-xs text-muted-foreground">
                  <Link
                    href="/pricing"
                    className="text-rose-600 hover:underline"
                  >
                    크레딧 구매하기
                  </Link>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 주문</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">성공한 주문</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  총 결제 금액
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.totalSpent.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">모든 시간</p>
              </CardContent>
            </Card>
          </div>

          {/* 빠른 액션 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>새로운 사진 생성</CardTitle>
                <CardDescription>
                  AI를 사용하여 새로운 웨딩 사진을 만들어보세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/upload">
                  <Button className="w-full">사진 생성하기</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>내 갤러리</CardTitle>
                <CardDescription>
                  생성한 모든 웨딩 사진을 확인해보세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/gallery">
                  <Button variant="outline" className="w-full">
                    갤러리 보기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle>주문 내역</CardTitle>
              <CardDescription>
                크레딧 구매 및 결제 내역을 확인할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.totalOrders === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    아직 주문 내역이 없습니다.
                  </p>
                  <Link href="/pricing">
                    <Button>크레딧 구매하기</Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    주문 내역 기능은 곧 추가될 예정입니다.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>계정 설정</CardTitle>
              <CardDescription>
                계정 정보를 관리하고 개인정보를 설정할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  value={user.name || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  이름은 소셜 로그인 계정에서 가져옵니다.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  이메일은 소셜 로그인 계정에서 가져옵니다.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가입일
                </label>
                <input
                  type="text"
                  value={formatDate(user.createdAt)}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>데이터 관리</CardTitle>
              <CardDescription>
                계정 데이터를 관리할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">계정 삭제</h3>
                    <p className="text-sm text-gray-500">
                      계정과 모든 데이터를 영구적으로 삭제합니다.
                    </p>
                  </div>
                  <Button variant="destructive" disabled>
                    계정 삭제
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  계정 삭제 기능은 곧 추가될 예정입니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
