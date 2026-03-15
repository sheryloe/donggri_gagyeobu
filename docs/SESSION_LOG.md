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
## 2026-03-15 20:10 (Asia/Seoul)

### User Requests
- 최신 작업 commit/push 완료 상태까지 정리

### Changes Applied
- GitHub push 완료
  - feature commit: `0049a6a2b3bec4f8b6f4167400f5fcca2d1cdb7f`
  - docs/log commit: `f0580a5748254084d936628f437cf5a9eb999115`
  - remote: `origin/master`

### Results
- `master`가 GitHub `origin/master`에 반영 완료
- Vercel Git 연동이 켜져 있으면 새 commit 기준 자동 배포가 시작될 수 있음

### Git
- Push range:
  - `59e91d14f4a222dfcdcfd459d2e40344fb8735e2..f0580a5748254084d936628f437cf5a9eb999115`

### Remaining Issues
- Vercel에서 최신 commit으로 빌드되는지 확인 필요
- 필요하면 `Redeploy`로 다시 배포
## 2026-03-15 20:15 (Asia/Seoul)

### User Requests
- auth 첫 화면 UI가 서비스형답지 않다는 피드백
- 로그인/회원가입/질문 UI를 더 정돈된 구조로 수정 후 commit/push 요청

### Changes Applied
- auth 화면 레이아웃 재구성
  - `web/index.html`
  - 좌측 브랜드/설명 패널 + 우측 인증 패널의 2열 구조로 변경
  - 로그인 기본 진입점 강조
  - 회원가입 질문 후보 10개는 `<details>`로 접어서 기본 노출 축소
  - 질문 3개 입력을 step card 형태로 재배치
  - recovery 화면도 단계 설명 중심으로 정리
- auth 패널 메타 텍스트 동기화 추가
  - `web/app.js`
  - 탭 전환 시 제목/설명/가입 가능 인원 노출 상태를 모드별로 변경

### Results
- 로그인 화면이 기본 서비스 진입점처럼 보이도록 정리됨
- 회원가입/복구 화면이 한 번에 들이붓는 형태에서 단계형 구조로 개선됨
- 검증:
  - `node --check web/app.js` 통과
  - `node scripts/build-web.mjs` 통과

### Git
- Changed files:
  - `web/index.html`
  - `web/app.js`
- New commit:
  - 진행 전

### Remaining Issues
- commit/push 후 Vercel에서 최신 UI로 재배포되는지 확인 필요

## 2026-03-15 20:28 (Asia/Seoul)

### User Requests
- auth 첫 화면을 로그인 폼 1개만 보이는 기본 루트로 재구성
- `회원가입`, `비밀번호 찾기`는 버튼 클릭 후 다음 step 화면으로 이동하도록 정리
- 변경 후 commit / push 진행

### Changes Applied
- login-first auth shell로 마크업 단순화
  - `web/index.html`
  - 좌측 브랜드 패널 제거
  - 로그인 폼만 기본 노출
  - 로그인 하단 `회원가입`, `비밀번호 찾기` 링크 버튼 추가
  - 회원가입 / 비밀번호 찾기 화면 상단에 `로그인으로 돌아가기` 버튼 추가

### Verification
- `node --check web/app.js` 통과
- `node scripts/build-web.mjs` 통과

### Results
- 첫 진입 화면이 로그인 폼 하나만 보이는 구조로 변경됨
- 회원가입 / 비밀번호 찾기는 별도 탭 노출 없이 다음 화면처럼 이동하는 흐름으로 정리됨

### Git
- Feature commit:
  - `123865169ed985b637470e1c5cac178ad9ef6780`
  - `feat: simplify auth flow to login-first screen`
- Changed files:
  - `web/index.html`
  - `docs/SESSION_LOG.md`

### Remaining Issues
- GitHub push 후 Vercel에서 최신 auth 루트가 반영됐는지 확인 필요

## 2026-03-15 20:37 (Asia/Seoul)

### User Requests
- 로그인 / 회원가입 / 비밀번호 찾기가 같은 화면 모드 전환처럼 보이지 않게 수정
- 로그인 화면에서 버튼을 눌렀을 때 회원가입 화면으로 넘어가는 view pipeline 형태로 재구성
- 변경 후 commit / push 진행

### Changes Applied
- auth flow를 screen 단위로 분리
  - `web/index.html`
  - 로그인 / 회원가입 / 비밀번호 찾기 각 화면을 별도 `auth-panel` 섹션으로 분리
  - 기본 루트는 로그인 화면만 노출
  - 회원가입 가능 인원 안내는 회원가입 화면에만 노출
- auth mode 토글 로직 단순화
  - `web/app.js`
  - 공유 헤더 메타 전환 제거
  - `data-auth-screen` 기준으로 화면 단위 숨김/표시 처리

### Verification
- `node --check web/app.js` 통과
- `node scripts/build-web.mjs` 통과

### Results
- 로그인 화면에서 회원가입 버튼을 누르면 별도 회원가입 화면으로 넘어가는 흐름으로 정리됨
- 하나의 카드 안에서 탭/모드만 바뀌는 인상이 줄고, 서비스형 auth 진입 흐름에 더 가깝게 정리됨

### Git
- Feature commit:
  - `c82350fe7ee308b1e7310f70777f8832895204a4`
  - `feat: split auth into separate login and signup screens`
- Changed files:
  - `web/index.html`
  - `web/app.js`
  - `docs/SESSION_LOG.md`

### Remaining Issues
- GitHub push 후 Vercel에서 최신 auth flow가 반영됐는지 확인 필요

## 2026-03-15 20:46 (Asia/Seoul)

### User Requests
- 회원가입 테스트 시 `Edge Function returned a non-2xx status code` 오류 원인 점검
- 원인 추적을 쉽게 하도록 프론트 에러 표시도 보강

### Changes Applied
- Edge Function 에러 본문 파싱 보강
  - `web/app.js`
  - `functions.invoke()` 실패 시 `error.context.text()`까지 읽어서 JSON / plain text 본문을 그대로 메시지로 표시하도록 보강
- Supabase 공식 문서 기준 원인 재확인
  - public endpoint 성격의 Edge Function은 JWT verification 해제 권장
  - JWT verification이 켜진 상태에서 publishable key 또는 잘못된 key를 쓰면 `401 Invalid JWT`가 발생할 수 있음

### Verification
- `node --check web/app.js` 통과
- `node scripts/build-web.mjs` 통과

### Results
- 다음 오류부터는 `non-2xx` 대신 실제 함수 응답 본문이 더 잘 노출되도록 개선됨
- 회원가입/비밀번호 찾기용 `register-account`, `recover-account`는 Supabase Dashboard에서 JWT verification 설정 확인이 필요함

### Git
- Changed files:
  - `web/app.js`
  - `docs/SESSION_LOG.md`

### Remaining Issues
- Supabase Dashboard에서 `register-account`, `recover-account`의 JWT verification 설정 확인 필요
- 필요 시 Vercel `SUPABASE_ANON_KEY`가 legacy anon key인지 확인 필요

## 2026-03-15 20:53 (Asia/Seoul)

### User Requests
- 회원가입 시 `Unexpected error`만 보이는 상황 해결
- 실제 Edge Function / DB 오류 원문이 사용자 화면에 보이도록 보강

### Changes Applied
- Edge Function catch 메시지 보강
  - `supabase/functions/register-account/index.ts`
  - `supabase/functions/recover-account/index.ts`
  - `Error` 인스턴스뿐 아니라 PostgREST / auth plain object의 `message`, `details`, `hint`, `code`까지 문자열로 조합해 반환하도록 `describeError()` 추가

### Verification
- `node scripts/build-web.mjs` 통과

### Results
- 다음 회원가입/비밀번호 찾기 실패부터는 `Unexpected error` 대신 실제 원인에 더 가까운 에러 문구가 노출되도록 준비됨
- 이 변경은 Supabase Dashboard에서 두 Edge Function을 다시 배포해야 실제 반영됨

### Git
- Changed files:
  - `supabase/functions/register-account/index.ts`
  - `supabase/functions/recover-account/index.ts`
  - `docs/SESSION_LOG.md`

### Remaining Issues
- `register-account`, `recover-account` Edge Function 재배포 필요
- 재시도 후 실제 에러 문구 확인 필요

## 2026-03-15 21:02 (Asia/Seoul)

### User Requests
- 회원가입 재시도 시 `Invalid API key` 오류 원인 확인
- 현재 단계에서 어떤 키를 다시 맞춰야 하는지 즉시 복구 가능한 순서 안내

### Changes Applied
- 원인 분류 정리
  - `profiles.username` 누락 문제는 SQL 재실행으로 해소
  - 현재 오류는 schema가 아니라 Supabase API key / project URL mismatch 가능성이 높다고 정리
- 점검 포인트 정리
  - Vercel `SUPABASE_URL`과 `SUPABASE_ANON_KEY`가 같은 Supabase 프로젝트에서 발급된 값인지 확인
  - Edge Function 기본 secret과 수동 override 충돌 가능성 확인

### Results
- 현재 우선순위는 코드 수정이 아니라 Supabase / Vercel 키 매칭 확인으로 정리

### Git
- Changed files:
  - `docs/SESSION_LOG.md`

### Remaining Issues
- Vercel env의 `SUPABASE_URL`, `SUPABASE_ANON_KEY` 재확인 필요
- Supabase Edge Functions에서 `SUPABASE_SERVICE_ROLE_KEY`를 수동으로 잘못 넣은 적이 있는지 확인 필요

## 2026-03-15 21:49 (Asia/Seoul)

### User Requests
- 투자 탭 `실시간 가격 새로고침` 시 `Edge Function returned a non-2xx status code` 오류 점검
- 실제 원인을 좁히고 재시도 가능한 상태로 정리

### Changes Applied
- refresh-market-prices 호출 경로 개선
  - `web/app.js`
  - 공통 `invokeEdgeFunction()`에서 현재 세션 access token을 명시적으로 `Authorization` 헤더로 전달
  - 투자 시세 새로고침도 공통 Edge Function 헬퍼를 사용하도록 변경
- refresh-market-prices 함수 에러 본문 보강
  - `supabase/functions/refresh-market-prices/index.ts`
  - plain object / PostgREST 에러도 `message`, `details`, `hint`, `code`까지 문자열로 반환하도록 `describeError()` 추가

### Verification
- `node --check web/app.js` 통과
- `node scripts/build-web.mjs` 통과

### Results
- 실시간 가격 새로고침 요청이 사용자 세션 토큰을 명시적으로 싣고 호출되도록 보강됨
- 다음 실패부터는 `non-2xx` 대신 실제 함수 에러 문구가 더 잘 보이도록 준비됨

### Git
- Changed files:
  - `web/app.js`
  - `supabase/functions/refresh-market-prices/index.ts`
  - `docs/SESSION_LOG.md`

### Remaining Issues
- `refresh-market-prices` Edge Function 재배포 필요
- 재시도 후 실제 오류 문구 확인 필요

## 2026-03-15 21:57 (Asia/Seoul)

### User Requests
- 현재 기능과 앞으로 추천할 기능을 기준으로 `README.md`와 GitHub Pages 정리
- Tistory/SEO 스타일의 Step 1~5 빌드 스토리 구조 정리
- Notion 부모 페이지 아래에 Step 1~5 하위페이지 생성 시도
- 투자 화면 관리 열의 삭제 버튼 깨진 문자 수정

### Changes Applied
- 문서 전면 개편
  - `README.md`
  - 현재 서비스 구조, 구현 완료 기능, 추천 다음 기능, 환경변수, 빌드 스토리 개요로 전면 교체
- GitHub Pages 랜딩 개편
  - `docs/index.html`
  - 서비스형 구조 기준 메타데이터, 현재 기능, 추천 로드맵, 5단계 빌드 스토리 요약으로 재작성
- GitHub Pages SEO 보정
  - `docs/site.webmanifest`
  - `docs/sitemap.xml`
- Notion 하위페이지용 초안 작성
  - `docs/BUILD_STORY_STEPS.md`
  - Step 1~5 제목, 검색 유입 키워드, 문제, 구현 이유, 기능 확인, 다음 단계 구조 정리
- 투자 삭제 버튼 깨진 문자 수정
  - `web/app.js`
  - 투자 / 거래 / 자산 삭제 버튼을 휴지통 아이콘으로 교체

### Verification
- `node --check web/app.js` 통과
- `node scripts/build-web.mjs` 통과

### Results
- README와 GitHub Pages가 기존 로컬 FastAPI/SQLite 소개에서 현재 Supabase + Vercel 서비스 구조 설명으로 전환됨
- 현재 기능과 추천 다음 기능이 같은 메시지로 정리됨
- Notion용 5단계 스토리 초안이 로컬에 준비됨
- 투자 관리 열 삭제 버튼이 `🗑` 아이콘으로 교체됨

### Notion Blocker
- 주신 API 토큰으로 부모 페이지 조회를 시도했지만 Notion API가 아래 오류를 반환함
  - `object_not_found`
  - `Could not find page with ID ... Make sure the relevant pages and databases are shared with your integration "donggri".`
- 즉, 부모 페이지를 Integration `donggri`에 공유해야 하위페이지 생성이 가능함

### Git
- Feature commit:
  - `4d110b5a8031ab67a1f37431c8e18c218835e32f`
  - `docs: refresh product docs and pages for service rollout`
- Changed files:
  - `README.md`
  - `docs/index.html`
  - `docs/site.webmanifest`
  - `docs/sitemap.xml`
  - `docs/BUILD_STORY_STEPS.md`
  - `web/app.js`
  - `docs/SESSION_LOG.md`

### Remaining Issues
- Notion 부모 페이지를 Integration `donggri`에 공유해야 Step 1~5 하위페이지 생성 가능
- `refresh-market-prices` Edge Function 재배포 후 실제 시세 새로고침 확인 필요

## 2026-03-15 22:18 (Asia/Seoul)

### User Requests
- Notion 부모 페이지 공유를 다시 했으니 Step 1~5 하위페이지를 자동 생성해달라고 요청

### Changes Applied
- Notion API 접근 재확인
  - 사용자 제공 토큰으로 `GET /v1/pages/32461b8ed53c8008bbfffe194db4bf5e` 재시도
  - MCP `notion-fetch`도 별도로 시도했으나 세션 인증이 없어 사용 불가 확인

### Results
- Notion Public API가 여전히 아래 오류를 반환함
  - `object_not_found`
  - `Could not find page with ID ... Make sure the relevant pages and databases are shared with your integration "donggri".`
- 즉 편집 권한을 사람/링크에 준 것과 별개로, 부모 페이지를 Integration `donggri`의 `Connections`에 직접 추가해야 자동 생성 가능

### Git
- Changed files:
  - `docs/SESSION_LOG.md`

### Remaining Issues
- Notion 부모 페이지 `32461b8ed53c8008bbfffe194db4bf5e`를 Integration `donggri`에 직접 연결해야 함
- 연결 후 Step 1~5 하위페이지 자동 생성 재시도 필요

## 2026-03-15 22:24 (Asia/Seoul)

### User Requests
- Notion 연결을 다시 했으니 Step 1~5 하위페이지를 자동으로 생성해달라고 재요청

### Changes Applied
- Notion API 접근 재확인
  - 부모 페이지 `32461b8ed53c8008bbfffe194db4bf5e` 조회 성공 확인
- Notion 하위페이지 자동 생성
  - 부모 페이지 아래에 Step 1~5 페이지 생성
  - 각 페이지에 `추천 제목`, `검색 유입 키워드`, `문제`, `왜 이렇게 구현했는가`, `구현 포인트`, `기능 확인`, `다음 단계` 구조의 본문 추가
- 테스트용 임시 페이지 정리
  - `API Test Child`
  - `Step 1 Test`
  - 두 페이지는 archive 처리

### Results
- 아래 5개 하위페이지 생성 완료
  - `Step 1. 로컬 FastAPI + SQLite로 개인 가계부 MVP 만들기`
  - `Step 2. 카드 결제예정, 고정지출, 투자까지 붙여 실사용 가계부로 넓히기`
  - `Step 3. GitHub Pages 랜딩과 SEO 구조로 프로젝트 설명력을 높이기`
  - `Step 4. Supabase + Vercel로 서비스형 구조로 전환하기`
  - `Step 5. 아이디 인증, 보안질문 복구, 실시간 시세 안정화까지 마무리하기`

### Git
- Changed files:
  - `docs/SESSION_LOG.md`

### Remaining Issues
- `refresh-market-prices` Edge Function 재배포 후 실제 시세 새로고침 확인 필요

## 2026-03-15 22:54 (Asia/Seoul)

### User Requests
- `README.md`를 더 고도화하고 현재 실제 앱 주소도 함께 반영
- `명세서.md`에 정리한 핵심 내용을 README에도 필요한 만큼 녹여 넣기

### Changes Applied
- `README.md` 전면 재작성
  - 실제 서비스 주소(`https://donggri-gagyeobu.vercel.app/`) 추가
  - GitHub Pages / Repository 링크를 상단 Quick Links로 재정리
  - 현재 운영 구조, 핵심 기능, 주요 화면, 아키텍처, 현재 상태, 문제점, 다음 작업, 저장소 구조를 제품 문서형으로 재구성
  - Notion 중심의 운영용 링크는 제거하고 서비스/코드 중심 정보만 유지
  - `명세서.md`에 적은 현재 문제점과 추천 기능 일부를 README에 맞게 요약 반영

### Verification
- `https://donggri-gagyeobu.vercel.app/` 응답 확인 (`200`)

### Results
- README가 단순 기능 목록이 아니라 실제 서비스 소개 문서 형태로 정리됨
- 저장소 첫 화면에서 앱 주소, 현재 구조, 기능, 운영 상태를 바로 파악할 수 있게 됨

### Git
- Changed files:
  - `README.md`
  - `docs/SESSION_LOG.md`

### Remaining Issues
- `refresh-market-prices` Edge Function 재배포 후 실제 시세 새로고침 검증이 한 번 더 필요

## 2026-03-15 23:45 (Asia/Seoul)

### User Requests
- 투자 탭에서 `실시간 가격 새로고침 요청 실패`가 뜨는 문제 해결

### Changes Applied
- `web/app.js`
  - 공통 `invokeEdgeFunction()` 응답 처리 보강
  - Edge Function 응답에 `ok` 필드가 없는 구버전 성공 payload도 정상 성공으로 처리하도록 변경
  - `ok` 필드가 실제로 존재하면서 `false`일 때만 실패로 간주하도록 수정
- `supabase/functions/refresh-market-prices/index.ts`
  - 성공 응답 payload에 `ok: true` 추가
  - 회원가입/복구 함수와 동일한 응답 형태로 맞춤

### Verification
- `node --check web/app.js`
- `node scripts/build-web.mjs`

### Results
- `refresh-market-prices`가 성공 응답을 돌려도 프론트에서 실패로 오인하던 가능성을 제거
- Edge Function 응답 규격이 다른 함수들과 일관되게 정리됨

### Git
- Changed files:
  - `web/app.js`
  - `supabase/functions/refresh-market-prices/index.ts`
  - `docs/SESSION_LOG.md`

### Remaining Issues
- 실제 Supabase에 `refresh-market-prices` 함수 재배포가 필요할 수 있음
- Vercel 최신 프론트 배포 후 실제 시세 새로고침 동작 재확인 필요

## 2026-03-15 23:37 (Asia/Seoul)

### User Requests
- Donggri Ledger 관련 대화와 로그를 아카이브로 정리
- 제목은 `동그리-가계부`로 두고, 나중에 다시 꺼내볼 수 있게 보관

### Changes Applied
- 아카이브 문서 추가
  - `docs/archive/동그리-가계부.md`
  - 프로젝트 개요, 주요 주소, 확정된 방향, 핵심 구현 결과, 산출물 경로, 주요 커밋, Notion/GitHub Wiki/GitHub Pages 상태, 남은 이슈, 재시작 체크리스트를 한 문서로 정리

### Results
- Donggri Ledger 관련 흐름을 한 번에 복구할 수 있는 회수용 아카이브 문서가 생성됨
- 나중에 이 프로젝트를 다시 꺼낼 때 `docs/archive/동그리-가계부.md`만 읽어도 큰 맥락과 현재 상태를 빠르게 복원할 수 있게 됨

### Git
- Changed files:
  - `docs/archive/동그리-가계부.md`
  - `docs/SESSION_LOG.md`

### Remaining Issues
- `refresh-market-prices` Edge Function 재배포 후 실제 시세 새로고침 검증이 한 번 더 필요

## 2026-03-15 23:35 (Asia/Seoul)

### User Requests
- GitHub Pages 랜딩 페이지에도 GitHub Wiki 연결 추가

### Changes Applied
- `docs/index.html`
  - 상단 `utility-bar`에 `Wiki` 링크 추가
  - 메인 히어로 액션 버튼에 `Wiki` 링크 추가
  - 구조 설명의 `Repository` 카드 영역에 `wiki/` 문서 관리 카드 추가
  - 하단 footer에 `GitHub Wiki 바로가기` 링크 추가
  - JSON-LD `sameAs`에 GitHub Wiki와 실제 앱 주소 반영

### Verification
- `docs/index.html`에서 위키 링크 4개 위치와 `sameAs` 메타 반영 확인

### Results
- GitHub Pages 랜딩에서 저장소뿐 아니라 GitHub Wiki로도 바로 이동 가능해짐
- 제품 소개 페이지, 저장소, 위키 간 연결이 더 자연스럽게 정리됨

### Git
- Changed files:
  - `docs/index.html`
  - `docs/SESSION_LOG.md`

### Remaining Issues
- `refresh-market-prices` Edge Function 재배포 후 실제 시세 새로고침 검증이 한 번 더 필요

## 2026-03-15 23:30 (Asia/Seoul)

### User Requests
- GitHub Wiki 기능이 실제로 열렸으니, 저장소 안 `wiki/` 초안을 실제 GitHub Wiki 원격에 반영

### Changes Applied
- GitHub Wiki 원격 확인
  - `https://github.com/sheryloe/donggri_gagyeobu.wiki.git`
  - 기존에는 `repository not found`였으나 이번에는 접근 가능 상태 확인
- 실제 Wiki 원격 반영
  - 저장소 `wiki/` 문서를 위키 저장소 루트 구조에 맞게 변환
  - 내부 링크는 위키 전용 링크 형태로 정리
  - 저장소 상대경로 문서는 GitHub 본문 URL로 치환
  - 실제 위키 저장소에 `Home`, `Product-Overview`, `Feature-Guide`, `Architecture`, `Operations-and-Deployment`, `Roadmap`, `_Sidebar`, `_Footer` push
- `README.md`
  - Quick Links의 `Wiki`를 실제 GitHub Wiki 주소로 변경
  - 저장소 안 원고 위치는 `Wiki Source`로 별도 유지

### Results
- GitHub 저장소의 실제 Wiki 탭에서 Donggri Ledger 위키 문서를 바로 볼 수 있게 됨
- 저장소 내부 `wiki/` 원고와 실제 Wiki가 연결된 상태로 정리됨

### Git
- Changed files:
  - `README.md`
  - `docs/SESSION_LOG.md`
- Wiki remote commit:
  - `a738bf0` (`Add Donggri Ledger wiki pages`)

### Remaining Issues
- `refresh-market-prices` Edge Function 재배포 후 실제 시세 새로고침 검증이 한 번 더 필요

## 2026-03-15 23:25 (Asia/Seoul)

### User Requests
- Donggri Ledger에 대한 위키 문서를 GitHub 기준으로 보기 좋게 작성
- 최근 GitHub 문서 레이아웃 감각에 맞게 제품/기능/구조/운영/로드맵을 나눠서 정리

### Changes Applied
- 저장소 내 `wiki/` 문서 세트 추가
  - `wiki/Home.md`
  - `wiki/Product-Overview.md`
  - `wiki/Feature-Guide.md`
  - `wiki/Architecture.md`
  - `wiki/Operations-and-Deployment.md`
  - `wiki/Roadmap.md`
  - `wiki/_Sidebar.md`
  - `wiki/_Footer.md`
  - `wiki/README.md`
- `README.md`
  - Quick Links에 `Wiki` 링크 추가

### Notes
- 실제 GitHub Wiki 원격(`.wiki.git`)은 현재 `repository not found`로 확인되어 직접 push할 수 없는 상태
- 대신 GitHub에서 바로 읽기 좋은 위키 스타일 문서를 저장소 내부 `wiki/` 폴더로 먼저 구성

### Results
- 저장소 안에서 바로 읽을 수 있는 위키 허브와 섹션별 문서가 추가됨
- 제품 소개, 기능 안내, 기술 구조, 운영, 로드맵을 각각 분리해 보기 쉬운 형태로 정리함

### Git
- Changed files:
  - `README.md`
  - `wiki/Home.md`
  - `wiki/Product-Overview.md`
  - `wiki/Feature-Guide.md`
  - `wiki/Architecture.md`
  - `wiki/Operations-and-Deployment.md`
  - `wiki/Roadmap.md`
  - `wiki/_Sidebar.md`
  - `wiki/_Footer.md`
  - `wiki/README.md`
  - `docs/SESSION_LOG.md`

### Remaining Issues
- `refresh-market-prices` Edge Function 재배포 후 실제 시세 새로고침 검증이 한 번 더 필요

## 2026-03-15 23:23 (Asia/Seoul)

### User Requests
- Notion Step 원고가 단순 정리문처럼 보여 SEO형 블로그 유입 구조로 다시 작성
- 필요하면 코드 샘플이나 HTML 구조 예시도 넣어달라는 요청

### Changes Applied
- `docs/BUILD_STORY_STEPS.md`
  - Step 1~5를 SEO형 블로그 초안 구조로 전면 재작성
  - 각 Step에 `메인 키워드`, `검색 의도`, `메타 제목`, `메타 설명`, `도입부`, `본문`, `코드 예시`, `체크 포인트`, `FAQ`, `마무리` 섹션 추가
  - 기존 구현 정리문 톤에서 검색 유입용 블로그 글 톤으로 전환
- Notion Step 1~5 재업데이트
  - 새 원고 기준으로 각 페이지 본문 전체 교체
  - 코드 예시는 Notion `code` 블록으로 입력되도록 반영

### Verification
- Notion API로 Step 1, 3, 5 상단 블록 구조 재확인
  - `메인 키워드`
  - `검색 의도`
  - `메타 제목`
  - `메타 설명`
- Step 3 페이지에서 `html` 코드 블록 존재 확인

### Results
- Notion Step 페이지들이 개발 일지형이 아니라 SEO형 블로그 초안 구조로 다시 정리됨
- 코드 예시와 HTML 메타 구조 샘플까지 포함된 상태로 저장됨

### Git
- Changed files:
  - `docs/BUILD_STORY_STEPS.md`
  - `docs/SESSION_LOG.md`

### Remaining Issues
- `refresh-market-prices` Edge Function 재배포 후 실제 시세 새로고침 검증이 한 번 더 필요

## 2026-03-15 23:17 (Asia/Seoul)

### User Requests
- Notion Step 1~5 페이지를 다시 작성
- 각 Step마다 약 1000~1500자 분량으로 늘리고, 예시와 실제 구현 맥락이 보이도록 장문형으로 재구성

### Changes Applied
- `docs/BUILD_STORY_STEPS.md`
  - Step 1~5 원고를 전면 재작성
  - 각 Step을 `문제 -> 왜 이렇게 구현했는가 -> 구현 포인트 -> 예시 -> 기능 확인 -> 다음 단계` 흐름으로 장문화
  - 개요 메모 수준에서 실제 블로그 초안 수준으로 확장
- Notion 페이지 업데이트
  - 사용자 제공 Notion API 토큰으로 Step 1~5 페이지 본문 전체 교체
  - 기존 본문을 비우고 새 원고 기준으로 다시 입력

### Verification
- 초안 분량 확인
  - Step 1: 1318자
  - Step 2: 1282자
  - Step 3: 1250자
  - Step 4: 1316자
  - Step 5: 1217자
- Notion API 재조회로 제목과 상단 블록 확인
  - Step 1~5 모두 새 제목 반영 확인
  - 상단 `추천 제목`, `검색 유입 키워드` 블록 정상 확인

### Results
- Notion Step 1~5 페이지가 짧은 메모형이 아니라 발행 가능한 장문 초안 형태로 다시 정리됨
- 각 Step이 1000~1500자 범위 안에서 실제 구현 이유와 예시를 포함하도록 정돈됨

### Git
- Changed files:
  - `docs/BUILD_STORY_STEPS.md`
  - `docs/SESSION_LOG.md`

### Remaining Issues
- `refresh-market-prices` Edge Function 재배포 후 실제 시세 새로고침 검증이 한 번 더 필요

## 2026-03-15 23:12 (Asia/Seoul)

### User Requests
- Notion Step 페이지들에 깨진 한글이 보이지 않도록 UTF-8 기준으로 다시 정리

### Changes Applied
- 사용자 제공 Notion API 토큰으로 직접 페이지 접근 확인
- 기존 Step 1~5 페이지 제목과 본문을 `docs/BUILD_STORY_STEPS.md` 기준으로 다시 반영
- Step 1, Step 3, Step 5 본문 일부를 다시 조회해 한글이 정상적으로 저장되었는지 확인

### Verification
- Notion API로 각 Step 페이지 제목 확인
- Notion API로 Step 1 / Step 3 / Step 5 상단 블록 내용 확인
  - `추천 제목`
  - `검색 유입 키워드`
  - `글 구조`
  - 한글 본문 문자열 정상 반환 확인

### Results
- Notion 하위 Step 페이지들이 UTF-8 한글 기준으로 다시 정리됨
- 기존 `??`, 깨진 문자, 인코딩 문제로 보이던 본문을 정상 한글 텍스트로 복원

### Git
- Changed files:
  - `docs/SESSION_LOG.md`

### Remaining Issues
- `refresh-market-prices` Edge Function 재배포 후 실제 시세 새로고침 검증이 한 번 더 필요

## 2026-03-15 22:58 (Asia/Seoul)

### User Requests
- `README.md`의 `Local Build` 설명이 너무 허술하니, 비개발자도 바로 따라 할 수 있게 더 자세히 보강

### Changes Applied
- `README.md`
  - `Local Build` 섹션 전면 보강
  - 준비물, 프로젝트 폴더 여는 법, `npm install`, Supabase 값 준비, PowerShell 환경변수 입력, 빌드 실행, `dist` 결과 확인, 로컬 미리보기, 자주 막히는 문제까지 단계형으로 재작성
  - 단순 명령 나열 대신 “왜 이 단계를 하는지”와 “어디서 막히는지”를 함께 설명

### Results
- 비개발자 기준에서도 로컬 빌드 흐름을 따라가며 `dist/` 생성과 로컬 미리보기를 할 수 있는 README가 됨

### Git
- Changed files:
  - `README.md`
  - `docs/SESSION_LOG.md`

### Remaining Issues
- `refresh-market-prices` Edge Function 재배포 후 실제 시세 새로고침 검증이 한 번 더 필요

## 2026-03-15 22:51 (Asia/Seoul)

### User Requests
- 지금까지 수행한 작업과 기능을 정리한 `명세서.md` 문서를 새로 만들고 커밋/푸시
- 실제 가계부 화면 상단에 GitHub 레포지토리 링크를 노출

### Changes Applied
- 프로젝트 운영 문서 추가
  - `명세서.md`
  - 현재 운영 구조, 구현 기능, 수행한 주요 업무, 현재 문제점, 보완할 점, 추가하면 좋은 기능, 주요 파일 경로를 정리
- 앱 헤더에 GitHub 레포지토리 버튼 추가
  - `web/index.html`
  - 사용자 배지/로그아웃/백업/복원 액션 옆에 `GitHub 레포` 링크 배치
  - 앵커를 버튼처럼 보이도록 `a.btn-main` 스타일 보강

### Verification
- `node scripts/build-web.mjs`

### Results
- 저장소 루트에서 바로 확인 가능한 운영 명세 문서가 추가됨
- 실제 가계부 화면에서 GitHub 레포지토리로 바로 이동 가능해짐

### Git
- Changed files:
  - `명세서.md`
  - `web/index.html`
  - `docs/SESSION_LOG.md`
- Main change commit:
  - `f66205d` (`docs: add project specification and repository link`)

### Remaining Issues
- `refresh-market-prices` Edge Function 재배포 후 실제 시세 새로고침 검증이 한 번 더 필요

## 2026-03-15 23:18 (Asia/Seoul)

### User Requests
- GitHub Pages에서 강조해야 할 포인트가 다 같은 크기와 무게로 보여서, 핵심 요소가 눈에 띄게 위계를 더 주도록 수정 요청

### Changes Applied
- 강조 타이포 추가
  - `docs/index.html`
  - 검색 밴드 핵심 키워드와 메인 헤드라인 일부 단어에 강조 색상 span 추가
- 강조 카드 추가
  - `docs/index.html`
  - 메트릭 카드 2개와 대표 기능 카드 3개를 강조형 클래스로 분리
- 강조 스타일 추가
  - `docs/styles.css`
  - `.tone-accent`, `.metric-card.highlight`, `.module-card.featured` 추가
  - 핵심 키워드와 대표 카드가 기본 카드보다 한 단계 더 먼저 보이도록 배경/테두리/텍스트 색상 차등 부여

### Results
- 검색 밴드, 메인 헤드라인, 메트릭 카드, 주요 기능 카드에 시선이 먼저 가도록 강조 위계가 보강됨
- 같은 크기/같은 무게로 보이던 포털형 페이지의 시각적 우선순위가 더 분명해짐

### Git
- Changed files:
  - `docs/index.html`
  - `docs/styles.css`
  - `docs/SESSION_LOG.md`

### Remaining Issues
- `refresh-market-prices` Edge Function 재배포 후 실제 시세 새로고침 확인 필요

## 2026-03-15 23:12 (Asia/Seoul)

### User Requests
- GitHub Pages 포털형 레이아웃은 유지하되, 16:9 화면에서 글씨가 너무 커서 여러 줄로 과하게 꺾이는 문제를 줄여달라고 요청

### Changes Applied
- GitHub Pages 타이포 스케일 조정
  - `docs/index.html`
  - 검색 밴드 핵심 문구를 더 짧게 압축
  - 메인 헤드라인 강제 줄바꿈 제거
- GitHub Pages 밀도 조정
  - `docs/styles.css`
  - 전체 최대 폭 확대
  - 상단 액션, 검색 밴드, 빠른 링크, 리드 헤드라인, 모듈 카드, 구조 카드, 로드맵 카드, FAQ, 푸터의 글자 크기와 패딩 축소
  - 16:9 화면에서 카드 높이와 줄 수가 과하게 늘어나지 않도록 line-height와 max-width 보정

### Results
- 포털형 레이아웃은 유지하면서도 메인 텍스트와 카드 텍스트가 덜 부풀어 보이도록 조정됨
- 검색 밴드와 메인 헤드라인의 줄바꿈 밀도가 낮아짐

### Git
- Changed files:
  - `docs/index.html`
  - `docs/styles.css`
  - `docs/SESSION_LOG.md`

### Remaining Issues
- `refresh-market-prices` Edge Function 재배포 후 실제 시세 새로고침 확인 필요

## 2026-03-15 23:03 (Asia/Seoul)

### User Requests
- GitHub Pages가 여전히 박스 나열형이라 정렬감이 없다고 피드백
- 한글 문서처럼 글을 길게 써내려가는 방식이 아니라, 네이버 같은 포털형 화면 구성으로 다시 만들어달라고 요청

### Changes Applied
- GitHub Pages 랜딩 구조를 포털형 레이아웃으로 재설계
  - `docs/index.html`
  - 상단 유틸리티 바, 검색 밴드형 서비스 요약, 메인 리드 패널, 우측 정보 보드, 기능 모듈 그리드, 대형 화면 섹션, 구조 보드로 재구성
- GitHub Pages 스타일 전면 교체
  - `docs/styles.css`
  - 네이버식 포털 화면을 참고한 정렬 중심 그리드, 흰 배경 카드, 녹색 포인트, 섹션 간 위계가 드러나는 구조로 재작성
  - 긴 문단보다 짧은 헤드라인/요약/모듈 카드 중심으로 압축

### Verification
- `docs/index.html`, `docs/styles.css`에서 `Notion`, `빌드 스토리`, `notion.so` 문자열 미검출 확인
- 주요 레이아웃 포인트 확인
  - `utility-bar`
  - `search-band`
  - `home-grid`
  - `module-grid`
  - `screen-layout`
  - `stack-board`

### Results
- GitHub Pages가 문서형 소개에서 포털형 랜딩 구조로 재구성됨
- 메인 화면, 기능 보드, 구조 보드가 각각 분리되어 정렬과 위계가 더 분명해짐

### Git
- Changed files:
  - `docs/index.html`
  - `docs/styles.css`
  - `docs/SESSION_LOG.md`

### Remaining Issues
- `refresh-market-prices` Edge Function 재배포 후 실제 시세 새로고침 확인 필요

## 2026-03-15 22:51 (Asia/Seoul)

### User Requests
- GitHub Pages UI가 너무 가볍고 문서처럼 보여서, 레이아웃 중심의 더 성숙한 서비스 랜딩으로 다시 만들어달라고 요청

### Changes Applied
- GitHub Pages 랜딩 레이아웃 재설계
  - `docs/index.html`
  - 히어로/상태 패널/신호 카드/다크 기능 섹션/대형 스크린샷 섹션/구조 섹션 중심으로 재구성
  - 문장 위주 설명을 줄이고 카드/블록 중심 레이아웃으로 정리
- GitHub Pages 스타일 전면 교체
  - `docs/styles.css`
  - 다크 톤 상단 바, 큰 스크린샷 스테이지, 절제된 카드 스타일, 2단/3단 그리드 중심 구성으로 재작성

### Verification
- `docs/index.html`, `docs/styles.css`에서 `Notion`, `빌드 스토리`, `notion.so` 문자열 미검출 확인

### Results
- GitHub Pages가 문서형 소개 페이지보다 제품 랜딩에 가까운 레이아웃으로 재구성됨
- 작은 카드 나열 대신 전체 화면 스크린샷과 구조 카드 중심 배치로 변경됨

### Git
- Changed files:
  - `docs/index.html`
  - `docs/styles.css`
  - `docs/SESSION_LOG.md`

### Remaining Issues
- `refresh-market-prices` Edge Function 재배포 후 실제 시세 새로고침 확인 필요

## 2026-03-15 22:36 (Asia/Seoul)

### User Requests
- GitHub Pages는 Notion/빌드 스토리 언급 없이 제품과 코드 구조 중심으로 다시 구성
- 스크린샷은 작은 카드형이 아니라 더 크게, 전체 화면 위주로 보이도록 수정

### Changes Applied
- GitHub Pages 랜딩 재구성
  - `docs/index.html`
  - Notion 링크, 빌드 스토리 섹션, 관련 내비게이션 제거
  - 제품 소개, 현재 기능, 전체 화면 스크린샷, 서비스 구조, 코드 구조, 추천 로드맵, FAQ만 남기도록 재작성
- GitHub Pages 스타일 재작성
  - `docs/styles.css`
  - 영웅 섹션 아래 대형 스크린샷 배치
  - 대시보드 / 투자 화면을 전체 폭에 가깝게 크게 보여주는 패널 구조로 교체
  - 서비스/코드 소개 섹션 중심의 레이아웃으로 정리

### Verification
- `docs/index.html`, `docs/styles.css`에서 `Notion`, `빌드 스토리`, `notion.so` 문자열 제거 확인

### Results
- GitHub Pages가 빌드 스토리 허브가 아니라 제품/코드 소개 페이지로 다시 정리됨
- 캡처 이미지는 작은 카드 배치 대신 큰 화면 중심 섹션으로 교체됨

### Git
- Changed files:
  - `docs/index.html`
  - `docs/styles.css`
  - `docs/SESSION_LOG.md`

### Remaining Issues
- `refresh-market-prices` Edge Function 재배포 후 실제 시세 새로고침 확인 필요
