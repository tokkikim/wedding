# 📚 WeddingAI 문서 디렉토리

이 폴더에는 WeddingAI 프로젝트의 모든 개발 문서가 체계적으로 정리되어 있습니다.

## 🚀 시작하기

**👉 [INDEX.md](./INDEX.md)를 먼저 확인하세요!**

문서 인덱스에서 모든 문서의 위치와 용도를 한눈에 확인할 수 있습니다.

## 📂 폴더 구조

```
docs/
├── README.md              # 이 파일
├── INDEX.md              # 📌 문서 인덱스 (여기서 시작!)
├── PROJECT_PLAN.md       # 📋 프로젝트 전체 계획서
│
├── guides/               # 📖 개발 가이드
│   ├── DEVELOPMENT.md   # 개발 환경 및 개발 가이드
│   ├── DATABASE.md      # 데이터베이스 관리 가이드
│   ├── TESTING.md       # 테스트 가이드
│   └── DEPLOYMENT.md    # 배포 가이드
│
├── architecture/         # 🏗️ 아키텍처 문서
│   └── ARCHITECTURE.md  # 시스템 아키텍처 설계
│
└── reports/              # 📊 완료 보고서
    ├── PHASE2_COMPLETION.md
    └── PHASE4_COMPLETION.md
```

## 🎯 역할별 추천 문서

### 👨‍💻 프론트엔드 개발자
1. [프로젝트 계획서](./PROJECT_PLAN.md)
2. [개발 가이드](./guides/DEVELOPMENT.md)
3. [시스템 아키텍처](./architecture/ARCHITECTURE.md)
4. [테스트 가이드](./guides/TESTING.md)

### 👨‍💻 백엔드 개발자
1. [프로젝트 계획서](./PROJECT_PLAN.md)
2. [시스템 아키텍처](./architecture/ARCHITECTURE.md)
3. [개발 가이드](./guides/DEVELOPMENT.md)
4. [데이터베이스 가이드](./guides/DATABASE.md)
5. [테스트 가이드](./guides/TESTING.md)

### 🚀 DevOps / 배포 담당자
1. [시스템 아키텍처](./architecture/ARCHITECTURE.md)
2. [배포 가이드](./guides/DEPLOYMENT.md)
3. [데이터베이스 가이드](./guides/DATABASE.md)

### 🧪 QA / 테스터
1. [프로젝트 계획서](./PROJECT_PLAN.md)
2. [테스트 가이드](./guides/TESTING.md)
3. [개발 가이드](./guides/DEVELOPMENT.md)

### 📊 프로젝트 매니저
1. [프로젝트 계획서](./PROJECT_PLAN.md)
2. [완료 보고서](./reports/)
3. [시스템 아키텍처](./architecture/ARCHITECTURE.md)

## 📝 문서 관리 규칙

### 문서 작성 원칙

1. **명확성**: 누구나 이해할 수 있게 작성
2. **최신성**: 코드 변경 시 관련 문서도 업데이트
3. **실용성**: 실제 사용 가능한 예제 포함
4. **한글 우선**: 모든 문서는 한글로 작성

### 문서 업데이트 시기

| 변경 사항 | 업데이트 대상 문서 |
|-----------|-------------------|
| 새 기능 추가 | 관련 가이드 문서 |
| 아키텍처 변경 | ARCHITECTURE.md |
| DB 스키마 변경 | DATABASE.md |
| 배포 프로세스 변경 | DEPLOYMENT.md |
| 테스트 전략 변경 | TESTING.md |
| Phase 완료 | 완료 보고서 작성 |

### 새 문서 추가 프로세스

1. **적절한 폴더에 배치**
   - 가이드 문서 → `guides/`
   - 아키텍처 문서 → `architecture/`
   - 완료 보고서 → `reports/`

2. **문서 인덱스 업데이트**
   - `INDEX.md`에 새 문서 정보 추가
   - 상황별 추천 문서에 포함

3. **관련 문서에 링크 추가**
   - 연관된 다른 문서에 상호 링크 추가

4. **메인 README 업데이트** (필요시)
   - `../README.md`에 중요한 문서는 링크 추가

## 🔍 빠른 검색

### 상황별 문서 찾기

**"환경 설정이 필요해요"**
→ [개발 가이드](./guides/DEVELOPMENT.md)

**"데이터베이스를 확인하고 싶어요"**
→ [데이터베이스 가이드](./guides/DATABASE.md)

**"시스템 구조가 궁금해요"**
→ [시스템 아키텍처](./architecture/ARCHITECTURE.md)

**"테스트를 작성하고 싶어요"**
→ [테스트 가이드](./guides/TESTING.md)

**"배포 방법이 궁금해요"**
→ [배포 가이드](./guides/DEPLOYMENT.md)

**"프로젝트 전체가 궁금해요"**
→ [프로젝트 계획서](./PROJECT_PLAN.md)

**"현재 진행 상황이 궁금해요"**
→ [완료 보고서](./reports/)

## 💡 팁

### 문서 읽는 순서 (신규 팀원 권장)

1. **1일차**: [프로젝트 계획서](./PROJECT_PLAN.md) + [시스템 아키텍처](./architecture/ARCHITECTURE.md)
2. **2일차**: [개발 가이드](./guides/DEVELOPMENT.md) + 환경 설정
3. **3일차**: [데이터베이스 가이드](./guides/DATABASE.md) + [테스트 가이드](./guides/TESTING.md)
4. **4일차**: [완료 보고서](./reports/) 읽고 현재 상태 파악
5. **5일차**: 실제 코드 탐색 시작

### 문서 활용 방법

- **코드 작성 전**: 관련 가이드 먼저 확인
- **막힐 때**: INDEX.md에서 관련 문서 찾기
- **배포 전**: 체크리스트 문서 확인
- **주간 회의**: 완료 보고서 업데이트

## 📞 도움이 필요하신가요?

1. **먼저**: [INDEX.md](./INDEX.md)에서 관련 문서 찾기
2. **다음**: 해당 문서 읽어보기
3. **여전히 불명확**: 팀 채널에 질문
4. **문서 개선**: GitHub Issues에 제안

---

**문서 관리자:** AI Assistant  
**최종 업데이트:** 2024년 12월 19일  
**버전:** 1.0

