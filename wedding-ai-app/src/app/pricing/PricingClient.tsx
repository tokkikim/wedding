"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Check, CreditCard, Zap, Crown, Star } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/Card";
import { useAuthStore } from "@/store/useAuthStore";

interface PricingPlan {
  id: string;
  name: string;
  credits: number;
  price: number;
  originalPrice?: number;
  popular?: boolean;
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "스타터",
    credits: 5,
    price: 4.99,
    features: [
      "5개 크레딧",
      "모든 웨딩 스타일",
      "고화질 다운로드",
      "이메일 지원",
    ],
    icon: Zap,
  },
  {
    id: "popular",
    name: "인기",
    credits: 10,
    price: 9.99,
    originalPrice: 12.99,
    popular: true,
    features: [
      "10개 크레딧",
      "모든 웨딩 스타일",
      "고화질 다운로드",
      "우선 처리",
      "이메일 지원",
    ],
    icon: Star,
  },
  {
    id: "premium",
    name: "프리미엄",
    credits: 20,
    price: 18.99,
    originalPrice: 24.99,
    features: [
      "20개 크레딧",
      "모든 웨딩 스타일",
      "고화질 다운로드",
      "우선 처리",
      "전용 지원",
      "배치 처리",
    ],
    icon: Crown,
  },
  {
    id: "enterprise",
    name: "엔터프라이즈",
    credits: 50,
    price: 44.99,
    originalPrice: 59.99,
    features: [
      "50개 크레딧",
      "모든 웨딩 스타일",
      "고화질 다운로드",
      "최우선 처리",
      "전용 지원",
      "배치 처리",
      "API 접근",
    ],
    icon: CreditCard,
  },
];

type PaymentMessageType = "success" | "error" | "info";

interface PaymentMessage {
  type: PaymentMessageType;
  text: string;
}

export function PricingClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] =
    useState<ReturnType<typeof loadStripe> | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<PaymentMessage | null>(
    null
  );

  const resetPaymentState = () => {
    setSelectedPlan(null);
    setClientSecret(null);
    setStripePromise(null);
  };

  const setStatusMessage = (type: PaymentMessageType, text: string) => {
    setPaymentMessage({ type, text });
  };

  const elementsOptions = useMemo<StripeElementsOptions | undefined>(() => {
    if (!clientSecret) {
      return undefined;
    }

    return {
      clientSecret,
      appearance: {
        theme: "stripe",
        labels: "floating",
      },
    };
  }, [clientSecret]);

  const handlePurchase = async (plan: PricingPlan) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setLoading(plan.id);
    setPaymentMessage(null);

    try {
      const response = await fetch("/api/payment/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credits: plan.credits,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success && result.clientSecret) {
        if (!result.publishableKey) {
          setStatusMessage(
            "error",
            "Stripe 설정에 문제가 있습니다. 잠시 후 다시 시도해주세요."
          );
          return;
        }

        setSelectedPlan(plan);
        setClientSecret(result.clientSecret);
        setStripePromise(loadStripe(result.publishableKey));
      } else {
        setStatusMessage(
          "error",
          result.error || "결제 생성에 실패했습니다."
        );
      }
    } catch (error) {
      console.error("Purchase error:", error);
      setStatusMessage("error", "결제 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(null);
    }
  };

  const handlePaymentCancel = () => {
    resetPaymentState();
    setStatusMessage("info", "결제를 취소했습니다.");
  };

  const handlePaymentSuccess = (message: string) => {
    setStatusMessage("success", message);
    resetPaymentState();
  };

  const handlePaymentError = (message: string) => {
    setStatusMessage("error", message);
  };

  const handlePaymentProcessing = (message: string) => {
    setStatusMessage("info", message);
  };

  const getMessageClasses = (type: PaymentMessageType) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50 text-green-700";
      case "error":
        return "border-red-200 bg-red-50 text-red-600";
      default:
        return "border-blue-200 bg-blue-50 text-blue-700";
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">크레딧 구매</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          AI 웨딩 사진 생성을 위한 크레딧을 구매하세요. 더 많이 구매할수록 더
          저렴합니다.
        </p>
      </div>

      {paymentMessage && (
        <div
          className={`mb-8 rounded-lg border p-4 text-sm ${getMessageClasses(
            paymentMessage.type
          )}`}
        >
          {paymentMessage.text}
        </div>
      )}

      {/* 가격 플랜 */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-4">
        {pricingPlans.map((plan) => {
          const Icon = plan.icon;
          const isPopular = plan.popular;
          const discount = plan.originalPrice
            ? Math.round(
                ((plan.originalPrice - plan.price) / plan.originalPrice) * 100
              )
            : 0;

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col h-full ${
                isPopular ? "ring-2 ring-rose-500 shadow-lg" : ""
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    가장 인기
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                  <Icon className="h-6 w-6 text-rose-600" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-lg">
                  {plan.credits}개 크레딧
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center flex flex-col flex-grow">
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-2">
                    {plan.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        ${plan.originalPrice}
                      </span>
                    )}
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                  </div>
                  {discount > 0 && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      {discount}% 할인
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    크레딧당 ${(plan.price / plan.credits).toFixed(2)}
                  </p>
                </div>

                <ul className="space-y-3 mb-8 text-left flex-grow min-h-[200px]">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <Button
                    className="w-full"
                    variant={isPopular ? "primary" : "outline"}
                    onClick={() => handlePurchase(plan)}
                    disabled={loading === plan.id}
                  >
                    {loading === plan.id ? (
                      "처리 중..."
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        구매하기
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedPlan && elementsOptions && stripePromise && (
        <div className="mt-12">
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                {selectedPlan.name} 결제
              </CardTitle>
              <CardDescription>
                총 결제 금액 ${selectedPlan.price.toFixed(2)} ·
                {" "}
                {selectedPlan.credits}개 크레딧
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={elementsOptions}>
                <PaymentCheckoutForm
                  plan={selectedPlan}
                  onCancel={handlePaymentCancel}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onProcessing={handlePaymentProcessing}
                />
              </Elements>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FAQ 섹션 */}
      <div className="mt-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          자주 묻는 질문
        </h2>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>크레딧은 어떻게 사용되나요?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                AI 웨딩 사진을 1개 생성할 때마다 1크레딧이 소모됩니다. 크레딧은
                구매 후 즉시 사용할 수 있으며, 만료되지 않습니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>환불이 가능한가요?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                구매 후 7일 이내에 사용하지 않은 크레딧에 대해서는 전액 환불이
                가능합니다. 자세한 내용은 고객지원팀에 문의하세요.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>결제는 어떻게 하나요?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Stripe를 통한 안전한 결제를 지원합니다. 신용카드, 체크카드,
                그리고 다양한 디지털 지갑을 사용할 수 있습니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>크레딧은 언제까지 사용할 수 있나요?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                구매한 크레딧은 만료되지 않으며, 계정이 활성화되어 있는 한
                언제든지 사용할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA 섹션 */}
      <div className="mt-24 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">지금 시작해보세요</CardTitle>
            <CardDescription className="text-lg">
              첫 번째 AI 웨딩 사진을 만들어보세요. 새 사용자에게는 3크레딧을
              무료로 제공합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => router.push("/upload")}>
                무료로 시작하기
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/gallery")}
              >
                갤러리 보기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface PaymentCheckoutFormProps {
  plan: PricingPlan;
  onCancel: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onProcessing: (message: string) => void;
}

function PaymentCheckoutForm({
  plan,
  onCancel,
  onSuccess,
  onError,
  onProcessing,
}: PaymentCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { update } = useSession();
  const updateCredits = useAuthStore((state) => state.updateCredits);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setErrorMessage(null);
  }, [plan.id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/pricing`,
        },
        redirect: "if_required",
      });

      if (error) {
        const message =
          error.message || "결제를 완료할 수 없습니다. 다시 시도해주세요.";
        setErrorMessage(message);
        onError(message);
        return;
      }

      if (paymentIntent) {
        if (paymentIntent.status === "succeeded") {
          try {
            const refreshedSession = await update();
            if (refreshedSession?.user?.credits !== undefined) {
              updateCredits(refreshedSession.user.credits);
            }
          } catch (sessionError) {
            console.error("Session refresh error:", sessionError);
          }

          onSuccess(
            `결제가 완료되었습니다! ${plan.credits} 크레딧이 계정에 추가되었습니다.`
          );
          return;
        }

        if (paymentIntent.status === "processing") {
          onProcessing(
            "결제를 처리 중입니다. 잠시 후 크레딧이 계정에 반영됩니다."
          );
          return;
        }

        if (paymentIntent.status === "requires_payment_method") {
          const message =
            "결제를 완료할 수 없습니다. 다른 결제 수단으로 다시 시도해주세요.";
          setErrorMessage(message);
          onError(message);
          return;
        }

        if (paymentIntent.status === "requires_action") {
          onProcessing("추가 인증이 필요합니다. 안내에 따라 결제를 완료해주세요.");
          return;
        }
      }

      const message =
        "결제 상태를 확인할 수 없습니다. 다시 시도해주세요.";
      setErrorMessage(message);
      onError(message);
    } catch (error) {
      console.error("Payment confirmation error:", error);
      const message = "결제 처리 중 오류가 발생했습니다.";
      setErrorMessage(message);
      onError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: "tabs" }} />
      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button type="submit" disabled={!stripe || isSubmitting}>
          {isSubmitting
            ? "결제 처리 중..."
            : `${plan.credits} 크레딧 결제하기`}
        </Button>
      </div>
    </form>
  );
}
