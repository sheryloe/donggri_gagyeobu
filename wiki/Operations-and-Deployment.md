# Operations and Deployment

## Service URLs

- App: https://donggri-gagyeobu.vercel.app/
- GitHub Pages: https://sheryloe.github.io/donggri_gagyeobu/
- Repository: https://github.com/sheryloe/donggri_gagyeobu

## Local Build

로컬 빌드는 아래 순서로 진행합니다.

1. 저장소를 내려받기
2. 프로젝트 폴더 열기
3. `npm install`
4. 환경변수 준비
5. `npm run build`
6. `dist/` 결과 확인
7. 필요 시 `npx serve dist`로 로컬 미리보기

자세한 설명은 저장소 [`README.md`](../README.md)의 `Local Build` 섹션을 참고합니다.

## Required Environment Variables

```text
SUPABASE_URL
SUPABASE_ANON_KEY
APP_NAME
```

주의:

- `SUPABASE_SERVICE_ROLE_KEY`는 브라우저 환경변수에 넣지 않습니다.
- 회원가입 / 비밀번호 찾기용 Edge Function은 로그인 전 호출되므로 JWT 설정을 별도로 확인합니다.

## Daily Operations

자주 하는 운영 작업은 아래와 같습니다.

- Supabase SQL 재적용
- Edge Function 재배포
- Vercel 재배포
- GitHub Pages 문구/레이아웃 정리
- README / 위키 / 명세서 / 세션 로그 업데이트

## Known Operational Checks

배포 후 우선 확인할 항목:

- 회원가입
- 로그인
- 보안질문 기반 비밀번호 찾기
- 거래 입력
- 카드 결제예정 계산
- 투자 시세 새로고침
- 백업 / 복원

## Current Operational Issue

현재 가장 눈에 띄는 운영 체크 포인트는 아래입니다.

- `refresh-market-prices` Edge Function 재배포 후 실제 시세 새로고침 검증이 한 번 더 필요

## Documentation Sources

운영 기준 문서는 아래 순서로 보는 것이 좋습니다.

1. [`README.md`](../README.md)
2. [`명세서.md`](../명세서.md)
3. [`docs/SESSION_LOG.md`](../docs/SESSION_LOG.md)

## Related Pages

- [Architecture](./Architecture.md)
- [Roadmap](./Roadmap.md)
