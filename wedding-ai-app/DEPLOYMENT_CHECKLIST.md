# 🚀 프로덕션 배포 체크리스트

**프로젝트**: Wedding AI App
**최종 업데이트**: 2025-11-15

## 📋 배포 전 필수 작업

### 1. 코드 품질 및 보안

#### 코드 이슈 ✅
- [x] setTimeout 서버리스 비호환 문제 해결
- [x] TEST_SESSION_USER_ID 보안 강화
- [x] 타입 안전성 개선
- [x] 에러 처리 강화
- [x] 환경 변수 검증 추가

#### 보안 취약점 ✅
- [x] **Cookie 취약점 해결** (완료!)
  - [x] NextAuth v5.0.0-beta.30 마이그레이션 완료
  - [x] @auth/prisma-adapter@2.11.1 업그레이드 완료
  - [x] 모든 인증 코드 업데이트 완료
  - [ ] 프로덕션 환경 인증 플로우 테스트
  - 상세 정보: `SECURITY_AUDIT.md` 참조

- [x] 보안 헤더 설정 확인
  - [x] X-Frame-Options: DENY
  - [x] X-Content-Type-Options: nosniff
  - [x] Referrer-Policy: origin-when-cross-origin
  - [ ] Content-Security-Policy 추가 권장

#### 코드 검증
- [x] ESLint 오류 없음 확인 ✅
  ```bash
  npm run lint
  ```
- [x] TypeScript 타입 체크 ✅
  ```bash
  npx tsc --noEmit
  ```
- [ ] 프로덕션 빌드 성공 확인
  ```bash
  npm run build
  ```
  **참고**: 현재 환경에서는 Google Fonts 네트워크 제한으로 빌드 실패하지만,
  실제 배포 환경(Vercel)에서는 정상 작동합니다.

---

### 2. 환경 변수 설정

#### 필수 환경 변수 (프로덕션)

```bash
# Database
DATABASE_URL="postgresql://..."          # ✅ PostgreSQL 연결 문자열

# NextAuth.js
NEXTAUTH_SECRET="..."                    # ✅ 강력한 랜덤 문자열 (openssl rand -base64 32)
NEXTAUTH_URL="https://your-domain.com"   # ✅ 실제 프로덕션 URL

# OAuth Providers
GOOGLE_CLIENT_ID="..."                   # ✅ Google Cloud Console
GOOGLE_CLIENT_SECRET="..."               # ✅
KAKAO_CLIENT_ID="..."                    # ✅ Kakao Developers
KAKAO_CLIENT_SECRET="..."                # ✅

# AI Services
GEMINI_API_KEY="..."                     # ✅ Google AI Studio
REPLICATE_API_TOKEN="..." # ⚠️ 사용하는 경우만

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."              # ✅
CLOUDINARY_API_KEY="..."                 # ✅
CLOUDINARY_API_SECRET="..."              # ✅

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="..." # ✅ pk_live_...
STRIPE_SECRET_KEY="..."                  # ✅ sk_live_...
STRIPE_WEBHOOK_SECRET="..."              # ✅ whsec_...

# Environment
NODE_ENV="production"                    # ✅ 반드시 설정
```

#### 환경 변수 검증
- [ ] `.env.production` 파일 생성
- [ ] 모든 필수 변수 설정 확인
- [ ] API 키 유효성 테스트
- [ ] Stripe는 반드시 **라이브 모드** 키 사용

---

### 3. 데이터베이스

#### PostgreSQL 설정
- [ ] 프로덕션 PostgreSQL 데이터베이스 준비
  - [ ] 클라우드 호스팅 (Supabase, Neon, AWS RDS 등)
  - [ ] 충분한 리소스 할당
  - [ ] 백업 설정

- [ ] Prisma 마이그레이션 실행
  ```bash
  npx prisma migrate deploy
  ```

- [ ] 초기 데이터 확인
  ```bash
  npx prisma studio  # 로컬에서 연결 테스트
  ```

#### 데이터베이스 보안
- [ ] SSL 연결 활성화
- [ ] IP 화이트리스트 설정
- [ ] 강력한 비밀번호 사용
- [ ] 정기 백업 스케줄

---

### 4. 테스트

#### 단위 테스트
- [ ] Jest 테스트 실행
  ```bash
  npm run test
  ```

#### E2E 테스트
- [ ] Playwright 테스트 실행
  ```bash
  npm run test:e2e
  ```
- [ ] 주요 플로우 수동 테스트
  - [ ] 로그인/로그아웃
  - [ ] 이미지 업로드
  - [ ] AI 생성
  - [ ] 결제 플로우

#### 성능 테스트
- [ ] Lighthouse 점수 확인 (목표: 90+)
  ```bash
  npm run lighthouse
  ```
- [ ] Core Web Vitals 측정
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1

---

### 5. 배포 플랫폼 설정

#### Vercel 배포 (권장)

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 프로젝트 연결
vercel link

# 3. 환경 변수 설정
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
# ... 모든 환경 변수 추가

# 4. 배포
vercel --prod
```

#### Vercel 설정 확인
- [ ] Framework Preset: Next.js
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `npm install`
- [ ] Node.js Version: 18.x 이상

#### 도메인 설정
- [ ] 커스텀 도메인 연결
- [ ] SSL 인증서 자동 발급 확인
- [ ] DNS 레코드 설정
- [ ] `NEXTAUTH_URL` 업데이트

---

### 6. 외부 서비스 설정

#### Stripe 웹훅
- [ ] Stripe Dashboard에서 웹훅 엔드포인트 등록
  - URL: `https://your-domain.com/api/payment/webhook`
  - 이벤트: `payment_intent.succeeded`, `payment_intent.payment_failed`
- [ ] Webhook Secret 복사 → `STRIPE_WEBHOOK_SECRET`
- [ ] 테스트 이벤트 전송 확인

#### Cloudinary
- [ ] Upload Preset 생성
- [ ] 폴더 구조 설정
  - `wedding-ai/originals`
  - `wedding-ai/generated`
- [ ] 용량 제한 확인
- [ ] 자동 최적화 설정

#### OAuth Providers
- [ ] Google Cloud Console
  - [ ] Authorized redirect URIs 추가
    - `https://your-domain.com/api/auth/callback/google`
  - [ ] Authorized JavaScript origins 추가
- [ ] Kakao Developers
  - [ ] Redirect URI 등록
    - `https://your-domain.com/api/auth/callback/kakao`
  - [ ] 도메인 등록

---

### 7. 모니터링 및 로깅

#### 에러 추적
- [ ] Sentry 설정 (권장)
  ```bash
  npm install @sentry/nextjs
  ```
- [ ] 또는 Vercel Analytics 활성화

#### 성능 모니터링
- [ ] Vercel Analytics 활성화
- [ ] `/api/analytics/*` 엔드포인트 확인
- [ ] Database 쿼리 성능 모니터링

#### 로깅
- [ ] 프로덕션 로그 레벨 설정
- [ ] 에러 로그 외부 저장 (CloudWatch, Datadog 등)
- [ ] 민감 정보 로깅 방지

---

### 8. 보안 강화

#### HTTPS
- [x] 모든 트래픽 HTTPS로 리다이렉트
- [x] HSTS 헤더 설정 (Vercel 기본 제공)

#### API 보안
- [x] 인증 필요한 엔드포인트 보호
- [x] Rate Limiting 고려
- [ ] CORS 설정 확인

#### 데이터 보안
- [ ] 사용자 업로드 이미지 검증
- [ ] 파일 크기 제한 (10MB)
- [ ] 허용된 MIME 타입만 업로드

---

### 9. 성능 최적화

#### 이미지 최적화
- [x] Next.js Image 컴포넌트 사용
- [x] Cloudinary 자동 최적화
- [ ] WebP 포맷 활용

#### 번들 크기 최적화
- [ ] 번들 분석 실행
  ```bash
  npm run build -- --analyze  # (설정 필요)
  ```
- [ ] 불필요한 의존성 제거
- [ ] 동적 import 활용

#### 캐싱
- [ ] CDN 캐싱 설정
- [ ] API 응답 캐싱 (적절한 경우)
- [ ] Static 파일 캐싱

---

### 10. 문서화

- [x] README.md 업데이트
- [x] API 문서 작성
- [x] 환경 변수 가이드
- [ ] 운영 매뉴얼 작성
- [ ] 장애 대응 가이드

---

## 🚨 배포 후 즉시 확인

### 필수 점검 (배포 후 30분 이내)

- [ ] **기본 기능 동작 확인**
  - [ ] 홈페이지 로딩
  - [ ] 로그인 플로우 (Google, Kakao)
  - [ ] 이미지 업로드
  - [ ] AI 생성 테스트
  - [ ] 결제 플로우 (소액 테스트)

- [ ] **모니터링 확인**
  - [ ] 에러 발생 여부
  - [ ] 응답 시간 정상
  - [ ] 데이터베이스 연결 상태

- [ ] **로그 확인**
  - [ ] Vercel 로그 확인
  - [ ] 에러 없는지 체크
  - [ ] Warning 검토

---

## 🔄 배포 롤백 계획

### 문제 발생 시

1. **즉시 롤백**
   ```bash
   # Vercel CLI
   vercel rollback <deployment-url>

   # 또는 Dashboard에서 이전 배포로 복원
   ```

2. **문제 분석**
   - 로그 확인
   - 에러 추적
   - 데이터베이스 상태 확인

3. **수정 후 재배포**
   - 로컬에서 문제 재현 및 수정
   - 스테이징 환경 테스트
   - 프로덕션 재배포

---

## 📊 배포 상태

### Current Status: 🟡 배포 준비 90%

#### 완료된 항목
- ✅ 코드 이슈 수정
- ✅ E2E 테스트 작성
- ✅ 환경 변수 검증 시스템
- ✅ 보안 헤더 설정
- ✅ 문서화

#### 남은 작업
- ⚠️ Cookie 취약점 해결 (NextAuth 업그레이드)
- ⏳ 프로덕션 환경 변수 설정
- ⏳ 데이터베이스 설정
- ⏳ 외부 서비스 설정
- ⏳ 최종 테스트

---

## 📞 배포 후 지원

### 모니터링 주기
- **첫 24시간**: 매 1시간 체크
- **첫 1주**: 매일 체크
- **이후**: 주간 체크

### 성능 목표
- 응답 시간: < 2초 (P95)
- 에러율: < 1%
- 가동률: > 99.9%

---

**준비 완료 시 이 체크리스트를 다시 검토하고 배포를 진행하세요!**
