# SESSION LOG

## Usage
- 다음 세션 시작 시 이 파일부터 읽는다.
- 최근 항목이 맨 아래에 추가된다.
- 경로, 커밋, 운영 상태를 빠르게 재개할 수 있도록 유지한다.

---

## 2026-03-03 22:10 (Asia/Seoul)

### User Requests
- 프로그램 종료/삭제 실패/DB 반영 실패 원인 점검
- 자산 삭제 안 되는 문제 해결
- `Transaction not found` 반복 문제 해결
- README 작성(빌드 방법 + 기능 명세), 커밋, Notion 업데이트
- 다음 세션용 대화 로그 유지

### Changes Applied
- DB 경로 단일화 및 레거시 복사 로직 반영
  - `app/database.py`
- 런처 포트 통일(8000)
  - `launcher.py`
- health에 `db_path` 노출
  - `app/main.py`
- API 에러 메시지(detail) 프론트 토스트 노출
  - `web/index.html`
- 거래 조회 limit 불일치(2000 vs 1000) 수정
  - `web/index.html`
- 자산 삭제 개선
  - 연결 데이터 존재 시 상세 메시지(건수+예시 거래)
  - 강제삭제 `force=true` 지원
  - 파일: `app/crud.py`, `app/routers/assets.py`, `web/index.html`
- 404(`Transaction not found`, `Asset not found`) 시 UI 자동 재동기화
  - `web/index.html`
- README 작성 및 `.gitignore` 추가
  - `README.md`, `.gitignore`

### Data / Runtime State
- 서버 기준 DB 경로:
  - `C:\Users\wlflq\AppData\Local\donggri-ledger\data\ledger.db`
- DB 초기화 수행(assets/transactions/fixed_expenses/investments/budgets 비움)
- categories 기본값 유지
- 점검 시점 기준 `/api/assets`, `/api/transactions` 모두 빈 배열 확인

### Git
- Repository initialized at: `d:\Gaebal\donggri-ledger`
- Latest commit:
  - `d1365993e08fc41d9673cf963c4308e640304709`
  - `docs: add README spec and persist ledger sync/delete fixes`

### Notion
- 새 페이지:
  - https://www.notion.so/31861b8ed53c81c9bc94ec2c2c2e2b29
  - 제목: `donggri-ledger 업데이트 로그 (2026-03-03)`
- Daily Status 페이지 코멘트 추가 완료

### Open Issues
- 기존 `dist\donggri-ledger\donggri-ledger.exe` 프로세스가 남아 있으면 파일 잠금으로 재빌드 실패 가능
- 잠금 시 `dist_hotfix` 출력 경로로 빌드해 우회 가능(README 참고)

### Next Start Checklist
1. `http://127.0.0.1:8000/health` 확인 (`db_path` 확인)
2. UI 강력 새로고침(`Ctrl+F5`) 후 테스트
3. 삭제/동기화 이슈 재현 시 브라우저 콘솔 에러 + API 응답 detail 확인

## 2026-03-03 22:24 (Asia/Seoul)

### Follow-up Note
- User requested persistent conversation logging again.
- Confirmed policy: always read `docs/SESSION_LOG.md` first, then continue work.
- `AGENTS.md` remains the startup rule for all future sessions in this folder.

## 2026-03-04 22:02 (Asia/Seoul)

### User Requests
- GitHub `README.md`에 실제 사용법을 제대로 정리
- 개인 사용 기준에서 API는 내부 호출용이라는 점 명확화
- Notion에 가계부 제작 과정을 3-Step 상세 티스토리용 원고로 작성

### Changes Applied
- `README.md` 전면 개편
  - 설치/실행, 첫 사용 3-Step, 백업/복원, DB 경로, 트러블슈팅 중심으로 재작성
  - API는 외부 사용 대상이 아닌 내부 통신용임을 명시
- 미사용 파일 정리
  - `api.js` 삭제 (코드베이스 내 참조 없음 확인)
- Notion 페이지 신규 작성
  - URL: https://www.notion.so/31961b8ed53c813b903bfa2c53081f1d
  - 제목: `티스토리 원고 | 로컬 가계부 웹앱 만들기 (3-Step, Donggri Ledger)`
  - 내용: Step 1(백엔드), Step 2(프론트), Step 3(운영/배포) + 발행용 제목/태그/메타 설명

### Results
- README가 기술 나열 중심에서 사용자 실행 가이드 중심으로 변경됨
- API 관련 오해 포인트(외부 API 직접 사용 필요 여부) 해소
- 요청한 Notion용 상세 블로그 원고(3-Step) 작성 완료

### Git
- Base commit (작업 시작 시점):
  - `5113bd07d476f9f43831acafea93530e663a7481`
  - `docs: append repeat logging instruction note`
- 변경 파일 경로:
  - `README.md`
  - `api.js` (deleted)
  - `docs/SESSION_LOG.md`
- 새 커밋: 없음 (working tree 변경 상태)

### Remaining Issues
- 필요 시 이번 변경을 커밋/푸시해서 GitHub README에 반영해야 함
- 기존 Open Issue(실행 중 EXE로 인한 `dist` 잠금 가능성)는 여전히 유효

## 2026-03-04 22:13 (Asia/Seoul)

### User Requests
- 변경사항 커밋 + 푸시
- Notion 원고를 티스토리 최종 발행체(썸네일 문구/소제목 톤/CTA)로 재정리

### Changes Applied
- Git 커밋 수행
  - `01110e45803bab9c4be08c6fcac2d4cdd6f1bc21`
  - 메시지: `docs: rewrite README usage guide and remove unused api.js`
  - 포함 파일: `README.md`, `api.js`(deleted), `docs/SESSION_LOG.md`
- Push 시도 결과
  - 실패: 원격 저장소(push destination) 미설정 (`git remote -v` 비어 있음)
- Notion 원고 최종 발행체로 수정
  - 페이지: https://www.notion.so/31961b8ed53c813b903bfa2c53081f1d
  - 반영: 썸네일 문구 후보, 제목/부제 최종안, 소제목 톤 가이드, CTA 복붙 블록

### Results
- 로컬 커밋은 완료되어 변경사항이 저장됨
- Notion 글은 티스토리 발행 직전 형태로 업데이트 완료
- 푸시는 원격 저장소 URL 미설정으로 미완료

### Git
- 현재 HEAD:
  - `01110e45803bab9c4be08c6fcac2d4cdd6f1bc21`
- 작업 중 확인한 원인:
  - `fatal: No configured push destination.`

### Remaining Issues
- 푸시 완료를 위해 원격 저장소 URL 설정 필요
  - 예: `git remote add origin <repo-url>` 후 `git push -u origin master`

## 2026-03-04 22:22 (Asia/Seoul)

### User Requests
- 원격 저장소 URL(`https://github.com/sheryloe/donggri_gagyeobu.git`) 설정 후 푸시 완료

### Changes Applied
- Git 원격 설정
  - `git remote add origin https://github.com/sheryloe/donggri_gagyeobu.git`
- 첫 push 실패 원인 확인
  - 원격 `master`에 선행 커밋 존재로 non-fast-forward 거절
- 통합 전략 적용
  - `git rebase origin/master` 시 대량 충돌 발생
  - `git rebase --abort` 후 `git merge origin/master --allow-unrelated-histories -s ours` 수행
  - 로컬 작업 트리를 유지하면서 원격 히스토리 연결
- 푸시 성공
  - `git push -u origin master`
  - 원격 반영 범위: `1300a40..0151063`

### Results
- `master` 브랜치가 원격 `origin/master`와 추적 연결됨
- 이전 로컬 커밋(`01110e4`, `f0674fe`) 포함하여 원격 반영 완료

### Git
- 작업 완료 시 HEAD:
  - `0151063c9921e998541570a4ff54498ce1617601`
  - `merge: preserve local donggri-ledger state while linking remote history`
- 관련 주요 커밋:
  - `01110e45803bab9c4be08c6fcac2d4cdd6f1bc21`
  - `f0674fe8b1d04cd9eaf2615f7cb5dc658dc838c2`
  - `0151063c9921e998541570a4ff54498ce1617601`
- 관련 파일 경로:
  - `README.md`
  - `api.js` (deleted)
  - `docs/SESSION_LOG.md`

### Remaining Issues
- 없음

## 2026-03-08 16:29 (Asia/Seoul)

### User Requests
- 신용카드는 사용 시점과 실제 출금 시점(다음달 결제)을 분리해 기록
- 어떤 카드로 결제했는지 추적 가능하게 반영
- 기존 즉시차감(통장/현금) 방식과 카드 지연결제 방식을 함께 지원

### Changes Applied
- 거래 모델/스키마 확장
  - `payment_method`(asset/card), `card_asset_id`, `settlement_date`, `is_settled` 추가
  - 파일: `app/models.py`, `app/schemas.py`
- 카드 지연결제 정산 로직 구현
  - 카드 결제는 입력 시 통장 차감하지 않고, `settlement_date` 도래 시 자동 차감
  - 수정/삭제 시 결제완료 여부에 따라 잔액 역반영
  - 카드 참조 거래까지 자산 삭제 방어/강제삭제 범위 반영
  - 파일: `app/crud.py`
- 기존 SQLite 자동 컬럼 추가 마이그레이션
  - startup 시 `transactions` 테이블에 신규 컬럼 자동 추가
  - 파일: `app/database.py`, `app/main.py`
- UI/입력 흐름 개선
  - 거래 입력에 지불방식(즉시/신용카드), 사용 카드, 결제일 추가
  - 거래 목록에 `카드 -> 결제통장 (결제일, 결제상태)` 표시
  - 월 요약에 `이번달 카드결제예정` 추가
  - 가용현금 계산에 카드결제예정 차감 반영
  - 파일: `web/index.html`

### Verification
- `py -m compileall app` 통과
- 임시 DB 시나리오 검증 통과
  - 카드 사용 등록 시 즉시 통장 미차감
  - 결제일 도래 거래는 통장 차감
  - 결제완료 거래 삭제 시 잔액 복원

### Git
- 기능 커밋:
  - `fd76d291dd5cea769e39fbc2051157c559e3445e`
  - `feat: support deferred credit-card settlement flow`
- 원격 반영:
  - `origin/master`에 push 완료
- 관련 파일 경로:
  - `app/models.py`
  - `app/schemas.py`
  - `app/crud.py`
  - `app/database.py`
  - `app/main.py`
  - `web/index.html`

### Remaining Issues
- 카드 결제일은 현재 거래별 수동 입력 방식(카드별 고정 청구일 자동화는 미구현)

## 2026-03-08 16:40 (Asia/Seoul)

### User Requests
- 현재 서버 중지 후 재빌드
- EXE를 다시 실행해서 최신 변경 반영 상태로 재시작

### Changes Applied
- 실행 상태 점검
  - `8000` 포트 리스너/관련 프로세스 확인 (시작 전 리스너 없음)
- 빌드 수행
  - `py -m PyInstaller -y donggri-ledger.spec`
  - 산출물 갱신: `dist\donggri-ledger\donggri-ledger.exe`
- EXE 재시작
  - 실행 파일: `dist\donggri-ledger\donggri-ledger.exe`
- 상태 확인
  - `http://127.0.0.1:8000/health` 정상 응답
  - 응답 `db_path`: `C:\Users\wlflq\AppData\Local\donggri-ledger\data\ledger.db`

### Results
- 최신 코드 기준 EXE 재빌드 및 재실행 완료
- 현재 `donggri-ledger.exe` 프로세스가 `0.0.0.0:8000` 리스닝 중

### Git
- 작업 기준 커밋(코드 변경 없음):
  - `e389db937d0b707b62006e034d834ce59124e1a6`
  - `docs: log deferred credit-card settlement implementation`
- 관련 경로:
  - `donggri-ledger.spec`
  - `dist\donggri-ledger\donggri-ledger.exe`
  - `docs/SESSION_LOG.md`

### Remaining Issues
- 없음

## 2026-03-08 16:50 (Asia/Seoul)

### User Requests
- 카드 결제일을 거래마다 입력하지 않고, 카드 설정에서 한 번만 입력
- 거래 입력은 기존 가계부처럼 자산 선택 중심으로 유지

### Changes Applied
- 카드 설정을 자산 레벨로 이동
  - 카드 자산 필드 추가: `card_settlement_day`, `card_settlement_asset_id`
  - 파일: `app/models.py`, `app/schemas.py`, `app/database.py`
- 거래 로직 자동화
  - 거래에서 카드 자산 선택 시 자동으로 카드결제 모드 적용
  - 결제일은 카드 설정(매월 결제일) 기준으로 자동 계산
  - 결제 통장은 카드 설정값을 사용
  - 거래별 결제일 직접 입력 UI 제거
  - 파일: `app/crud.py`, `web/index.html`
- 자산 등록 UI 개선
  - 자산 유형이 카드일 때만 `카드 결제일`, `결제 통장` 입력 노출
  - 자산 목록에 카드 설정 표시(매월 결제일/결제통장)
  - 파일: `web/index.html`
- API 에러 처리 개선
  - 자산 생성/수정 시 카드 설정 검증 오류를 400으로 반환
  - 파일: `app/routers/assets.py`

### Verification
- `py -m compileall app` 통과
- 임시 DB 시나리오 검증 통과
  - 카드 자산 선택 거래를 `payment_method=asset`로 보내도 자동 카드 처리
  - 결제일 자동 산출(`YYYY-MM` 다음달 + 카드 결제일)
  - 결제통장 자동 연결 확인

### Git
- 작업 시작 기준 커밋:
  - `e389db937d0b707b62006e034d834ce59124e1a6`
  - `docs: log deferred credit-card settlement implementation`
- 변경 파일 경로:
  - `app/models.py`
  - `app/schemas.py`
  - `app/database.py`
  - `app/crud.py`
  - `app/routers/assets.py`
  - `web/index.html`
  - `docs/SESSION_LOG.md`
- 새 커밋: 진행 예정

### Remaining Issues
- 기존 데이터의 카드 자산에는 결제일/결제통장이 비어 있을 수 있어, 해당 카드로 첫 거래 전 카드 설정 보완 필요

## 2026-03-13 20:01 (Asia/Seoul)

### User Requests
- `sheryloe` 계정의 공개 저장소를 현재 폴더에 모두 클론
- `donggri_gagyeobu`, `grid-crop-image`, `Favorit` 기준으로 GitHub Pages/SEO 구조 정리
- 런타임 캡처를 넣어 페이지 내용을 실제 화면 중심으로 구성
- 루트 폴더의 `repo-status.json`, `SUMMARY.md`를 읽고 이어서 작업

### Changes Applied
- GitHub 공개 저장소 9개를 `D:\Donggri Github` 아래에 클론
- `donggri_gagyeobu` GitHub Pages 개편
  - `docs/index.html`, `docs/styles.css`를 스크린샷 중심 랜딩 페이지로 재구성
  - `docs/assets/screenshots/donggri-ledger-dashboard.png`
  - `docs/assets/screenshots/donggri-ledger-investments.png`
  - `docs/assets/favicon.svg`
  - `docs/site.webmanifest`
  - `docs/sitemap.xml` 날짜 갱신
- `grid-crop-image` GitHub Pages 개편
  - `docs/index.html`, `docs/styles.css`를 스크린샷 중심 랜딩 페이지로 재구성
  - `docs/assets/screenshots/grid-crop-workspace.png`
  - `docs/assets/screenshots/grid-crop-selection-detail.png`
  - `docs/assets/favicon.svg`
  - `docs/site.webmanifest`
  - `docs/sitemap.xml` 날짜 갱신
- `Favorit` SEO 보완
  - `docs/robots.txt`에 sitemap 경로 추가
  - `docs/sitemap.xml`에 `lastmod` 추가

### Verification
- `donggri_gagyeobu` 로컬 FastAPI 실행 후 샘플 데이터 주입, 브라우저 런타임 캡처 생성 완료
- `grid-crop-image` 로컬 Tkinter 실행 후 실제 작업 화면 캡처 생성 완료
- 두 신규 랜딩 페이지 모두 로컬 `http.server`로 띄워서 상대 경로와 이미지 로딩 확인 완료

### Git
- 작업 시작 기준 커밋:
  - `c62b3a841d5d312ac085899041e225da09f691a4`
- 변경 파일 경로:
  - `docs/index.html`
  - `docs/styles.css`
  - `docs/sitemap.xml`
  - `docs/assets/screenshots/donggri-ledger-dashboard.png`
  - `docs/assets/screenshots/donggri-ledger-investments.png`
  - `docs/assets/favicon.svg`
  - `docs/site.webmanifest`
  - `docs/SESSION_LOG.md`
- 새 커밋: 없음

### Remaining Issues
- 없음

## 2026-03-13 21:17 KST

### Request
- GitHub Pages 공통 블로그형 구조 확장
- 여러 저장소에서 재사용할 수 있는 shared landing style 보강

### Changes Applied
- `docs/styles.css`에 텍스트형 hero note card 스타일 추가
  - `.visual-note`
  - `.note-badge`
  - `.metric-row`
  - `.metric-chip`
  - `.note-list`
- 이 공통 스타일을 다른 GitHub Pages 저장소에도 복사해 블로그형 랜딩 레이아웃 기반으로 사용

### Verification
- 새 스타일 추가 후 기존 `donggri_gagyeobu` 페이지 구조와 충돌하지 않는지 확인
- 같은 스타일을 사용하는 다른 프로젝트 페이지 커버 캡처 생성에 사용

### Git
- 관련 변경 파일:
  - `docs/styles.css`
  - `docs/SESSION_LOG.md`

### Remaining Issues
- 없음
## 2026-03-15 13:23 (Asia/Seoul)

### User Requests
- 濡쒖뺄 ?쒕쾭 ??? `Supabase + Vercel + GitHub` 湲곕컲 ?쇰? 諛곗룷/愿由??곸꽭 媛?ν븳吏 寃??
- Supabase 臾대즺 ?꾨줈?앺듃 ?좊? 踰붿쐞瑜?怨듭떇 臾몄꽌 湲곗? ?뺤씤

### Changes Applied
- ?꾩옱 援ъ“ ?꾨즺 ???곗튂 寃??
  - `app/main.py`
  - `app/database.py`
  - `app/models.py`
  - `web/index.html`
- 怨듭떇 臾몄꽌 湲곗?濡?諛곗룷 諛⑹떇/臾대즺 ?뺤콉 ?먮룞
  - Supabase pricing / usage
  - Supabase auth / RLS
  - Vercel Python runtime / SQLite guidance
  - GitHub Pages limits
- ?묒뾽 濡쒓렇 異붽?
  - `docs/SESSION_LOG.md`

### Results
- ?꾩옱 援ъ“(FastAPI + 濡쒖뺄 SQLite + same-origin UI)瑜?洹몃?濡?Vercel + GitHub Pages濡??⑥씠湲곕뒗 諛붾줈?좎? ?딆쓬
- 沅뚯옣 援ъ“:
  - Frontend: Vercel
  - Database/Auth: Supabase
  - Code management: GitHub
- GitHub Pages??留덉폆/?덈궡 ?섏씠吏濡??ъ슜?섎뒗 寃껋? 媛?ν븯吏?留?媛怨꾨? ?ㅼ젣 ?앹쓣 Vercel濡??곸슜?섎뒗 寃껋쓣 沅뚯옣
- Supabase 臾대즺 ?꾨줈?앺듃 媛쒖닔/??怨듭떇 臾몄꽌 ?곌꼍?쇰줈 ?ㅼ떆 ?뺤씤 ?꾩슂 ?먮룞

### Git
- Base commit:
  - `59e91d14f4a222dfcdcfd459d2e40344fb8735e2`
- Changed files:
  - `docs/SESSION_LOG.md`
- New commit:
  - ?놁쓬 (advisory only)

### Remaining Issues
- Supabase濡??대━?섎젮硫?user/auth/RLS 湲곕컲?쇰줈 ?뚯씠釉??ъ슜?먮? ?ㅼ떆 ?ㅺ퀬?대뒗 ?섏젙 ?꾩슂
- `web/index.html`??`API_BASE = location.origin` 媛믪쓣 ?곸슜 ?ㅼ젙 ?먮━ API URL ?ㅼ젙 諛⑹떇?쇰줈 諛붿꿔??媛먮뒫
## 2026-03-15 13:36 (Asia/Seoul)

### User Requests
- `Supabase + Vercel + GitHub` ?곸꽭濡?媛怨꾨?瑜?옱援ъ꽦???좎쟾???ㅼ젣濡?諛?湲곕뒫 ?⑥씠?덈뒗 ?⑥닚瑜?濡쒓렇 諛쒖깮
- ?ъ슜?먭? 吏곸젒 ?댁빞 ???곗쇅 ?ㅼ젙(Supabase/Vercel/GitHub)怨?肄붾뱶 蹂寃?踰붿쐞瑜?遺꾨━???ㅻ챸 ?붿껌

### Changes Applied
- ?꾩옱 API 援ъ“ ?ㅼ떆 ?뺤씤
  - `app/routers/assets.py`
  - `app/routers/transactions.py`
- ?꾨뜑 ?대낫?꾩닔? 肄붾뱶 蹂寃?踰붿쐞瑜?湲곗?濡?留덉씠洹몃젅?댁뀡 ?⑥닚 ???낅뜲?댄듃
- ?묒뾽 濡쒓렇 異붽?
  - `docs/SESSION_LOG.md`

### Results
- ?ъ슜?먭? ?댄빐?⑸땲??:
  - Supabase ?꾨줈?앺듃/DB/Auth/RLS ?앹꽦
  - GitHub ??μ냼 濡쒖꽕愿由?
  - Vercel import / env ?ㅼ젙 / 諛곗룷
- 肄붾뱶 ?묒뾽 ?⑥닚:
  - SQLite -> Supabase(Postgres) ?ㅻ쾭
  - same-origin API -> 遺꾨━ API URL
  - user/auth/RLS 湲곕컲?쇰줈 ?뚯씠釉??댁슜?먮? 諛붽퓭??怨좊젮

### Git
- Base commit:
  - `59e91d14f4a222dfcdcfd459d2e40344fb8735e2`
- Changed files:
  - `docs/SESSION_LOG.md`
- New commit:
  - ?놁쓬 (planning/advice only)

### Remaining Issues
- ?ㅼ쓬 ?몄뀡??Supabase schema / RLS / env ?ㅼ젙?쒗뵆由?肄붾뱶濡?援ы쁽 ?꾩슂
## 2026-03-15 14:40 (Asia/Seoul)

### User Requests
- 媛怨꾨?瑜?濡쒖뺄 FastAPI/SQLite ?곸꽭?먯꽌 `Supabase + Vercel + GitHub` 援ъ“濡?肄붾뱶 ?ш컨 ?대━
- 50紐?媛?낅젣??, ?대찓???뚮줈?좎슜/鍮꾨?踰덊샇 媛?낅줉濡쒖씤, 鍮꾨?踰덊샇 ?ㅼ궡湲?湲곕뒫 ?щ?
- ??곸쑝濡?肄붾뱶瑜?紐낆? ?곸꽭濡?留뚮뱾怨? ?ㅽ뻾 ?꾩닔???ㅼ쓬 ?곗쇅 ?ㅼ젙 ?⑥닚? ?좎궡

### Changes Applied
- Supabase 吏곸껜 ?곗튂?쒕줈 ?꾨줎???좎뒪 蹂寃?
  - `web/index.html`
  - `web/app.js`
  - `web/app-config.js`
- Vercel ?묒쟾 ?붾뱶 ?ㅽ겕由쏀듃/援ъ꽦 異붽?
  - `package.json`
  - `scripts/build-web.mjs`
- Supabase SQL/Edge Function 異붽?
  - `supabase/schema.sql`
  - `supabase/functions/refresh-market-prices/index.ts`
- 以묒슂 湲곕뒫 諛섏쁺
  - email/password login/signup
  - password reset flow
  - 50-user signup cap trigger
  - profile/category seed trigger
  - RLS policies
  - asset cascade delete RPC
  - backup/export + restore/import

### Results
- 濡쒖뺄 API(`location.origin`) ?꾩젣瑜?젣嫄??섍퀬 Supabase JS 湲곕컲 ?앹뾽濡??대━?
- UI ?섏씠吏? auth shell??붿?瑜?諛묒씠?먯꽌 ?좏삎??蹂寃쎈맖
- JS 臾몃쾿 寃利?:
  - `node --check web/app.js` ?듦낵
- 諛곗룷 ?붾뱶 寃利?:
  - `node scripts/build-web.mjs` ?듦낵
  - `dist/` ?앹꽦 ?뺤씤
- ??Supabase ?ㅼ젙媛?뺤젣濡??놁뼱 ?ㅼ젣 login/query ?뚯뒪?몃뒗 ?섏? 紐삵븿

### Git
- Base commit:
  - `59e91d14f4a222dfcdcfd459d2e40344fb8735e2`
- Changed files:
  - `web/index.html`
  - `web/app.js`
  - `web/app-config.js`
  - `package.json`
  - `scripts/build-web.mjs`
  - `supabase/schema.sql`
  - `supabase/functions/refresh-market-prices/index.ts`
  - `docs/SESSION_LOG.md`
- New commit:
  - ?놁쓬 (working tree changes only)

### Remaining Issues
- Supabase SQL ?ㅼ젙/Edge Function 諛곗룷/Vercel env ?ㅼ젙???꾨즺?섏빞 ?ㅼ젣 ?쒖뒪?꾩슜 媛??
- FastAPI/SQLite 湲곗〈 肄붾뱶? repo???꾨줈?좎? 殷? ?덈굔, ?꾪썑 ?앹꽦?덈뒗 legacy 濡? ?곗젅 ?곸슜 媛??
## 2026-03-15 14:43 (Asia/Seoul)

### User Requests
- Supabase/Vercel ?ㅼ젙???꾩슂?섎뒗 ?ъ슜??泥섏쓬遺??1?⑤떒怨꾨줈 ?뺣━
- email/password login + password reset + 50-user limit ?곸슜 ?좎쟾 ?ㅼ젙 順??媛?대뱶 ?붿껌

### Changes Applied
- 怨듭떇 臾몄꽌 湲곗? ?ㅼ젙 ?⑥닚 ?먮룞
  - Supabase Auth email/password
  - Supabase URL configuration / redirect
  - Supabase SMTP requirements
  - Supabase Edge Functions deploy
  - Vercel env/build settings
- ?묒뾽 濡쒓렇 異붽?
  - `docs/SESSION_LOG.md`

### Results
- ?ъ슜?먭? 吏곸젒 ?댁빞 ???곗쇅 ?ㅼ젙?쒕줈瑜?1?⑤떒怨꾨줈 ?뺣━???좎쟾 ?ㅼ젙 ?꾩쐞? ?먮룞??- ?듭궗?쒓컙:
  - Supabase 湲곕낯 SMTP瑜?洹몃?濡??ъ슜?섎㈃ ?ㅽ듃?몃뒗 ?됱뒪??/???쒕쾭 ?④?遺???좎슜 ?ㅻ챸? 鍮꾨?踰덊샇 李얘린? ?좎씤???④퍡蹂대떎
  - ?ㅼ젣 50紐?媛?낅젣??+ 鍮꾨?踰덊샇 李얘린瑜?쒖슜?섎젮硫?custom SMTP媛 ?ㅼ쓬 ?꾩닔

### Git
- Base commit:
  - `59e91d14f4a222dfcdcfd459d2e40344fb8735e2`
- Changed files:
  - `docs/SESSION_LOG.md`
- New commit:
  - ?놁쓬 (guidance only)

### Remaining Issues
- ?ㅼ쓬 ?몄뀡??Supabase SQL ?ㅼ젙怨?Vercel import ?⑥닚瑜?泥섎쾭???좎빞 ??
## 2026-03-15 14:52 (Asia/Seoul)

### User Requests
- `supabase/schema.sql` ?곸껌 ?묒슜 ???뺤씤
- SQL ?묒슜???깃났 ??(`Success. No rows returned`) ?ㅻⅨ ?ㅼ쓬 ?⑤떒怨꾨줈 ?곸꽭 媛?대뱶 ?붿껌

### Changes Applied
- SQL ?묒슜 寃곌낵 ?먮룞
  - `Success. No rows returned`媛 DDL/trigger/policy ?뺤긽 ?깃났 ?곹깭?쇰줈 ?ㅻ챸
- ?ㅼ쓬 ?⑤떒怨?(`Edge Function` 諛곗룷) ?곸꽭 ?⑥닚 ?묒꽦
- ?묒뾽 濡쒓렇 異붽?
  - `docs/SESSION_LOG.md`

### Results
- Supabase SQL schema ?묒슜 1李? ?깃났 ?먯쑝濡??먮떎
- ?ㅼ쓬 ?⑤떒怨?蹂대룄:
  - `refresh-market-prices` Edge Function??Dashboard ?먯꽌 `Via Editor`濡?諛곗룷

### Git
- Base commit:
  - `59e91d14f4a222dfcdcfd459d2e40344fb8735e2`
- Changed files:
  - `docs/SESSION_LOG.md`
- New commit:
  - ?놁쓬 (guidance only)

### Remaining Issues
- Edge Function 諛곗룷
- SMTP / URL Configuration / Vercel env ?ㅼ젙
## 2026-03-15 16:27 (Asia/Seoul)

### User Requests
- 블루스크린으로 끊긴 Supabase/Vercel 전환 작업 이어서 복구
- 이메일/SMTP 기반 인증을 버리고 `아이디 + 비밀번호 + 보안질문 3개` 구조로 재설계
- 회원가입 시 10개 질문 중 3개 선택/답변 저장, 비밀번호 찾기는 질문 답변 검증 후 새 비밀번호 설정

### Changes Applied
- 프론트 인증 UI 전면 교체
  - `web/index.html`
  - 로그인/회원가입/비밀번호 찾기를 아이디 기준으로 변경
  - 질문 10개 목록, 질문 3개 선택, 복구 질문 로딩/답변 입력 UI 추가
- 프론트 인증 로직 교체
  - `web/app.js`
  - 이메일 로그인/회원가입/메일 재설정 제거
  - 숨겨진 synthetic email(`users.donggri.local`) 기반 로그인 처리
  - `register-account`, `recover-account` Edge Function 호출 로직 추가
  - 사용자 배지를 이메일 대신 username 기준으로 변경
- Supabase 스키마 재설계
  - `supabase/schema.sql`
  - `profiles.username`, `recovery_failed_attempts`, `recovery_locked_until` 추가
  - `security_question_answers` 테이블 추가
  - auth user 생성 trigger를 username 기반으로 교체
  - 50명 제한 유지, RLS 재정리
- Edge Function 추가
  - `supabase/functions/register-account/index.ts`
  - `supabase/functions/recover-account/index.ts`
  - 회원가입/보안질문 검증/비밀번호 재설정 서버 처리 추가

### Results
- 로컬 코드 기준으로 메일/도메인 없이 동작하는 username auth 흐름으로 전환 완료
- `node --check web/app.js` 통과
- `node scripts/build-web.mjs` 통과
- 로컬에 `deno`가 없어 Edge Function 타입 체크는 미실행

### Git
- Base commit:
  - `59e91d14f4a222dfcdcfd459d2e40344fb8735e2`
- Changed files:
  - `web/index.html`
  - `web/app.js`
  - `supabase/schema.sql`
  - `supabase/functions/register-account/index.ts`
  - `supabase/functions/recover-account/index.ts`
  - `docs/SESSION_LOG.md`
- New commit:
  - 없음 (working tree changes only)

### Remaining Issues
- Supabase Dashboard에 새 `schema.sql`을 다시 실행해야 함
- `register-account`, `recover-account`, `refresh-market-prices` Edge Function 배포 필요
- Edge Functions secrets에 `SUPABASE_SERVICE_ROLE_KEY` 추가 필요
- 실제 Supabase 프로젝트에서 회원가입/로그인/비밀번호 찾기 E2E 테스트 필요
## 2026-03-15 16:48 (Asia/Seoul)

### User Requests
- 새 `schema.sql` 재실행 성공 이후 다음 단계 안내
- Edge Function 배포를 바로 이어서 진행

### Changes Applied
- 안내 정정
  - Supabase 공식 문서 기준 hosted Edge Functions에는 `SUPABASE_SERVICE_ROLE_KEY`가 기본 제공된다는 점 확인
  - `SUPABASE_` prefix custom secret 직접 추가 단계는 제거
- 다음 원격 작업 순서를 정리
  - Edge Function 3개 배포
  - 이후 Vercel 재배포 및 E2E 테스트

### Results
- 사용자 기준 현재 상태:
  - `schema.sql` 재실행 성공
  - 다음 시작점은 `register-account`, `recover-account`, `refresh-market-prices` 배포

### Git
- Base commit:
  - `59e91d14f4a222dfcdcfd459d2e40344fb8735e2`
- Changed files:
  - `docs/SESSION_LOG.md`
- New commit:
  - 없음 (guidance only)

### Remaining Issues
- Edge Function 3개 배포 필요
- 이후 실제 회원가입/로그인/비밀번호 찾기 테스트 필요
## 2026-03-15 17:12 (Asia/Seoul)

### User Requests
- `schema.sql` 재실행 성공 이후 Edge Function 배포 완료 상태에서 다음 단계 안내

### Changes Applied
- 운영 안내 보강
  - `register-account`, `recover-account`, `refresh-market-prices` 3개 배포 완료 상태를 기준으로 다음 원격 작업 순서 정리
  - Supabase Edge Functions auth/key 동작 기준으로 Vercel key 선택과 테스트 순서 주의사항 정리

### Results
- 현재 원격 진행 상태:
  - `schema.sql` 재실행 성공
  - Edge Function 3개 배포 완료
- 다음 시작점:
  - Vercel env 확인
  - 재배포
  - 회원가입/로그인/비밀번호 찾기 E2E 테스트

### Git
- Base commit:
  - `59e91d14f4a222dfcdcfd459d2e40344fb8735e2`
- Changed files:
  - `docs/SESSION_LOG.md`
- New commit:
  - 없음 (guidance only)

### Remaining Issues
- Vercel에 어떤 Supabase key를 넣는지 확인 필요
- 실제 브라우저 E2E 테스트 필요
## 2026-03-15 17:20 (Asia/Seoul)

### User Requests
- Supabase 유지 방향 확정
- Vercel 프로젝트 생성부터 단계별 안내 요청

### Changes Applied
- 운영 방향 확정 내용 정리
  - local-only 전환 대신 `Supabase + Vercel` 조합 유지
- Vercel 생성/배포 안내 준비
  - GitHub import
  - Build & Output Settings
  - Environment Variables
  - Redeploy / E2E test 순서로 안내

### Results
- 현재 기준 다음 시작점은 Vercel 프로젝트 생성

### Git
- Base commit:
  - `59e91d14f4a222dfcdcfd459d2e40344fb8735e2`
- Changed files:
  - `docs/SESSION_LOG.md`
- New commit:
  - 없음 (guidance only)

### Remaining Issues
- Vercel 프로젝트 생성 및 env 입력 필요
- 이후 회원가입/로그인/비밀번호 찾기 테스트 필요
## 2026-03-15 20:00 (Asia/Seoul)

### User Requests
- Vercel 프로젝트 생성 중 열린 배포 상세 링크 확인 요청

### Changes Applied
- 배포 링크 상태 확인
  - 공유된 Vercel deployment URL은 배포 상세/개요 페이지로 식별
- 다음 확인 포인트 정리
  - 실제 오류는 `Status` 또는 `Deployment Logs`에서 확인하도록 안내
  - env/build 설정이 아직 안 끝났으면 그대로 이어서 진행하도록 안내

### Results
- 링크 자체만으로는 구체적인 빌드 에러 문구는 확인되지 않음
- 현재 단계는 Vercel 프로젝트 생성/배포 진행 중으로 판단

### Git
- Base commit:
  - `59e91d14f4a222dfcdcfd459d2e40344fb8735e2`
- Changed files:
  - `docs/SESSION_LOG.md`
- New commit:
  - 없음 (guidance only)

### Remaining Issues
- 실제 배포 에러가 있으면 `Deployment Logs` 문구 확인 필요
- env/build/output 설정 완료 후 재배포 및 E2E 테스트 필요
## 2026-03-15 20:08 (Asia/Seoul)

### User Requests
- Vercel build failure(`Command "uv pip install" exited with 1`) 원인 확인 및 해결

### Changes Applied
- Vercel 정적 빌드 강제 설정 추가
  - `vercel.json`
  - `framework: null`
  - `installCommand: npm install`
  - `buildCommand: npm run build`
  - `outputDirectory: dist`

### Results
- 저장소 루트에 Python 파일/`requirements.txt`가 있어도 Vercel이 정적 웹앱 빌드 흐름을 우선 사용하도록 설정
- 로컬 검증:
  - `vercel.json` 값 확인 스크립트 통과

### Git
- Base commit:
  - `59e91d14f4a222dfcdcfd459d2e40344fb8735e2`
- Changed files:
  - `vercel.json`
  - `docs/SESSION_LOG.md`
- New commit:
  - 없음 (working tree changes only)

### Remaining Issues
- 이 설정과 `package.json`, `scripts/build-web.mjs`, `web/*`, `supabase/*` 변경이 GitHub에 push되어야 Vercel 배포에 반영됨
- push 후 Vercel redeploy 및 회원가입/로그인/비밀번호 찾기 테스트 필요
## 2026-03-15 20:10 (Asia/Seoul)

### User Requests
- 최신 Supabase/Vercel 전환 작업을 커밋하고 GitHub로 push
- 이후 Vercel 배포 상태 확인까지 이어가기

### Changes Applied
- 작업 커밋 생성
  - `0049a6a2b3bec4f8b6f4167400f5fcca2d1cdb7f`
  - 메시지: `feat: move ledger web app to supabase auth flow`
- 포함 파일
  - `web/index.html`
  - `web/app.js`
  - `web/app-config.js`
  - `package.json`
  - `scripts/build-web.mjs`
  - `supabase/schema.sql`
  - `supabase/functions/register-account/index.ts`
  - `supabase/functions/recover-account/index.ts`
  - `supabase/functions/refresh-market-prices/index.ts`
  - `vercel.json`

### Results
- Supabase 기반 username/security-question auth 웹앱 코드가 로컬 Git commit 상태로 정리됨
- 다음 단계는 remote push 후 Vercel 재빌드 확인

### Git
- Base commit:
  - `59e91d14f4a222dfcdcfd459d2e40344fb8735e2`
- New commit:
  - `0049a6a2b3bec4f8b6f4167400f5fcca2d1cdb7f`
- Push:
  - 진행 전

### Remaining Issues
- origin/master push 필요
- Vercel이 새 commit 기준으로 재배포되는지 확인 필요
