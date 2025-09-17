"use client";


import { useEffect, useState } from "react";


import Image from "next/image";
import Link from "next/link";
import {
  User,
  CreditCard,
  Image as ImageIcon,
  ShoppingBag,
  DollarSign,
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
import {
  CardSkeleton,
  Skeleton,
  StatsSkeleton,
} from "@/app/_components/LoadingSkeleton";

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

type OrderStatus = "PENDING" | "COMPLETED" | "FAILED";

interface Order {
  id: string;
  amount: number;
  credits: number;
  status: OrderStatus;
  createdAt: Date | string;
}

interface MyPageClientProps {
  user: User;
  stats: Stats;
  orders: Order[];
}

export function MyPageClient({ user, stats, orders }: MyPageClientProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "settings"
  >("overview");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && stats) {
      setIsLoading(false);
    }
  }, [user, stats]);

  const formatDate = (date: Date | string) => {

    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };

  const statusLabel: Record<OrderStatus, string> = {
    PENDING: "처리 중",
    COMPLETED: "완료",
    FAILED: "실패",
  };

  const statusStyles: Record<OrderStatus, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    FAILED: "bg-rose-100 text-rose-700",
  };

  const tabs = [
    { id: "overview", label: "개요", icon: User },
    { id: "orders", label: "주문 내역", icon: ShoppingBag },
    { id: "settings", label: "설정", icon: Settings },
  ] as const;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-8 w-44 rounded-full" />
        </div>

        <div className="border-b border-gray-200 mb-8">
          <div className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <Skeleton key={tab.id} className="h-9 w-24" />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <StatsSkeleton />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

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
                  {formatCurrency(stats.totalSpent)}
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
              {orders.length === 0 ? (
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
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                          일시
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                          결제 금액
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                          크레딧
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                          상태
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="whitespace-nowrap px-4 py-3 text-gray-900">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{formatDateTime(order.createdAt)}</span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-gray-900">
                            {formatCurrency(order.amount)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-gray-900">
                            {order.credits} 크레딧
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.status]}`}
                            >
                              {statusLabel[order.status]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-4 text-xs text-gray-500">
                    최근 {orders.length}건의 주문 내역입니다.
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
