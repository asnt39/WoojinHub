# WoojinHub four-game UI polish — 2026-11-05

## Scope

This change covers the public WoojinHub container and GTW, 우리오,
머지 우진 and 우진이 키우기. No combat rules, progression tables,
physics coefficients, save keys, currency values, or geometry changed.
Preserve the Sites project's **public** audience.

## Design

- Shared dist/arcade-ui.css scopes arcade-style buttons, focus and press states
  to each game while preserving its own artwork.
- GTW: objective and HP HUD, minimap frame, dialogue/pause panel, mobile
  joystick and differentiated actions, responsive landscape controls.
- 우리오: clearer stage/status bars, gamepad movement/jump/fire controls.
- 머지 우진: score card, secondary controls, large drop key, game-over panel.
- 우진이 키우기: snack-themed shop, upgrade buttons, popup and speech style.
- Hub: WoojinHub header, responsive tabs, keyboard navigation and lazy
  instantiation of only the selected game iframe.

## Interaction and performance

- GTW and combat HUD previously rewrote unchanged text/style at 60Hz. Writes
  are conditional now. 우리오 HUD and notice similarly update on changes.
- The hub previously eagerly instantiated four games after 300ms. It now
  creates a game only when selected; visited games receive hide/show messages.
- Hidden 우리오, 머지 우진 and 우진이 키우기 views skip Canvas updates.
- GTW joystick release no longer cancels an unrelated simultaneous attack.
- GTW dialogue accepts E, Enter, Space and Escape for dismissal, intercepts
  game input while visible, and focuses the confirmation action.
- 우진이 키우기 stops photo CSS transform writes when values are unchanged.

## Verification and limits

- PASS: node tests/ui-polish.cjs, node tests/city-runtime.cjs,
  node tests/city-combat-unit.cjs, node tests/city-scene.cjs.
- PASS: node --check on changed scripts; git diff --check.
- This executor has no Chromium binary. Existing real browser Playwright
  suites could not be run locally. After deployment, verify in browser at
  390×844, 844×390 and 1280×800. Check multi-finger combat and navigation.
- Simulated steps do not establish real-world FPS; do not claim every
  device-specific stutter or unspecified interaction defect is eliminated.

## Resumption

1. Open current Sites source/deployed version, not older GitHub main.
2. Run existing browser test suites on an executor with Chromium.
3. Add regression tests for any newly discovered interaction problems.
4. Keep saves and audience untouched; push through Sites source workflow
   and deploy a version from the pushed SHA.
