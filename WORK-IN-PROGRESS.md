# 2026-11-04 작업 저장 지점

사용자가 사용량 부족으로 즉시 저장을 요청하여 추가 구현/테스트를 중단했다. 공개 배포는 하지 않았다.

구현: 합치기 질량을 반지름 제곱에 비례하도록 조정, 반발력/충격 완화, 보석 테두리. 키우기 크림/민트 UI와 음식 일러스트, 상단 보유금액. 모험 픽셀 배경/캐릭터/4종 몬스터, 사방 벽돌 충돌, 상자와 거대화/불꽃탄/말티즈, 긴 5개 맵.

검증: merge, merge-physics, merge-regressions, browser, quality, v14 테스트 통과. adventure-geometry는 다섯 맵 지형 통과 확인. 최신 전체 adventure.cjs 자동 플레이는 1,2,4,5 스테이지 통과, 3 스테이지 실패. 3 스테이지에서 적을 밟은 뒤 낭떠러지 접근/점프 타이밍 추가 조사 필요. 완료나 전체 테스트 통과로 간주하지 말 것. adventure-diagnostic.cjs는 임시 진단용으로 의도적 실패를 포함한다.

새 이미지 원본은 /workspace/generated_images에 있고 사용본은 dist/art/pixel-worlds.png, snack-picnic.png. 새 스프라이트는 dist/pixel-art.js. 기존 공개 버전은 13이며 이번 변경은 아직 공개하지 않았다.
