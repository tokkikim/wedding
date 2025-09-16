import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createCreditPurchaseIntent } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 요청 데이터 파싱
    const { credits } = await request.json();

    // 크레딧 수량 검증
    const validCredits = [5, 10, 20, 50];
    if (!validCredits.includes(credits)) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 크레딧 수량입니다." },
        { status: 400 }
      );
    }

    // 결제 Intent 생성
    const result = await createCreditPurchaseIntent(credits, session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);
    return NextResponse.json(
      { success: false, error: "결제 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
