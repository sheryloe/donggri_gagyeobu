# Donggri Ledger

개인 가계부를 서비스형 웹앱으로 운영하는 프로젝트입니다.  
로컬 서버를 계속 켜두는 방식이 아니라 `Supabase + Vercel + GitHub` 조합으로 구성했고, 자산, 카드 결제예정, 예산, 고정지출, 투자 포트폴리오, 백업/복원까지 한 흐름으로 관리할 수 있게 정리했습니다.

## Quick Links

- App: https://donggri-gagyeobu.vercel.app/
- GitHub Pages: https://sheryloe.github.io/donggri_gagyeobu/
- Repository: https://github.com/sheryloe/donggri_gagyeobu
- Wiki: [wiki/Home.md](./wiki/Home.md)

## Current Snapshot

- Frontend: 정적 웹 앱
- Deploy: `Vercel`
- Auth: `Supabase Auth`
- Database: `Supabase Postgres`
- Security: `RLS(Row Level Security)`
- Server-side automation: `Supabase Edge Functions`
- User model: 최대 50명 제한의 소규모 비공개 운영

## Core Value

이 프로젝트의 핵심은 단순한 수입/지출 입력이 아니라 아래를 한 번에 연결하는 데 있습니다.

- 자산별 잔액 관리
- 카드 결제예정 추적
- 고정지출과 예산 관리
- 투자 포트폴리오와 수익률 확인
- 브라우저 기반 백업/복원

## Current Features

### 1. Account Access

- 아이디 + 비밀번호 로그인
- 회원가입 시 보안질문 3개 선택 및 답변 저장
- 보안질문 답변 확인 후 비밀번호 재설정
- 회원가입 50명 제한
- 사용자별 데이터 분리
- `RLS` 기반 본인 데이터만 접근 가능

### 2. Ledger Core

- 수입 / 지출 / 투자 거래 등록
- 월별 합계, 잔액, 이월 요약
- 거래 검색
- 달력 기반 거래 확인
- 카테고리 직접 추가/수정/관리

### 3. Assets and Card Flow

- 은행 / 현금 / 카드 / 투자 자산 분리
- 카드 자산별 결제일 설정
- 카드 자산별 결제통장 연결
- 카드 사용 시 실제 정산 예정 금액 계산
- 자산 삭제 시 연결 데이터 검사
- 필요 시 연결 데이터 포함 강제 삭제 처리

### 4. Fixed Expenses and Budgets

- 고정지출 등록 및 활성화 관리
- 카테고리별 예산 설정
- 월간 사용률 확인
- 미지출 고정비와 예산 소진 상태 확인

### 5. Investments

- 주식 / 코인 / ETF / 펀드 관리
- 투자 원금, 평가금, 손익, 수익률 계산
- 실시간 시세 새로고침
- 펀드 현재가 수동 반영

### 6. Operations

- JSON 백업 / 복원
- GitHub 기반 버전 관리
- Supabase SQL 스키마 관리
- Edge Function 배포 기반 운영
- GitHub Pages 소개 페이지 분리 운영

## Main Screens

- `가계부`
- `달력`
- `고정지출`
- `예산`
- `리포트`
- `투자`
- `검색`
- `자산`
- `설정`

## Architecture

이 프로젝트는 원래 `FastAPI + SQLite` 로컬 구조에서 시작했지만, 외부 접속과 운영 난이도 때문에 현재는 서비스형 구조로 정리했습니다.

- `GitHub`
  - 코드 원본 관리
  - 문서 및 작업 기록 관리
- `Vercel`
  - 정적 프론트 배포
  - 빠른 재배포와 외부 접속
- `Supabase`
  - 로그인 / 계정 관리
  - 사용자별 데이터 저장
  - `RLS` 기반 접근 제어
  - `Edge Functions` 기반 보조 로직

## Current Status

### 현재까지 끝난 것

- Supabase 기반 인증 구조 전환
- 사용자별 데이터 구조 정리
- 보안질문 기반 계정 복구 흐름 구축
- Vercel 배포 구조 연결
- GitHub Pages 소개 페이지 구성
- 앱 화면 내 GitHub 레포 링크 추가
- 운영 문서 `명세서.md` 추가

### 현재 문제점

- `refresh-market-prices` Edge Function은 실제 운영 환경에서 재배포/실사용 검증을 한 번 더 확인해야 함
- 외부 시세 API 의존 구간은 응답 실패나 지연 가능성이 있음
- 자동 테스트가 부족해서 UI 회귀를 수동 확인에 많이 의존하고 있음
- 운영용 에러 모니터링과 가입 현황 대시보드가 아직 없음

## Recommended Next Work

### 우선순위 높음

- 반복 수입 자동 생성
- 계좌 간 이체 전용 거래 타입
- 월마감 스냅샷 및 순자산 추이 저장
- 카드 결제일 / 고정지출 / 예산 초과 알림 센터

### 중간 우선순위

- 투자 수익률 추세 차트
- 월별 리포트 PDF 다운로드
- CSV / Excel 가져오기
- 관리자용 가입 현황 대시보드

### 장기 확장

- 가족 / 커플 공유 계정
- 태그 기반 거래 분류
- 목표저축 / sinking fund 관리
- README / GitHub Pages / 가입 인원 자동 동기화

## Repository Structure

- `web/`
  - 실제 가계부 프론트엔드
- `supabase/schema.sql`
  - 테이블, 정책, 함수, 트리거
- `supabase/functions/`
  - 회원가입 / 비밀번호 복구 / 투자 시세 갱신 함수
- `docs/`
  - GitHub Pages 랜딩과 작업 기록
- `docs/SESSION_LOG.md`
  - 세션별 작업 로그
- `명세서.md`
  - 현재 운영/기능/이슈/확장 포인트 정리 문서

## Local Build

프로그래머가 아니어도 따라 할 수 있게, 로컬에서 빌드해서 화면 확인하는 순서를 단계별로 적습니다.

### 1. 준비물

아래 3가지만 있으면 됩니다.

- 이 GitHub 저장소를 내려받은 폴더
- `Node.js` 설치
  - `LTS` 버전 권장
  - 설치 후 `npm` 명령을 사용할 수 있어야 함
- `PowerShell` 또는 `명령 프롬프트`

저장소를 받는 방법은 둘 중 하나면 됩니다.

- GitHub에서 `Code > Download ZIP`으로 내려받기
- 또는 `git clone`으로 복제하기

### 2. 프로젝트 폴더 열기

압축을 풀었거나 클론한 뒤, 프로젝트 폴더를 엽니다.

예:

```text
d:\Donggri Github\donggri_gagyeobu
```

그 다음 가장 쉬운 방법은 아래 둘 중 하나입니다.

1. 폴더 빈 곳에서 `Shift + 마우스 우클릭`
2. `PowerShell 창 열기` 또는 `터미널 열기`

또는 VS Code를 쓰면:

1. 폴더를 VS Code로 열기
2. 상단 메뉴 `터미널 > 새 터미널`

### 3. 필요한 파일 설치

처음 한 번만 아래 명령을 실행합니다.

```bash
npm install
```

이 명령은 빌드에 필요한 Node 패키지를 설치합니다.

정상이라면 에러 없이 설치가 끝납니다.  
만약 `npm`을 찾을 수 없다고 나오면, Node.js가 아직 설치되지 않았거나 설치 후 터미널을 다시 열지 않은 경우가 많습니다.

### 4. Supabase 값 준비

이 앱은 정적 웹앱이지만 실제 로그인과 데이터 저장은 Supabase를 사용합니다.  
그래서 빌드 전에 최소한 아래 값 3개를 준비해야 합니다.

```text
SUPABASE_URL
SUPABASE_ANON_KEY
APP_NAME
```

값을 어디서 찾는지:

- `SUPABASE_URL`
  - Supabase 프로젝트의 URL
- `SUPABASE_ANON_KEY`
  - 브라우저에서 써도 되는 공개 키
- `APP_NAME`
  - 앱 이름
  - 예: `Donggri Ledger`

중요:

- `SUPABASE_SERVICE_ROLE_KEY`는 브라우저 환경변수에 넣지 않습니다.
- 회원가입 / 비밀번호 찾기용 Edge Function은 로그인 전 호출되므로 JWT 설정을 따로 확인해야 합니다.

### 5. PowerShell에 환경변수 넣기

Windows PowerShell 기준으로는 아래처럼 입력하면 됩니다.

```powershell
$env:SUPABASE_URL="https://your-project-ref.supabase.co"
$env:SUPABASE_ANON_KEY="여기에_공개키"
$env:APP_NAME="Donggri Ledger"
```

macOS / Linux 터미널이면 아래처럼 입력합니다.

```bash
export SUPABASE_URL="https://your-project-ref.supabase.co"
export SUPABASE_ANON_KEY="여기에_공개키"
export APP_NAME="Donggri Ledger"
```

### 6. 빌드 실행

환경변수를 넣은 같은 터미널에서 아래 명령을 실행합니다.

```bash
npm run build
```

이 명령이 하는 일:

- `web/index.html`과 `web/app.js`를 `dist/`로 복사
- 환경변수 값을 바탕으로 `dist/app-config.js` 생성
- 정적 배포용 폴더 `dist/` 완성

### 7. 빌드 결과 확인

빌드가 끝나면 프로젝트 폴더 안에 `dist` 폴더가 생깁니다.

정상이라면 아래 파일들이 보여야 합니다.

- `dist/index.html`
- `dist/app.js`
- `dist/app-config.js`

특히 `dist/app-config.js`를 열어서 아래처럼 `YOUR_SUPABASE_URL` 같은 자리표시자가 남아 있지 않은지 확인하세요.

```js
window.APP_CONFIG = {
  SUPABASE_URL: "실제 프로젝트 URL",
  SUPABASE_ANON_KEY: "실제 공개 키",
  APP_NAME: "Donggri Ledger"
};
```

### 8. 문법 확인

프론트 코드 문법만 빠르게 확인하고 싶으면 아래 명령도 같이 돌리면 좋습니다.

```bash
node --check web/app.js
```

에러가 없으면 조용히 끝납니다.

### 9. 로컬에서 화면 미리보기

`dist` 폴더는 정적 웹 파일이라, 브라우저에서 바로 열기보다 간단한 로컬 서버로 보는 것이 안전합니다.

가장 쉬운 방법:

```bash
npx serve dist
```

처음 실행 시 설치 여부를 물으면 `y`를 입력하면 됩니다.

그 다음 터미널에 표시되는 주소를 브라우저로 열면 됩니다.  
보통 아래와 비슷하게 뜹니다.

```text
http://localhost:3000
```

### 10. 가장 자주 막히는 문제

#### `npm` 명령이 안 되는 경우

- Node.js가 설치되지 않았거나
- 설치 후 터미널을 다시 열지 않은 경우가 많습니다.

#### 빌드는 됐는데 로그인이나 데이터 연결이 안 되는 경우

- `SUPABASE_URL`과 `SUPABASE_ANON_KEY`가 같은 프로젝트 값인지 확인하세요.
- `dist/app-config.js` 안에 자리표시자 문자열이 남아 있지 않은지 확인하세요.

#### 회원가입이나 비밀번호 찾기가 안 되는 경우

- Supabase Edge Function의 JWT 설정
- Supabase SQL 스키마 반영 상태
- Vercel / Supabase 프로젝트 키 혼용 여부

이 세 가지를 먼저 확인하는 것이 좋습니다.

### 11. Vercel 배포용으로만 빌드할 때

로컬에서 화면 확인은 하지 않고 배포용 파일만 만들고 싶다면 아래 두 줄만 기억하면 됩니다.

```bash
npm install
npm run build
```

## Notes

- 실제 서비스 주소는 `Vercel`
- 소개/검색 유입용 페이지는 `GitHub Pages`
- 코드 원본 관리와 협업 기준점은 `GitHub`
- 상세 운영 정리는 [명세서.md](./명세서.md)와 `docs/SESSION_LOG.md`에 계속 누적합니다.
