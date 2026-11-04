# 우진 게임

세 게임을 한 화면에서 전환하는 정적 브라우저 게임 모음이다.

- `/#grow`: 우진이 키우기. 원화 경제, 레벨 사진, 간식, 반복 과제, 반쪽 상점.
- `/#merge`: 우진 합치기. Box2D 계열 Planck의 실제 원형 강체, 첫 합체 즉시·연쇄 합체 160ms 간격.
- `/#adventure`: 우진의 모험. 5개 테마 스테이지, 원본 얼굴을 사용한 주인공, 수집·적·체크포인트·이동 발판.

각 화면은 한 번 로드한 뒤 유지한다. 프레임끼리 동일 출처 메시지로 활성 상태를 전달해 합치기·모험을 잠시 멈추거나 이어간다. 로컬 저장 키를 게임별로 분리한다. 키우기는 다른 게임을 하는 동안에도 자동 수익을 받을 수 있다.

## 로컬 실행과 검사

```sh
python -m http.server 8765 --directory dist
```

Playwright와 Chromium이 있는 환경에서 다음 검사를 실행한다. `CHROMIUM_PATH`로 Chromium 경로를 지정할 수 있는 검사도 있다.

```sh
node tests/browser.cjs
node tests/merge.cjs
node tests/merge-physics.cjs
node tests/merge-regressions.cjs
node tests/quality.cjs
node tests/adventure.cjs
python tests/economy.py
```

물리 엔진 라이선스는 `dist/vendor`에 포함했다. 테스트 전용 API는 localhost에서만 설치된다. 아트는 이 프로젝트용으로 생성한 배경이며, 우진이 얼굴은 업로드된 원본 사진을 사용한다. 새 모험의 개인별 해금 진행도와 전체 빛 조각은 로컬 저장한다. 스테이지 내부 체크포인트는 현재 판에 적용된다.
