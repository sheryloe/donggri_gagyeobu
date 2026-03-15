# Architecture

## High-Level Structure

Donggri Ledger는 아래처럼 역할을 분리한 구조입니다.

| 영역 | 역할 |
| --- | --- |
| GitHub | 코드, 문서, 이력 관리 |
| Vercel | 정적 프론트 배포 |
| Supabase Auth | 로그인 / 계정 관리 |
| Supabase Postgres | 사용자 데이터 저장 |
| Supabase RLS | 사용자별 데이터 접근 제어 |
| Supabase Edge Functions | 회원가입, 계정 복구, 시세 갱신 |

## Frontend

프론트는 정적 웹 앱입니다.

주요 경로:

- `web/index.html`
- `web/app.js`
- `web/app-config.js`

빌드 결과:

- `dist/index.html`
- `dist/app.js`
- `dist/app-config.js`

빌드 스크립트:

- `scripts/build-web.mjs`

## Database Model

현재 핵심 테이블은 아래와 같습니다.

- `profiles`
- `assets`
- `transactions`
- `fixed_expenses`
- `budgets`
- `categories`
- `investments`
- `security_question_answers`

핵심 원칙:

- 모든 사용자 데이터는 `user_id` 기준으로 분리
- 본인 데이터만 읽고/쓰도록 `RLS` 적용
- 회원가입 시 프로필과 기본 카테고리 자동 생성

## Edge Functions

현재 주요 함수는 아래 3개입니다.

| 함수 | 역할 |
| --- | --- |
| `register-account` | 회원가입 처리 |
| `recover-account` | 보안질문 기반 비밀번호 재설정 |
| `refresh-market-prices` | 투자 시세 새로고침 |

운영상 주의:

- 로그인 전 호출 함수는 JWT 설정을 따로 확인
- 브라우저 환경변수에 `SUPABASE_SERVICE_ROLE_KEY`를 넣지 않음
- 프로젝트 URL과 공개 키는 같은 Supabase 프로젝트 값으로 맞춰야 함

## Security

현재 구조에서 가장 중요한 보안 포인트는 아래입니다.

- `RLS` 기반 사용자 데이터 분리
- 공개 키와 서비스 키 분리
- 보안질문 기반 복구 시도 횟수 제한
- 가입 인원 50명 제한

## Build and Deploy

배포 흐름은 아래와 같습니다.

1. GitHub에서 코드 변경
2. `npm run build`
3. Vercel 정적 배포
4. Supabase SQL / Functions 반영
5. 실제 앱 동작 확인

## Related Pages

- [Feature Guide](./Feature-Guide.md)
- [Operations and Deployment](./Operations-and-Deployment.md)
- [Roadmap](./Roadmap.md)
