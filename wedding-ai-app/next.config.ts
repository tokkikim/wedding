import type { NextConfig } from "next";

/**
 * Next.js 설정
 *
 * 프로덕션 최적화, 보안, 성능을 고려한 설정
 */
const nextConfig: NextConfig = {
  // 프로덕션 최적화 설정
  output: "standalone",

  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google OAuth 프로필 이미지
        pathname: "/**",
      },
    ],
    // 프로덕션에서 이미지 최적화 활성화
    unoptimized: false,
    // 이미지 품질 설정
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // XSS 보호
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Referrer 정책
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          // DNS Prefetch
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com",
              "font-src 'self' data:",
              "connect-src 'self' https://api.stripe.com https://*.google.com https://*.kakao.com",
              "frame-src 'self' https://js.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          // Permissions Policy (구 Feature-Policy)
          {
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=()",
              "geolocation=()",
              "interest-cohort=()",
            ].join(", "),
          },
        ],
      },
    ];
  },

  // 리다이렉트 설정
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // 압축 설정
  compress: true,

  // 실험적 기능
  experimental: {
    // 서버 액션 최적화
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.vercel.app"],
    },
    // Note: instrumentationHook은 Next.js 15.5.3에서 기본 활성화됨
  },

  // 로깅 설정
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },
};

export default nextConfig;
