# donggri_gagyeobu

FastAPI와 SQLite 기반으로 동작하는 개인용 가계부이며, 실행 후 브라우저에서 바로 사용하는 구조입니다.

- Repository: https://github.com/sheryloe/donggri_gagyeobu
- Landing page: https://sheryloe.github.io/donggri_gagyeobu/
- Audience: 로컬 저장, 개인 예산 관리, 자산 추적, 투자 메모를 한곳에서 쓰고 싶은 사용자

## Search Summary
로컬 PC에서 실행하는 개인 가계부 및 자산 관리 웹앱

## Problem This Repo Solves
개인 재무 관리 도구가 클라우드 전제이거나 과한 기능 중심이면, 단순하고 빠른 로컬 관리가 오히려 어려워집니다.

## Key Features
- 브라우저 기반 UI와 로컬 SQLite 저장
- Python 런처로 로컬 주소와 LAN 주소를 함께 안내
- 개인 가계부, 예산, 자산/투자 관리 흐름을 단일 웹앱에 통합
- Windows EXE 패키징을 염두에 둔 실행 구조

## User Flow
- 의존성 설치
- 런처 실행 후 브라우저 접속
- 지출/수입/예산/자산을 로컬 DB에 기록

## Tech Stack
- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- SQLite

## Quick Start
- `py -m pip install -r requirements.txt`로 의존성을 설치합니다.
- `py launcher.py`를 실행한 뒤 `http://127.0.0.1:8000/ui/`로 접속합니다.
- 데이터는 기본적으로 로컬 SQLite 경로에 저장됩니다.

## Repository Structure
- `app/`: FastAPI 서버 소스
- `web/`: 브라우저 UI 자산
- `scripts/`, `docs/`: 운영 보조와 문서

## Search Keywords
`personal finance web app`, `local budget tracker`, `fastapi ledger app`, `가계부 웹앱`, `로컬 자산 관리`

## FAQ
### Donggri Ledger는 클라우드 서비스인가요?
아니요. 기본 가계부 기능은 로컬 PC에서 실행되고 로컬 DB에 저장됩니다.

### 어떻게 실행하나요?
Python 환경에서 의존성 설치 후 `launcher.py`를 실행하면 됩니다.

### 투자 시세까지 완전 오프라인인가요?
기본 가계부 기능은 로컬 중심이지만 시세 새로고침처럼 일부 기능은 인터넷이 필요할 수 있습니다.
