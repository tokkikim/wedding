# WeddingAI - AI 웨딩 사진 생성 서비스

AI 기술을 활용하여 고객이 업로드한 사진을 웨딩촬영 스타일로 변환하는 웹 애플리케이션입니다.

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.17 이상
- PostgreSQL 14 이상
- npm 또는 yarn

### 설치 및 실행

1. **저장소 클론**

```bash
git clone <repository-url>
cd wedding-ai-app
```

2. **의존성 설치**

```bash
npm install
```

3. **환경 변수 설정**
   `.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/wedding_ai_db?schema=public"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Kakao OAuth
KAKAO_CLIENT_ID="your-kakao-client-id"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"

# AI Services
GEMINI_API_KEY="your-gemini-api-key"
REPLICATE_API_TOKEN="your-replicate-api-token"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Stripe
STRIPE_PUBLIC_KEY="your-stripe-public-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
```

4. **데이터베이스 설정**

```bash
npx prisma generate
npx prisma db push
```

5. **개발 서버 실행**

```bash
npm run dev
```

애플리케이션이 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 📁 프로젝트 구조

```
wedding-ai-app/
├── prisma/                    # 데이터베이스 스키마
├── public/                    # 정적 파일
├── src/
│   ├── app/                   # App Router 페이지
│   │   ├── _components/       # 공용 컴포넌트
│   │   ├── api/              # API 라우트
│   │   ├── upload/           # 업로드 페이지
│   │   └── result/           # 결과 페이지
│   ├── lib/                  # 유틸리티 라이브러리
│   ├── store/                # 상태 관리
│   └── types/                # TypeScript 타입
├── ARCHITECTURE.md           # 아키텍처 문서
├── DATABASE.md               # 데이터베이스 관리 가이드
└── README.md                 # 이 파일
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

**상세한 데이터베이스 관리 가이드는 [DATABASE.md](./DATABASE.md)를 참고하세요.**

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

### 에러 추적

- Vercel Analytics
- 콘솔 로그 모니터링

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
