# GTW neighborhood activities — 2026-11-05

## Source protection and baseline
- Current branch: feat/gtw-activities, based on Sites source 795251f084c824fba7b275b10c26af69a4b21988.
- User's newer work existed ONLY in the Sites source repository, not GitHub origin.
  Read actual city.js, combat and UI handoffs before adapting. Preserved newer hub
  lazy loading, shared arcade UI, sprint toggle, E vehicle, driving attack/brake,
  civilian combat/flee behavior and Woorio v23. No old whole-file replacement.
- Earlier NPC checkpoint retained on feat/gtw-combat at 012ecb9 (pushed).
- Original combat deployed at 9b9e907. Newer user source superseded it.
- Audience was changed externally to public revision4. User explicitly selected
  "현재 공개 상태로 배포" this session. Keep current public; no access mutation.

## Implemented
- Seven pack-derived roles plus Ta eo = eight new identities. 4 directions x idle
  and two actual walking contacts for seven residents; existing Ta eo combat sheet.
  Same 40x48 cells, feet20,44; generated source and extraction metadata preserved.
- Nurse free full healing, vendor35HP food30won; explicit UI choice, money/health guards.
  Every cast member has dialogue and distinctive route/speed/rest. NPCs yield to
  combat, and newer civilian hurt/flee state takes precedence over ordinary routes.
- Three optional repeatable neighborhood jobs: vendor supplies120won, jogger loop
  150won, worker facility inspection180won. One at a time, ordered E checkpoints,
  return to NPC to report, reward once, 60s simulated cooldown for same job, cancel.
- Separate compact job HUD and mini-map target, field marker, menu instructions.
- OPTIONAL activities field in original gtw-city-v1 payload, validates incoming
  indices/counters/cooldowns; old saves default no active job. Mission/money/keys
  and backup preserved. Dialogue keyboard Enter/Space supports service action focus.
- Mobile hearts fit existing HUD; job panel clears it. Existing art/perspective
  remains unchanged, no new region or interior claimed. Busker has dialogue and
  walking, NOT a finished instrumental performance animation.

## Actual verification
- PASS city-activities-unit: order/range, exclusive task, reward once, cooldown,
  cancel, save resume, malformed state.
- PASS city-activities-browser: all three jobs via NPC choice/E/report, +450won,
  persistence, 1280x800 and390x844 captures, HUD bounds. Character positions use
  deterministic test fixtures; this is NOT a claim of human end-to-end traversal.
- PASS city-residents-unit/browser: purchases/heals, dialog freeze, 120-second
  collision-safe NPC routes, 4-direction distinct frame contacts, keyboard choice.
- PASS city-runtime: movement, swept collision, car, delivery, backup, 60000ticks.
- PASS city-combat-unit/browser: original combat + real Chromium two-finger controls.
- PASS ui-polish, adventure-unit, browser.cjs(grow), merge.cjs, quality.cjs,
  adventure-v22, adventure-ai-jump-reachability (114/114 local jump links).
- Screenshots opened: docs/gtw-combat/activities-{desktop,mobile}.png and resident
  screenshots; mobile physical hardware not tested. Performance sim != device FPS.
- Older city-stability still expects hold-Shift and3NPC; newer baseline uses toggle
  and now10NPC, so obsolete assumptions must be updated before using that suite.
- Full Woorio combat AI playthrough not run in this change. Existing v23 limits
  remain documented separately. No new known failing current test.

## Commands / resume
Run `python -m http.server 8766 --directory dist`, then
`node tests/city-activities-browser.cjs`, `node tests/city-residents-browser.cjs`,
`node tests/city-combat-browser.cjs`. Units run without server.
Port8765 serves existing grow/merge browser suites.
Next priority: physically walk each job on mobile, add richer per-job interaction
animations and useful storefront/prop art; expand places only after that visual QA.
Sources: assets/gtw-combat-generated/residents-{a,b}.png, pack original files under
assets/gtw-candidates-20261105, scripts/prepare-resident-art.py, runtime metadata
in dist/assets/city/residents-manifest.json. No original source modified.
Safe rollback uses saved Sites version matching795251f, or checkout that branch
without deleting current saves. Do not force push or reset user's progress.

## Confirmed publication
- GitHub pushed feat/gtw-activities, deployed source4fcf695984c1c466fe7b350ad83481c8e3b9e8e3.
- Sites version24: appgprj_6ae9c47115308191b262fff9998049d6~appgver_43e2b3f559dc8191aaf5f140adaa3a2c.
- Deployment appgdep_6aec8c8da1fc81918b387ca73d881802 returned succeeded.
- URL https://woojingame.asnt1.chatgpt.site/#city . Public per explicit user reply;
  no access settings changed by this task. This final docs-only commit is not needed
  in the built runtime archive. Local tree was clean after code publication.
