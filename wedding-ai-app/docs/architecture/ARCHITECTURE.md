# WeddingAI 아키텍처 문서

## 📋 프로젝트 개요

WeddingAI는 고객이 업로드한 사진을 AI로 분석하여 웨딩촬영 스타일의 고품질 사진을 생성하는 웹 애플리케이션입니다.

## 🏗 시스템 아키텍처

### 전체 구조도

```
┌─────────────────────────────────────────────────────────────────┐
│                          Frontend (Next.js)                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Pages (SSR)   │  │  Components     │  │  Client State   │ │
│  │                 │  │  (Server/Client)│  │   (Zustand)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js API Routes)            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Authentication │  │  Image Upload   │  │  AI Generation  │ │
│  │   (NextAuth)    │  │   Processing    │  │   Management    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Database      │  │  File Storage   │  │  External APIs  │ │
│  │  (PostgreSQL)   │  │  (Cloudinary)   │  │  (Gemini AI)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 폴더 구조

```
wedding-ai-app/
├── prisma/
│   └── schema.prisma              # 데이터베이스 스키마
├── public/                       # 정적 파일
├── src/
│   ├── app/                      # App Router 기반 라우팅
│   │   ├── _components/          # 공용 컴포넌트
│   │   │   ├── ui/              # 기본 UI 컴포넌트
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   └── LoadingSpinner.tsx
│   │   │   ├── ImageUpload.tsx  # 이미지 업로드 컴포넌트
│   │   │   ├── Navigation.tsx   # 네비게이션
│   │   │   └── SessionProvider.tsx
│   │   ├── api/                 # API 라우트
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   ├── generate/        # 이미지 생성 API
│   │   │   └── images/          # 이미지 관련 API
│   │   ├── upload/              # 업로드 페이지
│   │   ├── result/              # 결과 페이지
│   │   │   └── [id]/
│   │   ├── globals.css          # 전역 스타일
│   │   ├── layout.tsx           # 루트 레이아웃
│   │   └── page.tsx             # 홈 페이지
│   ├── lib/                     # 유틸리티 라이브러리
│   │   ├── auth.ts              # NextAuth 설정
│   │   ├── prisma.ts            # Prisma 클라이언트
│   │   └── utils.ts             # 유틸리티 함수
│   ├── store/                   # 상태 관리 (Zustand)
│   │   ├── useAuthStore.ts
│   │   └── useImageStore.ts
│   └── types/                   # TypeScript 타입 정의
│       └── index.ts
├── package.json
└── tsconfig.json
```

## 🛠 기술 스택 상세

### Frontend

#### Next.js 14 (App Router)

- **서버 컴포넌트 우선**: 기본적으로 서버에서 렌더링
- **클라이언트 컴포넌트**: 상호작용이 필요한 경우만 `"use client"` 사용
- **케밥케이스 라우팅**: `/upload`, `/result/[id]` 등

#### TypeScript

- **Strict 모드** 활성화
- **타입 안전성** 보장
- **인터페이스 기반** 데이터 모델링

#### TailwindCSS

- **유틸리티 퍼스트** 스타일링
- **반응형 디자인** 지원
- **커스텀 컴포넌트** 스타일링

### State Management

#### Zustand

- **경량 상태 관리**: Redux보다 간단하고 빠름
- **타입 안전성**: TypeScript 완벽 지원
- **영속성**: localStorage 연동

```typescript
// useAuthStore.ts
interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  updateCredits: (credits: number) => void;
}
```

### Authentication

#### NextAuth.js v5

- **소셜 로그인**: Google, Kakao 지원
- **세션 관리**: 데이터베이스 기반
- **보안**: CSRF 보호, JWT 토큰

```typescript
// auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GoogleProvider, KakaoProvider],
  callbacks: {
    async session({ session, user }) {
      // 사용자 크레딧 정보 세션에 추가
    },
  },
});
```

### Database

#### PostgreSQL + Prisma

- **타입 안전한 ORM**: Prisma 스키마 기반
- **마이그레이션**: 스키마 변경 관리
- **관계형 데이터**: User, Account, Session, Order, GeneratedImage

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  credits       Int       @default(3)
  images        GeneratedImage[]
}

model GeneratedImage {
  id           String      @id @default(cuid())
  userId       String
  originalUrl  String
  generatedUrl String?
  status       ImageStatus @default(PROCESSING)
  user         User        @relation(fields: [userId], references: [id])
}
```

## 🔄 데이터 플로우

### 이미지 생성 프로세스

```
1. 사용자 인증 확인
   ↓
2. 크레딧 확인
   ↓
3. 이미지 업로드 & 검증
   ↓
4. GeneratedImage 레코드 생성 (PROCESSING)
   ↓
5. 크레딧 차감
   ↓
6. AI 모델 호출 (백그라운드)
   ↓
7. 결과 업데이트 (COMPLETED/FAILED)
   ↓
8. 사용자에게 결과 표시
```

### API 엔드포인트

#### POST /api/generate

```typescript
// Request
FormData {
  image: File,
  style: string,
  prompt: string
}

// Response
{
  success: boolean,
  imageId?: string,
  error?: string
}
```

#### GET /api/images/[id]/status

```typescript
// Response
{
  id: string,
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED',
  generatedUrl?: string,
  createdAt: Date
}
```

## 🎨 UI/UX 설계

### 디자인 시스템

#### 색상 팔레트

- **Primary**: Rose (웨딩 테마)
- **Secondary**: Pink (로맨틱한 느낌)
- **Neutral**: Gray (텍스트, 배경)

#### 컴포넌트 구조

```typescript
// Button 컴포넌트 예시
interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}
```

#### 반응형 디자인

- **Mobile First**: 모바일 우선 설계
- **Breakpoints**: sm (640px), md (768px), lg (1024px)
- **Grid System**: TailwindCSS Grid 사용

### 사용자 경험 (UX)

#### 페이지 플로우

1. **랜딩 페이지**: 서비스 소개 → CTA
2. **업로드 페이지**: 이미지 업로드 → 스타일 선택 → 생성
3. **결과 페이지**: 진행 상황 → 결과 확인 → 다운로드/공유

#### 상호작용 패턴

- **드래그 앤 드롭**: 직관적인 이미지 업로드
- **실시간 피드백**: 로딩 상태, 진행률 표시
- **폴링**: 생성 상태를 2초마다 확인

## 🔒 보안 고려사항

### 인증 & 권한

- **세션 기반 인증**: NextAuth.js 사용
- **CSRF 보호**: 자동으로 처리
- **API 보호**: 모든 민감한 API에 인증 확인

### 데이터 보호

- **이미지 검증**: 파일 타입, 크기 제한
- **SQL 인젝션 방지**: Prisma ORM 사용
- **환경 변수**: 민감한 정보 분리

### 파일 업로드 보안

```typescript
// 파일 검증 예시
const validateImageFile = (file: File) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "지원하지 않는 파일 형식" };
  }

  if (file.size > maxSize) {
    return { valid: false, error: "파일 크기 초과" };
  }

  return { valid: true };
};
```

## ⚡ 성능 최적화

### Next.js 최적화

- **서버 컴포넌트**: 초기 로딩 속도 향상
- **이미지 최적화**: next/image 컴포넌트 사용
- **코드 분할**: 동적 import 사용

### 데이터베이스 최적화

- **인덱싱**: 자주 조회되는 컬럼에 인덱스
- **N+1 문제 방지**: Prisma include/select 활용

### 클라이언트 최적화

- **상태 관리**: 불필요한 리렌더링 방지
- **이미지 캐싱**: 브라우저 캐시 활용
- **지연 로딩**: 필요한 시점에 로드

## 🚀 배포 및 운영

### 배포 환경

- **Vercel**: Next.js 최적화된 플랫폼
- **PostgreSQL**: Vercel Postgres 또는 별도 서버
- **환경 변수**: Vercel 대시보드에서 관리

### 모니터링

- **에러 추적**: Sentry 또는 Vercel Analytics
- **성능 모니터링**: Lighthouse CI
- **로그 관리**: Vercel Functions 로그

### CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
```

## 🔄 확장 계획

### Phase 2 기능

- **결제 시스템**: Stripe 연동
- **이미지 갤러리**: 생성된 이미지 관리
- **배치 처리**: 여러 이미지 동시 생성

### Phase 3 고도화

- **AI 모델 업그레이드**: 더 정교한 생성 모델
- **실시간 미리보기**: WebSocket 기반
- **소셜 기능**: 이미지 공유, 좋아요

### 성능 개선

- **CDN**: 이미지 전송 최적화
- **캐싱**: Redis 기반 캐싱
- **큐 시스템**: Bull Queue로 백그라운드 작업

---

**작성일**: 2024년 12월 19일  
**버전**: 1.0  
**작성자**: AI Assistant
