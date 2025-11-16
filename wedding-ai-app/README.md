# WeddingAI - AI 웨딩 사진 생성 서비스

AI 기술을 활용하여 고객이 업로드한 사진을 웨딩촬영 스타일로 변환하는 웹 애플리케이션입니다.

## 🚀 빠른 시작

### 📖 **처음 시작하시나요?**

**👉 [완벽한 시작 가이드 보기 (GETTING_STARTED.md)](./GETTING_STARTED.md)**

상세한 설치 가이드, 환경 설정, 트러블슈팅을 포함한 완벽한 문서입니다.

### ⚡ 빠른 설치 (경험자용)

```bash
# 1. 저장소 클론
git clone https://github.com/tokkikim/wedding.git
cd wedding/wedding-ai-app

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env  # .env 파일 수정 필요

# 4. 데이터베이스 설정
# PostgreSQL 실행 및 wedding_ai_db 생성
npm run db:generate
npm run db:push

# 5. 개발 서버 실행
npm run dev
```

애플리케이션: http://localhost:3000
Prisma Studio: http://localhost:5555 (`npm run db:studio`)

### 필수 요구사항

- Node.js 18.17 이상
- PostgreSQL 14 이상
- npm 또는 yarn

### 주요 명령어

```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm test             # 단위 테스트
npm run test:e2e     # E2E 테스트
npm run db:studio    # 데이터베이스 GUI
npm run lint         # 코드 검사
```

## 📚 문서 찾기

모든 개발 문서는 `docs/` 폴더에 체계적으로 정리되어 있습니다.

### 🎯 빠른 시작

- **[📌 문서 인덱스](./docs/INDEX.md)** ← **여기서 시작하세요!**
  - 모든 문서의 위치와 용도를 한눈에 확인
  - 상황별 추천 문서 제공

### 📖 주요 문서

| 문서 | 설명 | 대상 |
|------|------|------|
| [📋 프로젝트 계획서](./docs/PROJECT_PLAN.md) | 전체 프로젝트 개요 및 계획 | 모든 팀원 |
| [🏗️ 시스템 아키텍처](./docs/architecture/ARCHITECTURE.md) | 시스템 구조 및 설계 | 개발자 |
| [💻 개발 가이드](./docs/guides/DEVELOPMENT.md) | 개발 환경 설정 및 코딩 규칙 | 개발자 |
| [🗄️ 데이터베이스 가이드](./docs/guides/DATABASE.md) | DB 조회 및 관리 방법 | 개발자 |
| [🧪 테스트 가이드](./docs/guides/TESTING.md) | 테스트 작성 및 실행 | 개발자, QA |
| [🚀 배포 가이드](./docs/guides/DEPLOYMENT.md) | 프로덕션 배포 방법 | DevOps |

### 📊 프로젝트 진행 상황

- [Phase 2 완료 보고서](./docs/reports/PHASE2_COMPLETION.md) - 핵심 기능 개발 완료
- [Phase 4 완료 보고서](./docs/reports/PHASE4_COMPLETION.md) - 배포 및 테스트 완료

### 📝 문서 관리

- [문서 정리 보고서](./docs/DOCUMENTATION_ORGANIZATION.md) - 문서 체계화 작업 내역
- [문서 기여 가이드](./docs/CONTRIBUTING.md) - 문서 작성 및 수정 가이드

> 💡 **Tip:** 처음 프로젝트를 시작하시나요? [문서 인덱스](./docs/INDEX.md)를 먼저 확인하세요!

---

## 📁 프로젝트 구조

```
wedding-ai-app/
├── prisma/                           # 데이터베이스 스키마
├── public/                           # 정적 파일
├── src/
│   ├── app/                          # App Router 페이지
│   │   ├── _components/              # 공용 컴포넌트
│   │   ├── api/                      # API 라우트
│   │   ├── upload/                   # 업로드 페이지
│   │   └── result/                   # 결과 페이지
│   ├── lib/                          # 유틸리티 라이브러리
│   ├── store/                        # 상태 관리
│   └── types/                        # TypeScript 타입
├── docs/                             # 📚 프로젝트 문서
│   ├── INDEX.md                      # 📌 문서 인덱스 (여기서 시작)
│   ├── PROJECT_PLAN.md               # 📋 프로젝트 전체 계획서
│   ├── guides/                       # 📖 개발 가이드
│   │   ├── DEVELOPMENT.md           # 개발 환경 및 개발 가이드
│   │   ├── DATABASE.md              # 데이터베이스 관리 가이드
│   │   ├── TESTING.md               # 테스트 가이드
│   │   └── DEPLOYMENT.md            # 배포 가이드
│   ├── architecture/                 # 🏗️ 아키텍처 문서
│   │   └── ARCHITECTURE.md          # 시스템 아키텍처 설계
│   └── reports/                      # 📊 완료 보고서
│       ├── PHASE2_COMPLETION.md     # Phase 2 완료 보고서
│       └── PHASE4_COMPLETION.md     # Phase 4 완료 보고서
├── scripts/                          # 유틸리티 스크립트
└── README.md                         # 이 파일
```

## 🛠 기술 스택

### Frontend

- **Next.js 14** - React 프레임워크 (App Router)
- **TypeScript** - 타입 안전성
- **TailwindCSS** - 유틸리티 퍼스트 CSS
- **Framer Motion** - 애니메이션
- **Zustand** - 상태 관리

### Backend

- **Next.js API Routes** - 서버 로직
- **NextAuth.js** - 인증 시스템
- **Prisma** - ORM
- **PostgreSQL** - 데이터베이스

### AI & External Services

- **Gemini AI** - 이미지 생성
- **Cloudinary** - 이미지 저장
- **Stripe** - 결제 처리

## 📖 주요 기능

### 1. 사용자 인증

- Google, Kakao 소셜 로그인
- 세션 기반 인증
- 크레딧 시스템

### 2. 이미지 업로드

- 드래그 앤 드롭 업로드
- 파일 검증 (타입, 크기)
- 미리보기 기능

### 3. AI 이미지 생성

- 다양한 웨딩 스타일 선택
- 백그라운드 처리
- 실시간 상태 업데이트

### 4. 결과 관리

- 생성 진행 상황 표시
- 고화질 다운로드
- 소셜 공유 기능

## 🔧 개발 가이드

### 컴포넌트 개발 규칙

1. **서버 컴포넌트 우선**

```typescript
// 기본은 서버 컴포넌트
export default function ServerComponent() {
  return <div>Server Component</div>;
}

// 클라이언트 기능이 필요한 경우만
("use client");
export default function ClientComponent() {
  const [state, setState] = useState();
  return <div>Client Component</div>;
}
```

2. **타입 안전성**

```typescript
// 인터페이스 정의
interface ComponentProps {
  title: string;
  onClick?: () => void;
}

// 컴포넌트에서 사용
export function Component({ title, onClick }: ComponentProps) {
  return <button onClick={onClick}>{title}</button>;
}
```

3. **스타일링 규칙**

```typescript
// TailwindCSS 클래스 사용
<div className="bg-rose-50 p-4 rounded-lg">
  <h2 className="text-xl font-bold text-gray-900">Title</h2>
</div>

// 조건부 스타일링
<button
  className={cn(
    "base-styles",
    variant === "primary" && "primary-styles",
    disabled && "disabled-styles"
  )}
>
```

### API 개발 규칙

1. **인증 확인**

```typescript
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }
  // API 로직
}
```

2. **에러 처리**

```typescript
try {
  // API 로직
  return NextResponse.json({ success: true, data });
} catch (error) {
  console.error("API Error:", error);
  return NextResponse.json(
    { error: "서버 오류가 발생했습니다." },
    { status: 500 }
  );
}
```

### 데이터베이스 작업

1. **스키마 변경**

```bash
# 스키마 수정 후
npx prisma db push        # 개발 환경
npx prisma migrate dev    # 마이그레이션 생성
```

2. **타입 생성**

```bash
npx prisma generate
```

3. **데이터 조회 및 확인**

```bash
# Prisma Studio로 GUI 확인 (가장 추천)
npm run db:studio         # http://localhost:5555 접속

# 빠른 통계 확인
npm run db:check:stats    # 사용자 수, 주문 수 등 간단 통계

# 상세 사용자 정보 확인
npm run db:check:users    # 모든 사용자의 계정, 세션, 주문, 이미지 정보

# 유연한 조회
npm run db:check          # 전체 통계
npm run db:check stats    # 전체 통계
npm run db:check users    # 사용자 목록
npm run db:check recent   # 최근 활동
```

**조회 가능한 데이터:**
- 사용자 정보 (User): 이메일, 이름, 크레딧, 가입일
- 계정 정보 (Account): OAuth 연결 정보
- 세션 정보 (Session): 활성 세션, 만료 시간
- 주문 내역 (Order): 결제 상태, 크레딧 구매 내역
- 생성 이미지 (GeneratedImage): 이미지 상태, 스타일, 생성일

**상세한 데이터베이스 관리 가이드는 [DATABASE.md](./docs/guides/DATABASE.md)를 참고하세요.**

## 🧪 테스트

### 단위 테스트

```bash
npm run test
```

### E2E 테스트

```bash
npm run test:e2e
```

### 타입 체크

```bash
npm run type-check
```

## 🚀 배포

### Vercel 배포

```bash
npm run build
vercel --prod
```

### 환경 변수 설정

Vercel 대시보드에서 프로덕션 환경 변수를 설정하세요.

### 데이터베이스 마이그레이션

```bash
npx prisma migrate deploy
```

## 📊 모니터링

### 성능 모니터링

- Lighthouse CI 자동 실행
- Core Web Vitals 추적
- 성능 메트릭 자동 수집 (`src/lib/performance.ts`)
- 데이터베이스 쿼리 성능 추적

### 에러 추적

- Vercel Analytics
- 에러 로그 데이터베이스 저장 (`ErrorLog` 테이블)
- 구조화된 에러 핸들링 (`src/lib/error-handler.ts`)

## ✨ 최근 개선사항 (2025-11-16)

프로덕션 준비도를 90%에서 **95%**로 향상시키는 주요 개선 작업을 완료했습니다.

### 🔴 Critical 개선사항

1. **백그라운드 작업 큐 시스템** (`src/lib/queue.ts`)
   - DB 기반 작업 큐로 서버리스 환경에서 안정적인 백그라운드 처리
   - 재시도 로직 및 실패 처리 구현

2. **에러 처리 체계화** (`src/lib/error-handler.ts`)
   - 통합 에러 로깅 시스템
   - 커스텀 에러 클래스 (ValidationError, UnauthorizedError 등)
   - ErrorLog 테이블에 자동 저장

3. **환경 변수 타입 안전성** (`src/lib/env.ts`)
   - Zod 기반 스키마 검증
   - 타입 안전한 환경 변수 접근
   - 앱 시작 시 자동 검증

### 🟡 Important 개선사항

4. **API Rate Limiting** (`src/lib/rate-limit.ts`)
   - 엔드포인트별 속도 제한 (일반, 이미지생성, 결제, 인증)
   - IP 기반 제한
   - RateLimitError 자동 처리

5. **Next.js 보안 강화** (`next.config.ts`)
   - Content Security Policy (CSP) 추가
   - Permissions Policy 추가
   - WebP/AVIF 이미지 최적화

6. **데이터베이스 캐싱** (`src/lib/performance.ts`)
   - 인메모리 캐싱 유틸리티
   - 쿼리 성능 측정
   - 느린 쿼리 자동 경고

### 🟢 기타 개선사항

7. **단위 테스트 추가**
   - `src/lib/__tests__/env.test.ts`
   - `src/lib/__tests__/error-handler.test.ts`
   - `src/lib/__tests__/rate-limit.test.ts`

8. **TypeScript Strict 모드 강화**
   - `noUncheckedIndexedAccess`, `noImplicitReturns` 등 추가
   - `noUnusedLocals`, `noUnusedParameters` 활성화

9. **코드 문서화**
   - 모든 새 유틸리티에 TSDoc 주석 추가
   - 사용 예시 포함

### 📖 상세 문서

자세한 개선 내용은 [CODE_IMPROVEMENTS.md](./CODE_IMPROVEMENTS.md)를 참고하세요.

## 🤝 기여 가이드

1. **코드 스타일**

   - ESLint + Prettier 사용
   - TypeScript strict 모드
   - 커밋 메시지 컨벤션 준수

2. **브랜치 전략**

   - `main`: 프로덕션 브랜치
   - `develop`: 개발 브랜치
   - `feature/*`: 기능 개발 브랜치

3. **Pull Request**
   - 코드 리뷰 필수
   - 테스트 통과 확인
   - 문서 업데이트

## 📝 라이센스

MIT License

## 📞 지원

문의사항이나 버그 리포트는 GitHub Issues를 통해 제출해주세요.

---

**개발팀**: AI Assistant  
**최종 업데이트**: 2024년 12월 19일
