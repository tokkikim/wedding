# 데이터베이스 관리 가이드

이 문서는 WeddingAI 애플리케이션의 데이터베이스 관리 및 조회 방법을 설명합니다.

## 📊 데이터베이스 구조

### 주요 테이블

1. **User** - 사용자 정보
   - `id`: 고유 ID (cuid)
   - `email`: 이메일 (고유)
   - `name`: 사용자 이름
   - `credits`: 보유 크레딧
   - `createdAt`: 가입일
   - `updatedAt`: 최종 수정일

2. **Account** - OAuth 계정 연결
   - `id`: 고유 ID
   - `userId`: 사용자 ID (외래키)
   - `provider`: OAuth 제공자 (google, kakao 등)
   - `type`: 계정 타입
   - `access_token`, `refresh_token`: 토큰 정보

3. **Session** - 세션 관리
   - `id`: 고유 ID
   - `userId`: 사용자 ID (외래키)
   - `sessionToken`: 세션 토큰 (고유)
   - `expires`: 만료 시간

4. **Order** - 주문/결제 내역
   - `id`: 고유 ID
   - `userId`: 사용자 ID (외래키)
   - `amount`: 결제 금액
   - `credits`: 구매 크레딧
   - `status`: 주문 상태 (PENDING, COMPLETED, FAILED)

5. **GeneratedImage** - 생성된 이미지
   - `id`: 고유 ID
   - `userId`: 사용자 ID (외래키)
   - `originalUrl`: 원본 이미지 URL
   - `generatedUrl`: 생성된 이미지 URL
   - `prompt`: 생성 프롬프트
   - `style`: 선택한 스타일
   - `status`: 생성 상태 (PROCESSING, COMPLETED, FAILED)

## 🔍 데이터 조회 방법

### 1. Prisma Studio (GUI 도구) ⭐ 추천

가장 직관적이고 편리한 방법입니다.

```bash
npm run db:studio
```

**접속:** http://localhost:5555

**기능:**
- ✅ 모든 테이블 시각적으로 탐색
- ✅ 데이터 검색, 필터링, 정렬
- ✅ 데이터 추가, 수정, 삭제
- ✅ 관계(Relation) 탐색
- ✅ 실시간 업데이트

**사용 예시:**
1. 브라우저에서 http://localhost:5555 접속
2. 왼쪽 사이드바에서 테이블 선택 (예: User)
3. 데이터 확인 및 필터 적용
4. 특정 행 클릭하여 상세 정보 확인
5. 관련 데이터(orders, images 등) 바로 확인

### 2. 빠른 통계 확인

전체 데이터베이스 통계를 한눈에 확인합니다.

```bash
npm run db:check:stats
```

**출력 예시:**
```
📊 데이터베이스 통계
────────────────────────────────────────
👥 사용자: 15명
📱 계정 연결: 15개
🔐 활성 세션: 8개
💰 주문: 23건
🖼️  생성 이미지: 47개
```

### 3. 상세 사용자 정보 조회

모든 사용자의 상세 정보를 확인합니다.

```bash
npm run db:check:users
```

**출력 예시:**
```
============================================================
👤 사용자 #1
============================================================
ID: clx1234567890abcdefgh
이름: 홍길동
이메일: hong@example.com
크레딧: 5
가입일: 2024-12-01 14:23:45
마지막 업데이트: 2024-12-15 10:15:30

📱 연결된 계정: 1개
  - google (oauth)

🔐 활성 세션: 1개
  - 만료: 2024-12-30 14:23:45

💰 주문 내역: 2개
  - COMPLETED | 10크레딧 | 2024-12-05 09:30:00
  - COMPLETED | 5크레딧 | 2024-12-10 15:45:00

🖼️  생성 이미지: 총 8개 (최근 5개만 표시)
  - COMPLETED | classic | 2024-12-15 10:00:00
  - COMPLETED | modern | 2024-12-14 16:30:00
  ...
```

### 4. 유연한 조회 옵션

다양한 조회 옵션을 제공합니다.

```bash
# 전체 통계
npm run db:check
npm run db:check stats

# 사용자 목록 (간단)
npm run db:check users

# 최근 활동 (최근 10개 이미지)
npm run db:check recent
```

**사용자 목록 출력 예시:**
```
👥 사용자 목록
────────────────────────────────────────────────────────────
hong@example.com | 홍길동 | 5크레딧
kim@example.com | 김철수 | 3크레딧
lee@example.com | 이영희 | 10크레딧
```

**최근 활동 출력 예시:**
```
🕒 최근 이미지 생성 (10개)
────────────────────────────────────────────────────────────
2024-12-15 10:00:00 | hong@example.com | COMPLETED
2024-12-14 16:30:00 | kim@example.com | PROCESSING
2024-12-14 14:15:00 | lee@example.com | COMPLETED
...
```

## 🛠 데이터베이스 관리 명령어

### 스키마 관리

```bash
# Prisma Client 생성/재생성
npm run db:generate

# 스키마를 DB에 푸시 (개발 환경)
npm run db:push

# 마이그레이션 배포 (프로덕션)
npm run db:migrate
```

### 데이터 조회

```bash
# GUI 도구 실행
npm run db:studio

# 빠른 통계
npm run db:check:stats

# 상세 사용자 정보
npm run db:check:users

# 커스텀 조회
npm run db:check [옵션]
```

## 💡 사용 시나리오

### 시나리오 1: 새로운 사용자가 가입했는지 확인

```bash
npm run db:studio
```
→ User 테이블에서 최신 데이터 확인

### 시나리오 2: 특정 사용자의 크레딧 확인

```bash
npm run db:check:users
```
→ 이메일로 찾아서 크레딧 확인

또는 Prisma Studio에서 User 테이블 → 이메일 검색

### 시나리오 3: 최근 결제 내역 확인

```bash
npm run db:studio
```
→ Order 테이블 → createdAt으로 정렬

### 시나리오 4: 실패한 이미지 생성 확인

```bash
npm run db:studio
```
→ GeneratedImage 테이블 → status 필터 (FAILED)

### 시나리오 5: 전체 시스템 현황 파악

```bash
npm run db:check:stats
```
→ 빠르게 전체 통계 확인

## 🔒 보안 주의사항

1. **Prisma Studio는 개발 환경에서만 사용**
   - 프로덕션 환경에서는 절대 실행하지 말 것
   - 포트 5555는 외부 접근 차단 필수

2. **민감한 정보 보호**
   - `access_token`, `refresh_token` 등은 절대 복사/공유 금지
   - 스크린샷 공유 시 민감 정보 마스킹 필수

3. **데이터 수정 권한**
   - Prisma Studio에서 데이터 수정은 신중하게
   - 프로덕션 DB 직접 수정은 절대 금지
   - 백업 후 수정 권장

## 📝 커스텀 쿼리 작성

더 복잡한 조회가 필요한 경우, `scripts/` 폴더에 새 스크립트를 작성할 수 있습니다.

**예시: 특정 기간 내 주문 조회**

```typescript
// scripts/check-orders-by-date.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const startDate = new Date('2024-12-01');
  const endDate = new Date('2024-12-31');

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: 'COMPLETED',
    },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`\n📊 ${startDate.toLocaleDateString()} ~ ${endDate.toLocaleDateString()} 기간 주문 내역\n`);
  
  orders.forEach((order) => {
    console.log(
      `${order.createdAt.toLocaleString()} | ` +
      `${order.user.email} | ` +
      `${order.credits}크레딧 | ` +
      `₩${order.amount.toLocaleString()}`
    );
  });

  console.log(`\n총 ${orders.length}건\n`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

**실행:**
```bash
npx tsx scripts/check-orders-by-date.ts
```

## 🎯 Best Practices

1. **정기적인 데이터 확인**
   - 매일 `npm run db:check:stats`로 전체 현황 확인
   - 이상 징후 발견 시 Prisma Studio로 상세 조회

2. **성능 모니터링**
   - 대량의 이미지 생성 시 FAILED 상태 확인
   - 세션 만료 주기 확인

3. **사용자 지원**
   - 사용자 문의 시 이메일로 빠르게 정보 조회
   - 크레딧 이슈는 Order 테이블로 결제 내역 확인

4. **백업**
   - 중요한 데이터 수정 전 항상 백업
   - SQLite: `dev.db` 파일 복사
   - PostgreSQL: `pg_dump` 사용

## 📚 참고 문서

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Studio](https://www.prisma.io/studio)
- [프로젝트 스키마](../../prisma/schema.prisma)
- [문서 인덱스](../INDEX.md)

---

**최종 업데이트:** 2024년 12월 19일

