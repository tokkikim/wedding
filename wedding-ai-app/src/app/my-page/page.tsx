import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MyPageClient } from "./MyPageClient";

export default async function MyPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // 사용자 정보 및 통계 가져오기
  const [user, stats, orders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        credits: true,
        createdAt: true,
      },
    }),
    prisma.$transaction([
      // 총 생성된 이미지 수
      prisma.generatedImage.count({
        where: { userId: session.user.id },
      }),
      // 완료된 이미지 수
      prisma.generatedImage.count({
        where: { userId: session.user.id, status: "COMPLETED" },
      }),
      // 총 주문 수
      prisma.order.count({
        where: { userId: session.user.id, status: "COMPLETED" },
      }),
      // 총 결제 금액
      prisma.order.aggregate({
        where: { userId: session.user.id, status: "COMPLETED" },
        _sum: { amount: true },
      }),
    ]),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        amount: true,
        credits: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  if (!user) {
    redirect("/auth/signin");
  }

  const [totalImages, completedImages, totalOrders, totalSpent] = stats;
  const totalSpentInDollars = (totalSpent._sum.amount ?? 0) / 100;

  return (
    <MyPageClient
      user={user}
      stats={{
        totalImages,
        completedImages,
        totalOrders,
        totalSpent: totalSpentInDollars,
      }}
      orders={orders}
    />
  );
}
