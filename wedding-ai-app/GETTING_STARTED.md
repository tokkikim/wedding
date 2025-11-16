# 🚀 시작하기 (Getting Started)

WeddingAI 프로젝트를 처음 시작하는 개발자를 위한 완벽한 가이드입니다. 이 문서를 따라하면 로컬 환경에서 프로젝트를 실행할 수 있습니다.

## 📋 목차

1. [사전 요구사항](#1-사전-요구사항)
2. [저장소 클론](#2-저장소-클론)
3. [의존성 설치](#3-의존성-설치)
4. [데이터베이스 설정](#4-데이터베이스-설정)
5. [환경 변수 설정](#5-환경-변수-설정)
6. [데이터베이스 초기화](#6-데이터베이스-초기화)
7. [개발 서버 실행](#7-개발-서버-실행)
8. [테스트 실행](#8-테스트-실행)
9. [트러블슈팅](#9-트러블슈팅)

---

## 1. 사전 요구사항

프로젝트를 시작하기 전에 다음 프로그램들이 설치되어 있어야 합니다.

### 필수 설치 항목

#### Node.js (v18.17 이상)

**설치 확인:**
```bash
node --version  # v18.17.0 이상이어야 함
npm --version   # 9.0.0 이상 권장
```

**설치 방법:**
- macOS: `brew install node@18`
- Windows: [nodejs.org](https://nodejs.org)에서 LTS 버전 다운로드
- Linux:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```

#### PostgreSQL (v14 이상)

**설치 확인:**
```bash
psql --version  # 14.0 이상이어야 함
```

**설치 방법:**

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Windows:**
- [PostgreSQL 공식 사이트](https://www.postgresql.org/download/windows/)에서 다운로드
- 설치 시 포트는 기본값(5432) 사용 권장
- 슈퍼유저 비밀번호 설정 필요

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Git

**설치 확인:**
```bash
git --version
```

**설치 방법:**
- macOS: `brew install git`
- Windows: [git-scm.com](https://git-scm.com)에서 다운로드
- Linux: `sudo apt-get install git`

### 선택 사항 (개발 편의성)

- **VS Code**: 권장 에디터 (ESLint, Prettier 확장 포함)
- **Prisma Studio**: 데이터베이스 GUI (프로젝트에 포함됨)
- **Docker Desktop**: 컨테이너 환경 사용 시

---

## 2. 저장소 클론

### GitHub 저장소 클론

```bash
# SSH 방식 (권장)
git clone git@github.com:tokkikim/wedding.git

# HTTPS 방식
git clone https://github.com/tokkikim/wedding.git
```

### 프로젝트 디렉토리 이동

```bash
cd wedding/wedding-ai-app
```

### 브랜치 확인

```bash
git branch -a      # 모든 브랜치 확인
git status         # 현재 상태 확인
```

---

## 3. 의존성 설치

### npm 의존성 설치

```bash
npm install
```

**예상 소요 시간**: 2-5분 (인터넷 속도에 따라 다름)

### 설치 확인

```bash
npm list --depth=0
```

주요 패키지 확인:
- `next` (15.5.3)
- `react` (19.1.0)
- `@prisma/client` (6.0.0)
- `typescript` (5.x)

### 문제 발생 시

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# npm 캐시 정리
npm cache clean --force
npm install
```

---

## 4. 데이터베이스 설정

### 4.1 PostgreSQL 데이터베이스 생성

#### macOS/Linux

```bash
# PostgreSQL에 접속
psql postgres

# 데이터베이스 생성 (psql 프롬프트에서 실행)
CREATE DATABASE wedding_ai_db;

# 사용자 생성 (선택사항)
CREATE USER wedding_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE wedding_ai_db TO wedding_user;

# 종료
\q
```

#### Windows (PowerShell 또는 pgAdmin 사용)

**PowerShell 방식:**
```powershell
# PostgreSQL 사용자로 로그인
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE wedding_ai_db;
```

**pgAdmin 방식:**
1. pgAdmin 실행
2. 서버 연결 (localhost)
3. 우클릭 → Create → Database
4. 이름: `wedding_ai_db`
5. Save

### 4.2 데이터베이스 연결 테스트

```bash
# 생성된 데이터베이스 확인
psql -U postgres -l

# 데이터베이스 접속 테스트
psql -U postgres -d wedding_ai_db
```

---

## 5. 환경 변수 설정

### 5.1 `.env` 파일 생성

프로젝트 루트에 `.env` 파일을 생성합니다.

```bash
# .env.example 복사 (있는 경우)
cp .env.example .env

# 또는 직접 생성
touch .env
```

### 5.2 필수 환경 변수 설정

`.env` 파일을 열고 다음 내용을 입력합니다:

```env
# ============================================
# 데이터베이스 설정 (필수)
# ============================================
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/wedding_ai_db?schema=public"

# ============================================
# NextAuth.js 설정 (필수)
# ============================================
NEXTAUTH_SECRET="your-super-secret-key-minimum-32-characters-long-please"
NEXTAUTH_URL="http://localhost:3000"

# ============================================
# OAuth 제공자 (선택 - Google)
# ============================================
# https://console.cloud.google.com/apis/credentials 에서 생성
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# ============================================
# OAuth 제공자 (선택 - Kakao)
# ============================================
# https://developers.kakao.com/console/app 에서 생성
KAKAO_CLIENT_ID="your-kakao-client-id"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"

# ============================================
# AI 서비스 (선택 - Gemini)
# ============================================
# https://makersuite.google.com/app/apikey 에서 생성
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_IMAGE_MODEL="gemini-2.0-flash-exp"

# ============================================
# 이미지 저장소 (선택 - Cloudinary)
# ============================================
# https://cloudinary.com/console 에서 확인
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# ============================================
# 결제 서비스 (선택 - Stripe)
# ============================================
# https://dashboard.stripe.com/apikeys 에서 확인
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ============================================
# 개발 환경 설정 (선택)
# ============================================
NODE_ENV="development"
```

### 5.3 환경 변수 상세 설정 가이드

#### DATABASE_URL
포맷: `postgresql://[사용자명]:[비밀번호]@[호스트]:[포트]/[데이터베이스명]?schema=public`

예시:
- 기본 설정: `postgresql://postgres:password@localhost:5432/wedding_ai_db?schema=public`
- 사용자 지정: `postgresql://wedding_user:mypassword@localhost:5432/wedding_ai_db?schema=public`

#### NEXTAUTH_SECRET
안전한 비밀 키 생성:
```bash
# 방법 1: OpenSSL 사용
openssl rand -base64 32

# 방법 2: Node.js 사용
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Google OAuth 설정
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 생성
3. "API 및 서비스" → "사용자 인증 정보"
4. "사용자 인증 정보 만들기" → "OAuth 클라이언트 ID"
5. 애플리케이션 유형: 웹 애플리케이션
6. 승인된 리디렉션 URI: `http://localhost:3000/api/auth/callback/google`

#### Kakao OAuth 설정
1. [Kakao Developers](https://developers.kakao.com) 접속
2. 애플리케이션 추가
3. "앱 설정" → "앱 키" 확인
4. "플랫폼" → "Web 플랫폼 등록": `http://localhost:3000`
5. "제품 설정" → "카카오 로그인" 활성화
6. Redirect URI: `http://localhost:3000/api/auth/callback/kakao`

### 5.4 환경 변수 검증

개발 서버 실행 시 자동으로 검증되지만, 수동으로 확인하려면:

```bash
# TypeScript 컴파일로 환경 변수 검증
npx tsx -e "import { validateEnv } from './src/lib/env'; validateEnv();"
```

---

## 6. 데이터베이스 초기화

### 6.1 Prisma Client 생성

```bash
npm run db:generate
```

이 명령은 Prisma 스키마를 기반으로 타입 안전한 데이터베이스 클라이언트를 생성합니다.

### 6.2 데이터베이스 스키마 동기화

**개발 환경 (권장):**
```bash
npm run db:push
```

**또는 마이그레이션 생성:**
```bash
npx prisma migrate dev --name init
```

### 6.3 데이터베이스 확인

**Prisma Studio로 GUI 확인:**
```bash
npm run db:studio
```

브라우저에서 `http://localhost:5555` 자동 열림

**또는 커맨드라인으로 확인:**
```bash
npm run db:check
```

**예상 출력:**
```
📊 데이터베이스 통계
━━━━━━━━━━━━━━━━━━
전체 사용자: 0
활성 세션: 0
총 주문: 0
생성된 이미지: 0
```

### 6.4 테스트 데이터 생성 (선택사항)

```bash
# 개발 환경에서만 사용
npm run db:seed
```

---

## 7. 개발 서버 실행

### 7.1 개발 서버 시작

```bash
npm run dev
```

### 7.2 접속 확인

브라우저에서 다음 URL로 접속:
- **메인 페이지**: http://localhost:3000
- **API 상태 확인**: http://localhost:3000/api/health

### 7.3 성공 확인

다음과 같은 로그가 표시되면 성공:
```
✓ Ready in 2.5s
○ Compiling / ...
✓ Compiled / in 1.2s
✅ 환경 변수 검증 완료
```

### 7.4 주요 페이지 확인

- `/` - 홈페이지
- `/upload` - 이미지 업로드 (로그인 필요)
- `/gallery` - 갤러리 (로그인 필요)
- `/my-page` - 마이페이지 (로그인 필요)
- `/pricing` - 가격 정책
- `/auth/signin` - 로그인 페이지

---

## 8. 테스트 실행

### 8.1 단위 테스트

```bash
npm test
```

**예상 출력:**
```
PASS src/lib/__tests__/env.test.ts
PASS src/lib/__tests__/error-handler.test.ts
PASS src/lib/__tests__/rate-limit.test.ts

Test Suites: 3 passed, 3 total
Tests:       15 passed, 15 total
```

### 8.2 E2E 테스트

```bash
npm run test:e2e
```

**처음 실행 시** Playwright 브라우저 설치:
```bash
npx playwright install
```

### 8.3 TypeScript 타입 체크

```bash
npx tsc --noEmit
```

### 8.4 린트 검사

```bash
npm run lint
```

---

## 9. 트러블슈팅

### 문제 1: 데이터베이스 연결 실패

**증상:**
```
Error: Can't reach database server at `localhost:5432`
```

**해결 방법:**

1. PostgreSQL 실행 확인:
```bash
# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql

# 실행되지 않은 경우
brew services start postgresql@14    # macOS
sudo systemctl start postgresql      # Linux
```

2. 포트 확인:
```bash
lsof -i :5432  # PostgreSQL이 5432 포트에서 실행 중인지 확인
```

3. 데이터베이스 존재 확인:
```bash
psql -U postgres -l | grep wedding_ai_db
```

### 문제 2: 환경 변수 오류

**증상:**
```
❌ 환경 변수 검증 실패:
  - DATABASE_URL: 유효한 데이터베이스 URL이 필요합니다.
```

**해결 방법:**

1. `.env` 파일 존재 확인:
```bash
ls -la .env
```

2. 환경 변수 로드 확인:
```bash
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
```

3. `.env` 파일 형식 확인 (공백, 따옴표 주의)

### 문제 3: 포트 충돌

**증상:**
```
Error: Port 3000 is already in use
```

**해결 방법:**

1. 다른 프로세스 종료:
```bash
# 3000 포트 사용 프로세스 확인
lsof -i :3000

# 해당 프로세스 종료
kill -9 [PID]
```

2. 또는 다른 포트 사용:
```bash
PORT=3001 npm run dev
```

### 문제 4: Prisma 생성 오류

**증상:**
```
Error: Prisma schema file not found
```

**해결 방법:**

1. 스키마 파일 확인:
```bash
ls prisma/schema.prisma
```

2. Prisma 재설치:
```bash
npm install @prisma/client prisma --save-dev
npm run db:generate
```

### 문제 5: Node.js 버전 불일치

**증상:**
```
error: The engine "node" is incompatible with this module
```

**해결 방법:**

1. Node 버전 확인:
```bash
node --version
```

2. nvm으로 버전 변경:
```bash
nvm install 18
nvm use 18
```

### 문제 6: OAuth 로그인 실패

**증상:**
- Google/Kakao 로그인 시 "Redirect URI mismatch" 오류

**해결 방법:**

1. OAuth 콘솔에서 Redirect URI 확인
2. 정확한 URI 등록:
   - Google: `http://localhost:3000/api/auth/callback/google`
   - Kakao: `http://localhost:3000/api/auth/callback/kakao`
3. `.env` 파일의 CLIENT_ID, CLIENT_SECRET 재확인

### 문제 7: npm install 실패

**증상:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**해결 방법:**

```bash
# 방법 1: force 설치
npm install --legacy-peer-deps

# 방법 2: 캐시 정리 후 재설치
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## 🎉 설정 완료!

모든 단계를 완료했다면 이제 개발을 시작할 수 있습니다!

### 다음 단계

1. **코드 수정 시작**
   - `src/app/` - 페이지 및 라우트
   - `src/components/` - 재사용 가능한 컴포넌트
   - `src/lib/` - 유틸리티 함수

2. **문서 확인**
   - [프로젝트 계획서](./docs/PROJECT_PLAN.md)
   - [개발 가이드](./docs/guides/DEVELOPMENT.md)
   - [아키텍처 문서](./docs/architecture/ARCHITECTURE.md)

3. **추가 기능 설정** (선택사항)
   - AI 이미지 생성: Gemini API 키 설정
   - 결제 기능: Stripe 계정 연동
   - 이미지 저장: Cloudinary 설정

### 유용한 명령어 모음

```bash
# 개발
npm run dev              # 개발 서버 실행
npm run build            # 프로덕션 빌드
npm run start            # 프로덕션 서버 실행

# 데이터베이스
npm run db:studio        # Prisma Studio GUI
npm run db:check         # 데이터베이스 통계
npm run db:push          # 스키마 동기화
npm run db:migrate       # 마이그레이션

# 테스트
npm test                 # 단위 테스트
npm run test:e2e         # E2E 테스트
npm run lint             # 린트 검사

# 유틸리티
npm run type-check       # TypeScript 타입 체크
npm run lighthouse       # 성능 측정
```

### 도움말

- **문제 발생 시**: [트러블슈팅](#9-트러블슈팅) 섹션 참고
- **질문 및 이슈**: [GitHub Issues](https://github.com/tokkikim/wedding/issues)
- **기여 방법**: [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

---

**작성일**: 2025-11-16
**최종 업데이트**: 2025-11-16
