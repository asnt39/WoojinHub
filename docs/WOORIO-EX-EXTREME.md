# Woorio EX 극한 난이도 개편 — WIP 체크포인트

- 작업 브랜치: `feat/woorio-ex-extreme`
- 기준: `fix/woorio-small-pickups`의 `71736e6` (제품 코드 `08336a2`, 사이트 v41). `feat/woorio-major-patch` 이후 변경 포함.
- 공개 배포하지 않음. 일반 1–9 맵과 보스 패턴 및 다른 게임은 개편 대상 아님.

## 구현

- EX 생성기를 독립 모듈로 분리. 9구역, 몬스터 58마리/6종, 낭떠러지 12개, 톱날·주기 가시·이동/승강/붕괴 발판·컨베이어·1.35초 시간문 조합.
- EX 상자/아이템/보스 보급 생성 없음. 아이템 부여 및 상자 충돌 경로에도 EX 방어 조건 추가.
- 개별 `clearedStages` 9개를 기존 `woojin-adventure-v1`에 추가. 기존 unlocked/total 유지.
- 단순 unlocked=8로 EX를 열지 않음. 기존 연속 완주 결과/개인 랭킹의 유효한 기록은 9개 클리어로 인정. 진행 중인 연속 도전은 next 이전까지만 인정.
- 시작 함수에서 조건 검사. 메인 시작 버튼 우선, EX 작은 보조 버튼/잠금 수 표시.
- EX 사망은 일반 연속 도전의 저장된 사망/진행/랭킹을 변경하지 않음.

## 현재 검증

통과: `node --check dist/adventure.js`, `node tests/woorio-ex-progress.cjs`, `node tests/woorio-ex-geometry.cjs`, `node tests/adventure-unit.cjs`, `node tests/woorio-major-unit.cjs`, `node tests/woorio-leaderboard.cjs`, `node tests/woorio-instant-pickup.cjs`.

이 시점의 gap 검사는 적/위험 장치를 제외한 국소 물리 검사이며, 전체 플레이 완주 검증이 아님. 실제 적이 남은 상태의 경로·브라우저·성능·최종 화면은 다음 체크포인트에서 추가한다. 새 EX 전체 클리어 가능성이 아직 증명되지 않았음.

## 재개

`python -m http.server 8765 --directory dist`로 서버 실행. 먼저 EX 해금/API/저장 및 일반 맵 동등성 회귀 테스트를 추가하고, 국소 실제 물리 탐색과 무편집 전체 AI 시도를 구분해서 기록한다. 1280×800 / 390×844 브라우저 스크린샷을 생성한다. 검증한 단위로 커밋·푸시하고 사이트에는 배포하지 않는다.
