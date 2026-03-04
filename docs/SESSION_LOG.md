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
