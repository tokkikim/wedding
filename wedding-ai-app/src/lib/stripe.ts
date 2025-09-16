import Stripe from "stripe";

// Stripe 클라이언트 초기화
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
}

/**
 * 결제 Intent 생성
 */
export async function createPaymentIntent({
  amount,
  currency = "usd",
  metadata = {},
}: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe 설정이 완료되지 않았습니다.");
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // 센트 단위로 변환
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error("Stripe payment intent creation error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "결제 생성 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 결제 Intent 상태 확인
 */
export async function getPaymentIntentStatus(paymentIntentId: string): Promise<{
  success: boolean;
  status?: string;
  error?: string;
}> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      success: true,
      status: paymentIntent.status,
    };
  } catch (error) {
    console.error("Stripe payment intent retrieval error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "결제 상태 확인 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 크레딧 구매용 결제 Intent 생성
 */
export async function createCreditPurchaseIntent(
  credits: number,
  userId: string
): Promise<CreatePaymentIntentResponse> {
  const creditPrices = {
    5: 4.99, // 5 크레딧 - $4.99
    10: 9.99, // 10 크레딧 - $9.99
    20: 18.99, // 20 크레딧 - $18.99
    50: 44.99, // 50 크레딧 - $44.99
  };

  const amount = creditPrices[credits as keyof typeof creditPrices];

  if (!amount) {
    return {
      success: false,
      error: "유효하지 않은 크레딧 수량입니다.",
    };
  }

  return createPaymentIntent({
    amount,
    currency: "usd",
    metadata: {
      userId,
      credits: credits.toString(),
      type: "credit_purchase",
    },
  });
}

/**
 * 웹훅 시그니처 검증
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event | null {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    if (!webhookSecret) {
      throw new Error("Stripe webhook secret이 설정되지 않았습니다.");
    }

    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return null;
  }
}

/**
 * 환불 처리
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number
): Promise<{
  success: boolean;
  refundId?: string;
  error?: string;
}> {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // 센트 단위
    });

    return {
      success: true,
      refundId: refund.id,
    };
  } catch (error) {
    console.error("Stripe refund creation error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "환불 처리 중 오류가 발생했습니다.",
    };
  }
}
