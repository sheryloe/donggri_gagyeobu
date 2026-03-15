# Donggri Ledger Wiki

Donggri Ledger는 `Supabase + Vercel + GitHub` 조합으로 운영하는 개인 가계부 서비스입니다.  
이 위키는 제품 소개, 화면 구성, 기술 구조, 배포 흐름, 운영 포인트를 한 번에 파악할 수 있도록 정리한 문서 허브입니다.

## Quick Links

| 항목 | 링크 | 설명 |
| --- | --- | --- |
| App | https://donggri-gagyeobu.vercel.app/ | 실제 운영 중인 가계부 앱 |
| GitHub Pages | https://sheryloe.github.io/donggri_gagyeobu/ | 제품 소개 랜딩 페이지 |
| Repository | https://github.com/sheryloe/donggri_gagyeobu | 소스 코드 저장소 |
| Product Overview | [Product Overview](./Product-Overview.md) | 제품 목표와 화면 구조 |
| Feature Guide | [Feature Guide](./Feature-Guide.md) | 현재 기능과 사용자 흐름 |
| Architecture | [Architecture](./Architecture.md) | 서비스 구조와 데이터 흐름 |

## At a Glance

| 항목 | 내용 |
| --- | --- |
| 서비스 형태 | 개인 가계부 웹앱 |
| 핵심 기능 | 자산 관리, 카드 결제예정, 고정지출, 예산, 투자, 백업/복원 |
| 인증 방식 | 아이디 + 비밀번호 + 보안질문 기반 복구 |
| 데이터 저장 | Supabase Postgres |
| 보안 | RLS 기반 사용자별 데이터 분리 |
| 배포 | Vercel 정적 배포 |
| 운영 규모 | 최대 50명 소규모 비공개 운영 |

## Recommended Reading Path

1. [Product Overview](./Product-Overview.md)
2. [Feature Guide](./Feature-Guide.md)
3. [Architecture](./Architecture.md)
4. [Operations and Deployment](./Operations-and-Deployment.md)
5. [Roadmap](./Roadmap.md)

## Core Experience

| 영역 | 설명 |
| --- | --- |
| Ledger | 수입, 지출, 투자 거래를 입력하고 월별 흐름을 확인합니다. |
| Assets | 은행, 현금, 카드, 투자 자산을 분리해 관리합니다. |
| Card Flow | 카드 사용일과 실제 결제일을 분리해 결제예정 금액을 추적합니다. |
| Budget | 카테고리별 예산과 고정지출을 동시에 관리합니다. |
| Investment | 투자 원금, 평가금, 수익률과 시세 흐름을 확인합니다. |
| Operations | JSON 백업/복원, GitHub 문서화, 정적 배포 운영을 지원합니다. |

## Current Focus

> 이 프로젝트는 단순한 입력 앱이 아니라, 생활비 흐름과 투자 자산을 함께 보는 개인 재무 대시보드로 발전시키는 방향을 목표로 하고 있습니다.

현재 중점 포인트:

- 로그인/회원가입/복구 UX 안정화
- 카드 결제예정과 자산 잔액 흐름 정합성 유지
- 투자 시세 갱신 흐름 검증
- GitHub Pages, README, Wiki의 정보 일관성 유지

## Wiki Structure

| 문서 | 용도 |
| --- | --- |
| [Product Overview](./Product-Overview.md) | 제품 소개, 사용자 가치, 탭 구성 |
| [Feature Guide](./Feature-Guide.md) | 기능별 사용 흐름과 핵심 포인트 |
| [Architecture](./Architecture.md) | 프론트/DB/함수/보안 구조 |
| [Operations and Deployment](./Operations-and-Deployment.md) | 로컬 빌드, 배포, 환경변수, 운영 주의사항 |
| [Roadmap](./Roadmap.md) | 현재 이슈, 보완점, 다음 기능 |

## Notes

- 실제 서비스는 `Vercel`에서 운영합니다.
- 소개/검색 유입용 페이지는 `GitHub Pages`로 분리합니다.
- 세부 작업 이력은 [`docs/SESSION_LOG.md`](../docs/SESSION_LOG.md)에 누적합니다.
- 현재 기능과 운영 기준의 상세 정리는 [`명세서.md`](../명세서.md)를 참고합니다.
