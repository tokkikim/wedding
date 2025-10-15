# 📚 WeddingAI 문서 인덱스

이 디렉토리에는 WeddingAI 프로젝트의 모든 개발 문서가 체계적으로 정리되어 있습니다.

## 📂 문서 구조

```
docs/
├── INDEX.md                          # 📌 이 파일 (문서 인덱스)
├── PROJECT_PLAN.md                   # 📋 프로젝트 전체 계획서
├── guides/                           # 📖 개발 가이드
│   ├── DEVELOPMENT.md               # 개발 환경 설정 및 개발 가이드
│   ├── DATABASE.md                  # 데이터베이스 관리 가이드
│   ├── TESTING.md                   # 테스트 가이드
│   └── DEPLOYMENT.md                # 배포 가이드
├── architecture/                     # 🏗️ 아키텍처 문서
│   └── ARCHITECTURE.md              # 시스템 아키텍처 설계
└── reports/                          # 📊 완료 보고서
    ├── PHASE2_COMPLETION.md         # Phase 2 완료 보고서
    └── PHASE4_COMPLETION.md         # Phase 4 완료 보고서
```

---

## 🎯 문서 찾기

### 프로젝트를 처음 시작하는 경우

1. **[프로젝트 계획서](./PROJECT_PLAN.md)** - 프로젝트 전체 개요 및 계획
2. **[시스템 아키텍처](./architecture/ARCHITECTURE.md)** - 시스템 구조 이해
3. **[개발 가이드](./guides/DEVELOPMENT.md)** - 개발 환경 설정

### 개발 중인 경우

#### 🛠️ 기능 개발
- **[개발 가이드](./guides/DEVELOPMENT.md)** - 코딩 규칙 및 개발 방법
- **[데이터베이스 가이드](./guides/DATABASE.md)** - DB 조회 및 관리
- **[시스템 아키텍처](./architecture/ARCHITECTURE.md)** - 시스템 구조 참고

#### 🧪 테스트
- **[테스트 가이드](./guides/TESTING.md)** - 단위/E2E 테스트 작성 및 실행

#### 🚀 배포
- **[배포 가이드](./guides/DEPLOYMENT.md)** - 프로덕션 배포 방법

### 프로젝트 진행 상황 확인

- **[Phase 2 완료 보고서](./reports/PHASE2_COMPLETION.md)** - 핵심 기능 개발 완료
- **[Phase 4 완료 보고서](./reports/PHASE4_COMPLETION.md)** - 배포 및 테스트 완료

---

## 📖 주요 문서 상세 설명

### 📋 [프로젝트 계획서](./PROJECT_PLAN.md)

**대상:** 팀원 전체, 신규 멤버  
**내용:**
- 프로젝트 개요 및 목표
- 기술 스택 소개
- 주요 기능 설명
- 개발 단계별 계획 (Phase 1-4)
- 비즈니스 모델 및 가격 정책

**언제 읽어야 하나요?**
- 프로젝트에 처음 참여할 때
- 전체적인 방향성을 확인하고 싶을 때
- 기능 기획을 검토할 때

---

### 🏗️ [시스템 아키텍처](./architecture/ARCHITECTURE.md)

**대상:** 개발자, 아키텍트  
**내용:**
- 전체 시스템 구조도
- 기술 스택 상세 설명
- 데이터 흐름
- API 설계
- 보안 및 성능 고려사항

**언제 읽어야 하나요?**
- 새로운 기능을 설계할 때
- 기술적 의사결정이 필요할 때
- 시스템 간 통합을 이해해야 할 때

---

### 📖 개발 가이드

#### [DEVELOPMENT.md](./guides/DEVELOPMENT.md)

**대상:** 모든 개발자  
**내용:**
- 개발 환경 설정
- 코딩 컨벤션 및 규칙
- 컴포넌트 개발 방법
- API 개발 방법
- Git 워크플로우

**언제 읽어야 하나요?**
- 개발 환경을 처음 설정할 때
- 새로운 기능을 개발하기 전
- 코딩 규칙을 확인하고 싶을 때

#### [DATABASE.md](./guides/DATABASE.md)

**대상:** 백엔드 개발자, 데이터 관리자  
**내용:**
- 데이터베이스 스키마 구조
- 데이터 조회 방법 (Prisma Studio, CLI)
- 스키마 마이그레이션 방법
- 데이터 관리 Best Practices

**언제 읽어야 하나요?**
- DB 스키마를 이해해야 할 때
- 사용자 데이터를 조회해야 할 때
- 스키마를 변경해야 할 때

#### [TESTING.md](./guides/TESTING.md)

**대상:** 모든 개발자, QA  
**내용:**
- 테스트 전략
- 단위 테스트 작성 방법
- E2E 테스트 작성 방법
- 테스트 실행 및 커버리지 확인

**언제 읽어야 하나요?**
- 테스트 코드를 작성할 때
- CI/CD 파이프라인을 설정할 때
- 품질 보증이 필요할 때

#### [DEPLOYMENT.md](./guides/DEPLOYMENT.md)

**대상:** DevOps, 배포 담당자  
**내용:**
- 배포 환경 설정
- Vercel/Docker 배포 방법
- 환경 변수 관리
- 모니터링 및 로깅

**언제 읽어야 하나요?**
- 프로덕션 배포를 준비할 때
- 배포 이슈를 해결해야 할 때
- 모니터링을 설정하고 싶을 때

---

### 📊 완료 보고서

#### [PHASE2_COMPLETION.md](./reports/PHASE2_COMPLETION.md)

**내용:**
- Phase 2 목표 및 달성 내용
- 핵심 기능 개발 완료 (이미지 업로드, AI 생성 등)
- 구현된 기능 목록
- 다음 단계 계획

#### [PHASE4_COMPLETION.md](./reports/PHASE4_COMPLETION.md)

**내용:**
- Phase 4 목표 및 달성 내용
- 배포 및 테스트 완료
- 최종 점검 사항
- 향후 개선 계획

---

## 🔍 상황별 빠른 참조

### 🆕 신규 개발자 온보딩

1. [프로젝트 계획서](./PROJECT_PLAN.md) - 전체 이해
2. [시스템 아키텍처](./architecture/ARCHITECTURE.md) - 기술 스택 파악
3. [개발 가이드](./guides/DEVELOPMENT.md) - 개발 환경 설정
4. [완료 보고서](./reports/) - 현재 진행 상황 확인

### 🐛 버그 수정

1. [데이터베이스 가이드](./guides/DATABASE.md) - 데이터 확인
2. [테스트 가이드](./guides/TESTING.md) - 재현 테스트 작성
3. [개발 가이드](./guides/DEVELOPMENT.md) - 코드 수정

### ✨ 새 기능 개발

1. [프로젝트 계획서](./PROJECT_PLAN.md) - 기능 요구사항 확인
2. [시스템 아키텍처](./architecture/ARCHITECTURE.md) - 설계 참고
3. [개발 가이드](./guides/DEVELOPMENT.md) - 개발 규칙 준수
4. [테스트 가이드](./guides/TESTING.md) - 테스트 코드 작성

### 🚀 배포 준비

1. [테스트 가이드](./guides/TESTING.md) - 전체 테스트 실행
2. [배포 가이드](./guides/DEPLOYMENT.md) - 배포 체크리스트
3. [데이터베이스 가이드](./guides/DATABASE.md) - DB 마이그레이션

### 📊 프로젝트 현황 파악

1. [완료 보고서](./reports/) - 최신 진행 상황
2. [프로젝트 계획서](./PROJECT_PLAN.md) - 전체 계획 대비 진행률

---

## 📝 문서 작성 및 업데이트 규칙

### 문서 작성 원칙

1. **명확성**: 누구나 이해할 수 있게 명확하게 작성
2. **최신성**: 코드 변경 시 관련 문서도 함께 업데이트
3. **실용성**: 실제로 사용할 수 있는 예제 포함
4. **한글 우선**: 모든 문서는 한글로 작성

### 문서 업데이트 시기

- **기능 추가**: 해당 기능 관련 가이드 업데이트
- **아키텍처 변경**: ARCHITECTURE.md 업데이트
- **DB 스키마 변경**: DATABASE.md 업데이트
- **배포 프로세스 변경**: DEPLOYMENT.md 업데이트
- **Phase 완료**: 완료 보고서 작성

### 새 문서 추가 시

1. 적절한 카테고리 폴더에 배치
2. 이 INDEX.md에 문서 정보 추가
3. 관련 문서에 링크 추가
4. 메인 README.md 업데이트 (필요시)

---

## 🔗 외부 리소스

### 공식 문서
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [TailwindCSS 공식 문서](https://tailwindcss.com/docs)
- [TypeScript 공식 문서](https://www.typescriptlang.org/docs)

### API 문서
- [Gemini API](https://ai.google.dev/docs)
- [Cloudinary API](https://cloudinary.com/documentation)
- [Stripe API](https://stripe.com/docs/api)

### 배포 플랫폼
- [Vercel 문서](https://vercel.com/docs)
- [Docker 공식 문서](https://docs.docker.com)

---

## 📝 문서 작성 및 기여

문서를 작성하거나 수정하시나요?

**👉 [문서 기여 가이드 (CONTRIBUTING.md)](./CONTRIBUTING.md)를 확인하세요!**

- 문서 작성 원칙 및 스타일 가이드
- 문서 구조 및 템플릿
- 업데이트 워크플로우
- 리뷰 체크리스트

## 📞 문의 및 기여

### 문서 개선 제안
- GitHub Issues에 문서 개선 사항 제안
- Pull Request로 직접 문서 개선 기여
- [문서 기여 가이드](./CONTRIBUTING.md) 참고

### 질문이 있으신가요?
1. 먼저 이 인덱스에서 관련 문서 찾기
2. 해당 문서를 읽어보기
3. 여전히 불명확하다면 팀 채널에 질문

---

**최종 업데이트:** 2024년 12월 19일  
**문서 관리자:** AI Assistant  
**버전:** 1.0

