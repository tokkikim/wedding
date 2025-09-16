import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { verifyWebhookSignature } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Stripe signature missing" },
        { status: 400 }
      );
    }

    // 웹훅 시그니처 검증
    const event = verifyWebhookSignature(body, signature);

    if (!event) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 이벤트 타입별 처리
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSuccess(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailure(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { userId, credits } = paymentIntent.metadata as Stripe.Metadata & {
      userId?: string;
      credits?: string;
    };

    if (!userId || !credits) {
      console.error("Missing metadata in payment intent:", paymentIntent.id);
      return;
    }

    // 사용자 크레딧 추가
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: parseInt(credits, 10),
        },
      },
    });

    // 주문 기록 생성
    await prisma.order.create({
      data: {
        userId,
        amount: paymentIntent.amount,
        credits: parseInt(credits, 10),
        status: "COMPLETED",
      },
    });

    console.log(
      `Payment succeeded: ${credits} credits added to user ${userId}`
    );
  } catch (error) {
    console.error("Error handling payment success:", error);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { userId } = paymentIntent.metadata as Stripe.Metadata & {
      userId?: string;
    };

    if (!userId) {
      console.error("Missing userId in payment intent:", paymentIntent.id);
      return;
    }

    // 실패한 주문 기록 생성
    await prisma.order.create({
      data: {
        userId,
        amount: paymentIntent.amount,
        credits: 0,
        status: "FAILED",
      },
    });

    console.log(`Payment failed for user ${userId}`);
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}
