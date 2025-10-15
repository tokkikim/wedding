# 웨딩 AI 앱 배포 가이드

## 🚀 프로덕션 배포 준비

### 1. 환경 변수 설정

프로덕션 환경에서 다음 환경 변수들을 설정해야 합니다:

```bash
# Database (Production PostgreSQL)
DATABASE_URL="postgresql://username:password@production-host:5432/wedding_ai_db?schema=public"

# NextAuth.js (Production)
NEXTAUTH_SECRET="production-secret-key-here"
NEXTAUTH_URL="https://your-domain.com"

# Google OAuth (Production)
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-client-secret"

# Kakao OAuth (Production)
KAKAO_CLIENT_ID="your-production-kakao-client-id"
KAKAO_CLIENT_SECRET="your-production-kakao-client-secret"

# AI Services (Production)
GEMINI_API_KEY="your-production-gemini-api-key"
REPLICATE_API_TOKEN="your-production-replicate-api-token"

# Cloudinary (Production)
CLOUDINARY_CLOUD_NAME="your-production-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-production-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-production-cloudinary-api-secret"

# Stripe (Production)
STRIPE_PUBLIC_KEY="your-production-stripe-public-key"
STRIPE_SECRET_KEY="your-production-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-production-stripe-webhook-secret"
```

### 2. 데이터베이스 설정

#### PostgreSQL 프로덕션 데이터베이스 생성
```sql
-- 프로덕션 데이터베이스 생성
CREATE DATABASE wedding_ai_db;

-- 사용자 생성 및 권한 부여
CREATE USER wedding_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE wedding_ai_db TO wedding_user;
```

#### Prisma 마이그레이션 실행
```bash
# 프로덕션 환경에서 마이그레이션 실행
npx prisma migrate deploy

# 데이터베이스 시드 (선택사항)
npx prisma db seed
```

### 3. 빌드 및 배포

#### 로컬 빌드 테스트
```bash
# 의존성 설치
npm install

# 빌드 테스트
npm run build

# 프로덕션 모드 테스트
npm start
```

#### Vercel 배포 (권장)
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 배포
vercel --prod

# 환경 변수 설정 (Vercel 대시보드에서)
# https://vercel.com/dashboard
```

#### Docker 배포
```dockerfile
# Dockerfile 예시
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 4. 보안 설정

#### HTTPS 설정
- SSL 인증서 설정 (Let's Encrypt 권장)
- HSTS 헤더 설정
- 보안 헤더 추가

#### 방화벽 설정
```bash
# 필요한 포트만 열기
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### 5. 모니터링 설정

#### 로그 관리
```bash
# PM2를 사용한 프로세스 관리
npm install -g pm2

# 애플리케이션 시작
pm2 start npm --name "wedding-ai" -- start

# 로그 확인
pm2 logs wedding-ai

# 모니터링
pm2 monit
```

#### 성능 모니터링
- Vercel Analytics (Vercel 배포 시)
- Google Analytics
- Sentry (에러 추적)

### 6. 백업 전략

#### 데이터베이스 백업
```bash
# 자동 백업 스크립트
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql

# S3에 업로드 (선택사항)
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
```

### 7. 도메인 설정

#### DNS 설정
- A 레코드: 도메인 → 서버 IP
- CNAME: www → 도메인
- SSL 인증서 설정

### 8. 배포 후 체크리스트

- [ ] 모든 환경 변수 설정 완료
- [ ] 데이터베이스 연결 확인
- [ ] OAuth 로그인 테스트
- [ ] 이미지 업로드/생성 테스트
- [ ] 결제 시스템 테스트
- [ ] SSL 인증서 확인
- [ ] 성능 테스트 (Lighthouse)
- [ ] 모바일 반응형 테스트
- [ ] 에러 로깅 설정 확인

### 9. 롤백 계획

#### 긴급 롤백
```bash
# 이전 버전으로 롤백
vercel rollback

# 또는 Docker 컨테이너 재시작
docker-compose down
docker-compose up -d
```

### 10. 유지보수

#### 정기 점검 사항
- [ ] 보안 업데이트 확인
- [ ] 의존성 업데이트
- [ ] 데이터베이스 성능 모니터링
- [ ] 로그 분석
- [ ] 백업 상태 확인

---

**배포 담당자**: 개발팀  
**최종 업데이트**: 2025년 1월 16일  
**문서 버전**: 1.0
