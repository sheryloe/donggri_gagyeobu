# donggri_gagyeobu

가계부 프로그램 소스와, Notion/Tistory 정리용 5단계 문서를 함께 관리하는 저장소입니다.

## Repository 구성
- `app/`: FastAPI + SQLAlchemy 백엔드
- `web/`: 가계부 프론트엔드(단일 HTML 기반)
- `docs/`: 실행/배포 문서
- `scripts/`: 자동화 스크립트
- `launcher.py`: 앱 실행 진입점(기본 포트 8888)
- `donggri-ledger.spec`: PyInstaller 빌드 스펙(출력 이름 `donggri_gagyeobu`)

## Step 1. 세팅 과정
- Python 가상환경/패키지 설치
- `requirements.txt` 기반 FastAPI, SQLAlchemy, Uvicorn 구성
- 로컬 실행 경로와 EXE 배포 경로를 분리해 데이터 손실 방지

## Step 2. 설계 과정
- 도메인 모델: Asset, Transaction, FixedExpense, Investment
- 핵심 계산 정책:
  - 최종 잔액 = 현금성 자산 합계 - 미지출 고정비
  - 투자 손익/수익률 = (평가금 - 원금) / 원금
- 펀드는 실시간 시세 제외, 수동 업데이트 정책 적용

## Step 3. 구현 과정
- 가계부 입력/수정/삭제 + 월별 조회
- 자산 유형(은행/현금/카드/투자계좌)별 시각화
- 투자 포트폴리오(수량, 평균매수가, 현재가, 수익률)
- 주식/코인/ETF 실시간 가격 갱신 API 연동

## Step 4. 검증/배포 과정
- API/프론트 문법 체크 및 실행 확인
- PyInstaller로 EXE 패키징
- 포트 충돌 시 포트 변경 정책 적용(현재 8888)
- DB는 EXE 내부가 아닌 영구 경로(LocalAppData) 보관

## Step 5. Notion + Tistory 정리 과정
### Notion 페이지 템플릿
- 제목: `donggri_gagyeobu 개발 로그`
- 섹션: 문제 정의 / 설계 결정 / 구현 / 트러블슈팅 / 회고
- 속성: 날짜, 작업유형, 커밋 해시, 결과

### Tistory 포스팅 구조
1. 왜 만들었는지
2. 기술 선택 이유
3. 핵심 구현 포인트
4. 문제 해결 사례
5. 다음 개선 계획

## 실행
```powershell
python launcher.py
```

브라우저:
- `http://127.0.0.1:8888/ui/`

## 빌드
```powershell
py -3 -m PyInstaller --noconfirm donggri-ledger.spec
```
