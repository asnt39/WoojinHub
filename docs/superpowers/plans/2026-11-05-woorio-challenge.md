# 우리오 도전형 스테이지 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 즉사 가시, 사망 연출, 높은 난이도의 새 세계, 정밀 모바일 조작을 우리오에 추가한다.

**Architecture:** 기존 `dist/adventure.js`의 레벨 생성과 게임 루프에 사망 상태 기계·동적 장애물을 더한다. `dist/pixel-art.js`는 우진 스프라이트, `dist/adventure.html`과 `dist/arcade-ui.css`는 우리오 UI만 담당한다.

**Tech Stack:** 순수 JavaScript, Canvas 2D, CSS, Node VM 기반 테스트.

**Spec:** `docs/superpowers/specs/2026-11-05-woorio-challenge-design.md`

## Global Constraints

- `woojin-adventure-v1` 저장 키 보존, 기존 5개 순서 유지, 기존 게임 3종 변경 금지.
- 모든 새 플레이 규칙에는 실패를 확인한 회귀 테스트를 먼저 작성한다.
- 공개 Sites 대상과 접근 설정 유지.

## Review Focus

- 가시와 무적/거대화 중 충돌은 사망 상태로 진입해야 한다.
- 사망 중 반복 충돌로 사망 횟수가 증가하지 않아야 한다.
- 재시작은 저장된 체크포인트를 이용하며 키가 눌린 채 남지 않아야 한다.
- 새 스테이지 번호는 5 이상이며 시작/골인 경로가 적어도 기하학적으로 가능해야 한다.
- 여러 손가락으로 이동/점프/불꽃을 함께 눌러도 해제가 꼬이지 않아야 한다.

### Task 1: 사망과 재시작

**Files:** `dist/adventure.js`, `dist/adventure.html`, `tests/adventure-v20.cjs`

- [ ] 테스트: 가시 즉사, 무적 시 즉사, 사망 중 중복 방지, 화면 전환 후 체크포인트 복귀.
- [ ] 테스트 실패 확인.
- [ ] 상태별 점프 사망 애니메이션과 짧은 전환 화면 구현.
- [ ] 테스트 재실행.

### Task 2: 추가 맵·아이템·캐릭터

**Files:** `dist/adventure.js`, `dist/pixel-art.js`, `tests/adventure-v20.cjs`

- [ ] 테스트: 8개 맵, 새로운 정밀 장애물과 등반 요소, 골인 전 아이템 상자 배제, 신규 스테이지 해금.
- [ ] 테스트 실패 확인.
- [ ] 난이도 높은 후반 3개 세계와 픽셀 아이템/우진/두부를 구현.
- [ ] 테스트 재실행.

### Task 3: 입력·UI·성능

**Files:** `dist/adventure.js`, `dist/adventure.html`, `dist/arcade-ui.css`, `tests/adventure-v20.cjs`

- [ ] 테스트: 점프 입력 버퍼, 불필요한 알림 제거, 터치 포인터 상태.
- [ ] 테스트 실패 확인.
- [ ] 터치·컨트롤 개선과 게임 화면 픽셀 스타일 구현.
- [ ] 전체 테스트, 공개 브라우저 확인, Git 커밋·Sites 공개 배포.
