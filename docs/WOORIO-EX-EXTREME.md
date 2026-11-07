# Woorio EX 극한 난이도 개편

## 상태 / 기준

구현 및 국소·브라우저 검증 완료. **전체 EX 연속 완주는 미검증이며, 완전한 클리어 가능성 검증 완료로 보고하지 않는다.** 공개 사이트 배포 안 함.

- 브랜치: `feat/woorio-ex-extreme`
- 기준: `fix/woorio-small-pickups`의 `71736e6` (제품 코드 `08336a2`, 공개 사이트 v41). `feat/woorio-major-patch` 및 이후 compact-pickup/모션 수정 포함. 오래된 main으로 되돌리지 않음.
- 첫 원격 체크포인트: `5b2e2d1` (EX 생성·클리어 기반 해금·UI). 최종 커밋은 이 문서를 포함한 브랜치 HEAD에서 확인.
- 일반 1–9 생성 결과는 기준 소스와 JSON 전체 비교에서 **9/9 동일**. 보스 디자인/패턴, GTW, Merge, 키우기 파일 변경 없음.

## 변경된 EX

| 항목 | 이전 EX | 개편 EX |
|---|---:|---:|
| 몬스터 | 23 | 58 |
| 톱날 | 4 | 11 |
| 가시/주기 위험장치 | 8 | 18 |
| 낭떠러지 | 8 | 12 |
| 붕괴 발판 | 12 | 25 |
| 컨베이어 | 2 | 8 |
| 시간문 | 6 | 4 |
| 럭키박스 | 5 | **0** |
| 전체 길이 | 9055 | 9528 |

`dist/woorio-extreme.js`는 EX 전용 데이터 생성기다. 아이템·보스 보급을 생성하지 않으며 `grant()`와 상자 충돌에도 EX 차단 조건이 있다. 이동/점프/피격 물리와 일반 능력의 수치는 변경하지 않았다. 필드 아이템이 남는 경우 EX tick에서 제거한다.

6종의 몬스터: 접근 가속형, 2회 밟기형, 공중 왕복형, 조준 마법사, 강하 박쥐, 감시 포탑. 구역마다 지상 적/공중 적 조합을 바꾸고 후반에 근접 적을 추가한다. EX 마법사도 발사 전 `!` 경고를 표시한다. 원거리 투사체는 기존 지형 충돌과 발사 간격을 유지한다.

| 구역 | 주요 압박 |
|---|---|
| 1 격돌 | 시작 직후 근접 적, 두 원거리 적, 상하 위험을 겹쳐 배치. 쉬운 준비 구역 없음 |
| 2 공중 교차 | 승강 발판과 공중 행동 조합 변경, 상승하는 지면 |
| 3 붕괴 회랑 | 내부 낭떠러지 + 이동/붕괴 발판 + 시간문 |
| 4 역류 | 두 컨베이어, 더 높은 기둥, 마법사 교차 사격 |
| 5 압착 | 104px 기둥, 내부 낭떠러지, 중간 체크포인트 후 곧바로 재진입 |
| 6 시간문 | 추가 근접 적, 120px 기둥, 바닥 스위치와 컨베이어 |
| 7 교차 포화 | 내부 낭떠러지와 추가 상단 톱날, 근접/공중 동시 압박 |
| 8 마지막 상승 | 130px 기둥, 승강/붕괴 발판, 시간문 |
| 9 종결 난전 | 134px 기둥, 내부 낭떠러지, 역류 컨베이어, 추가 톱날과 시간문, 출구 직전 포탑 |

붕괴 발판은 착지 후 0.32초에 무너진다. 시간문은 마지막 스위치 접촉부터 1.35초 동안 열린다. 플레이어와 겹친 문은 닫히지 않는 기존 안전 처리를 유지한다. 천장 우회로는 문으로 차단하지만 출구는 실제 이동 한계 안에 둔다.

검사 중 발견·해결한 문제: 승강 발판과 톱날의 이동 범위 중첩, 내부 구멍 위 스위치, 스위치 대기 위치와 톱날 범위 중첩, 플레이어 X clamp보다 바깥인 최종 출구. 해당 조건을 회귀 테스트에 추가했다.

## EX 해금 / 저장 / 랭킹

- 기존 `woojin-adventure-v1`의 `unlocked`, `total`을 유지하고 `clearedStages: boolean[9]`만 추가. 정상 일반 스테이지 종료 시 해당 인덱스를 true로 기록한다.
- `unlocked:8`만으로는 EX가 열리지 않는다. 이는 9스테이지 **접근 가능** 상태이지 9개 클리어의 증거가 아니다.
- 유효한 기존 9연속 완주 결과(`woorio-last-finish-v1`, eligible=true) 또는 완주 개인 랭킹은 9개 클리어로 인정한다.
- 진행 중 `woorio-ranked-run-v1`은 next **이전**의 스테이지만 인정한다. next=8이면 8/9이며 EX 잠금 유지. malformed JSON/숫자/이름/flags 객체는 검증하고, 알 수 없는 과거 클리어를 임의 추정하지 않는다.
- 메인 시작 버튼을 먼저·크게 배치하고 EX 버튼을 작은 보조 버튼으로 낮췄다. EX 잠금 버튼에 클리어 수를 표시한다.
- 버튼뿐 아니라 `start(...,true)`에서도 검사. 거절 시 현재 도전이나 저장 데이터를 변경하지 않는다.
- EX 시작/사망/클리어는 일반 도전의 run/result/board를 변경하지 않는다. EX 사망은 이번 EX 도전에서 별도 집계하며 일반 9스테이지 랭킹에 포함하지 않는다.

## 실제 실행한 검증

서버: `python -m http.server 8765 --directory dist`. Node 테스트는 저장소 루트에서 실행. Playwright는 설치된 `/usr/bin/chromium`을 사용.

### 통과

- `node --check dist/adventure.js`
- `node tests/woorio-ex-progress.cjs`: 개별 클리어·구형 완주/랭킹/진행 기록 마이그레이션, 해금 숫자만 있는 저장 거절, 잘못된 저장/차단된 localStorage.
- `node tests/woorio-ex-geometry.cjs`: 상자·아이템 0개, 적 58마리, 순찰/비행/발판/톱날 전체 이동 범위, 별·가시와 고체 중첩, 시작·체크포인트의 지지 바닥, 스위치 바닥 및 톱날 회피, 출구 clamp.
- `node tests/woorio-ex-physics.cjs`: **적·위험 장치를 삭제하지 않은** 국소 실제 key/tick 물리. 12/12 낭떠러지, 4/4 시간문, 18/18 기둥 착지, 붕괴 발판 시간, EX 아이템 부여 거절. 각 시도 시작은 해당 구간의 실제 발판으로 위치를 설정한 **fixture**다. 전체 연속 완주가 아니다. `docs/woorio-ex/local-physics.json`에 입력/도약 위치 기록.
- `node tests/woorio-ex-normal-regression.cjs`: 기준 커밋의 일반 맵 생성 결과와 9/9 완전 일치, EX 전후 개수 비교.
- `node tests/woorio-ex-browser.cjs`: 1280×800 / 390×844 / 844×390. 잠금 API·UI, 일반 최종 종료 fixture에 의한 해금과 저장/새로고침, 키보드 실제 입력, Chromium CDP 실제 2점 터치/해제, 사망 재생성·체크포인트 fixture, EX 종료 UI, 일반 진행/결과/랭킹 및 GTW 저장 sentinel 보존, 가로 넘침·콘솔 오류 없음.
- `node tests/woorio-ex-stability.cjs`: **시뮬레이션 600초**, 정지·무적 fixture와 초당 1회 렌더. 적 좌표 유한/순찰 범위 유지, 투사체 최대 2개·입자 최대 0개로 누적 없음. 실제 기기 장시간 플레이/FPS 측정이 아니다.
- 기존 회귀: `node tests/adventure-unit.cjs`, `node tests/adventure-v24.cjs`, `node tests/adventure-power-duration.cjs`, `node tests/adventure-corrosion-boss.cjs`, `node tests/woorio-major-unit.cjs`, `node tests/woorio-leaderboard.cjs`, `node tests/woorio-instant-pickup.cjs`, `node tests/woorio-item-sprites.cjs`, `node tests/ui-polish.cjs`.
- 기존 브라우저 회귀: `node tests/woorio-major-browser.cjs`, `node tests/woorio-ranking-motion-browser.cjs`, `node tests/woorio-run-shield-browser.cjs`, `node tests/woorio-item-bubbles-browser.cjs`.

브라우저의 bounded 엔진 tick/draw 비용은 `browser-metrics.json`에 저장했다. 1200 tick씩 p95 0.3–0.4ms, 최대 32.9ms outlier가 있었으며 브라우저/공유 환경 스케줄링과 GC도 포함한다. 실제 모바일 하드웨어의 60FPS 보장이 아니다.

### 실패 / 미검증

`AI_EXTREME=1 AI_STAGES=7 AI_ATTEMPTS=5 node tests/adventure-ai-playthrough.cjs > docs/woorio-ex/ai-playthrough.jsonl`

- 무편집 실제 시작점에서 key/tick만 사용하는 전체 자동 조작기는 **0/1 완주**, 5개 입력 전략 모두 실패. 실패 원인/좌표를 JSONL에 기록했다. 기존 조작기는 좁은 착지, 점프 후 감속, 연속 재점프와 시간문을 계획하지 못한다. 최선 진행은 약 11%, 첫 낭떠러지 부근.
- 국소 검사 통과는 각 구간의 통과 입력이 존재한다는 증거다. 모든 입력을 이어서 사용하면 통과한다는 증거가 아니며, 실제 전체 경로의 공정성은 추가 플레이테스트가 필요하다. AI 실패만으로 불가능한 맵이라고 단정하지 않는다.
- 실제 Samsung/iOS 기기 성능·멀티터치, 실사용자 연속 완주, 피로도/난이도 곡선, 실기기 10분 플레이는 미검증.
- 다른 게임의 전체 수동 플레이는 다시 수행하지 않았다. 관련 파일 변경 없음, UI 계약 회귀와 GTW 저장 sentinel 보존 확인만 실행했다.

## 스크린샷

`docs/woorio-ex/desktop.png` (1280×800), `mobile.png` (390×844), `landscape.png` (844×390)는 실제 로컬 브라우저의 EX 시작 구역. `*-menu-locked.png`는 잠금 메뉴. `*-final-zone-fixture.png`는 마지막 구역에 위치를 설정한 시각 검토용 fixture이며 그곳까지 플레이로 도달했다는 증거가 아니다. 실제 이미지를 열어 UI/픽셀 선명도/터치 배치를 확인했다.

신규 이미지 생성이나 외부 에셋 추가 없음. 기존 우진·몬스터·공장 배경과 픽셀 렌더러 재사용.

## 다음 작업 / 안전한 재개

1. `git status`, 이 문서와 `git log -3` 확인. 위 EX/일반 회귀 테스트 실행.
2. 첫 구역부터 브레이크·짧은 점프·재점프를 계획하는 입력 조작기를 보완하고 연속 완주 시도. 먼저 첫 구간의 가시 x330, 톱날 주변, 첫 낭떠러지 x920을 살핀다.
3. 사람의 실제 조작으로 EX 전체 경로 공정성 검증. 불가피한 피해가 발견되면 EX 데이터만 수정하고 국소/회귀 테스트 반복.
4. 실제 휴대폰 세로/가로에서 긴 플레이와 성능 측정.
5. 승인 없이 사이트에 배포하지 않는다.

되돌리기: 이 브랜치를 병합/배포하지 않고 기준 `fix/woorio-small-pickups`(`71736e6`)를 별도 worktree에서 사용하면 기존 제품 상태를 확인할 수 있다. 현재 브랜치나 사용자의 저장 데이터를 reset/삭제할 필요가 없다. 강제 푸시하지 않는다.

## 사용자 승인 후 공개 배포 — 앞선 배포 제외 지시 대체

2026-11-07 사용자가 별도로 사이트 배포를 명시적으로 요청했다.
- Sites **v42**, `succeeded`, 2026-11-07T03:22:55.882038Z (12:22 KST).
- 제품 소스: `23824026e6bbeedab282bb2b56cab509f11e0924`.
- 사이트 원격 main `08336a2`가 제품 커밋의 조상임을 확인하고 fast-forward push. 다른 변경 덮어쓰기/강제 푸시 없음.
- 정확한 커밋의 tracked `.openai/hosting.json`과 `dist/`를 archive로 저장·배포. 공개 범위 유지.
- Saved version: `appgprj_6ae9c47115308191b262fff9998049d6~appgver_3e2b5c3aa8908191a86df1ced3131a98`.
- Deployment: `appgdep_6aee998172408191a902b2c5c6ef8f83`.
- URL: https://woojingame.asnt1.chatgpt.site/#adventure
- 배포 전 EX 진행/해금·배치·일반 9맵 동일성·국소 점프/문/기둥 테스트 재실행 통과. 제품 코드는 앞선 브라우저 검증 이후 변경 없음.
- 위의 전체 연속 완주·실기기 검증 한계는 그대로 남는다. 네이티브 Sites 배포 결과로 공개 성공 확인. 이 절의 배포 기록 커밋은 문서만 변경한다.
