import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 프로덕션 최적화 설정
  output: 'standalone',
  
  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    // 프로덕션에서 이미지 최적화 활성화
    unoptimized: false,
    // 이미지 도메인 허용
    domains: ['res.cloudinary.com'],
  },
  
  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
  
  // 리다이렉트 설정
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
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
      allowedOrigins: ['localhost:3000', 'your-domain.com'],
    },
  },
};

export default nextConfig;
