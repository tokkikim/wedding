"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/app/_components/ui/Button";

type ProviderId = "google" | "kakao";

type ProviderButton = {
  id: ProviderId;
  label: string;
  description: string;
  icon: JSX.Element;
};

const providerButtons: ProviderButton[] = [
  {
    id: "google",
    label: "Google 계정으로 계속하기",
    description: "Gmail 및 Google Workspace 계정",
    icon: (
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-semibold text-rose-500 shadow-sm">
        G
      </span>
    ),
  },
  {
    id: "kakao",
    label: "Kakao 계정으로 계속하기",
    description: "카카오톡으로 간편 로그인",
    icon: (
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-semibold text-rose-500 shadow-sm">
        K
      </span>
    ),
  },
];

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [callbackUrl, setCallbackUrl] = useState("/upload");
  const [loadingProvider, setLoadingProvider] = useState<ProviderId | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const queryCallbackUrl = useMemo(() => searchParams.get("callbackUrl"), [searchParams]);

  useEffect(() => {
    if (queryCallbackUrl) {
      setCallbackUrl(queryCallbackUrl);
      return;
    }

    if (typeof window !== "undefined" && document.referrer) {
      try {
        const refUrl = new URL(document.referrer);
        if (refUrl.origin === window.location.origin) {
          const refPath = `${refUrl.pathname}${refUrl.search}${refUrl.hash}`;
          if (refPath && refPath !== window.location.pathname) {
            setCallbackUrl(refPath);
            return;
          }
        }
      } catch (error) {
        console.error("Failed to parse referrer", error);
      }
    }

    setCallbackUrl("/upload");
  }, [queryCallbackUrl]);

  const handleSignIn = async (provider: ProviderId) => {
    setErrorMessage(null);
    setLoadingProvider(provider);
    try {
      const result = await signIn(provider, { redirect: false, callbackUrl });

      if (result?.error) {
        setErrorMessage("로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }

      if (result?.url) {
        router.push(result.url);
      } else {
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error("Sign-in error", error);
      setErrorMessage("로그인 도중 문제가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-xl rounded-3xl border border-rose-100 bg-white p-10 shadow-xl shadow-rose-100/50">
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center rounded-full bg-rose-100 px-4 py-1 text-sm font-medium text-rose-700">
              환영합니다
            </div>
            <h1 className="text-3xl font-bold text-rose-700">웨딩 AI 스튜디오 로그인</h1>
            <p className="text-base text-rose-500">
              AI가 추천하는 웨딩 스타일을 경험하려면 간편하게 로그인해 주세요.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {providerButtons.map((provider) => (
              <Button
                key={provider.id}
                type="button"
                variant="secondary"
                size="lg"
                className="w-full justify-between gap-4 border border-rose-200 bg-rose-50/80 text-rose-700 hover:bg-rose-100"
                loading={loadingProvider === provider.id}
                onClick={() => handleSignIn(provider.id)}
                disabled={loadingProvider !== null && loadingProvider !== provider.id}
              >
                <span className="flex items-center gap-4">
                  {provider.icon}
                  <span className="text-left">
                    <span className="block text-base font-semibold">{provider.label}</span>
                    <span className="block text-sm font-normal text-rose-500">
                      {provider.description}
                    </span>
                  </span>
                </span>
                <svg
                  className="h-5 w-5 text-rose-400"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            ))}
          </div>

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {errorMessage}
            </div>
          )}

          <div className="mt-8 flex flex-col items-center gap-3 text-sm text-rose-500">
            <p>이전에 방문하셨다면 로그인 후 바로 이전 페이지로 이동해 드려요.</p>
            <Button
              type="button"
              variant="ghost"
              size="md"
              className="text-rose-600 hover:text-rose-700"
              onClick={() => router.back()}
            >
              돌아가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
