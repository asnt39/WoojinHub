# Woorio mobile landscape / fullscreen / sound settings — 2026-11-06

Branch feat/woorio-mobile-settings from977e42d. Sites fetched bf5de23 was ancestor;
no dirty user files. Owner default includes publication, public audience retained.

## Corrected pet semantics
User clarified limit applies to NUMBER OF PET-ASSIGNED BOXES, not lifetime drops.
Removed runtime drop counter/budget. At most2boxes have reward pet in a map. Opening
those boxes again after death always gives pet. Other boxes never turn into pet.
Fixed rewards/used-state respawn behavior retained. Dedicated test first failed
on previous implementation and now passes. Prior v27 pet cap documentation superseded.

## Gameplay / sounds
- Short dedicated death riff (~.27sec), soft launch riff (~.05sec) on player and
  nearby enemy/boss projectiles, soft pickup ascending riff (~.13sec) on actual grant.
  Uses real WebAudio oscillator envelopes, separate from original BGM scheduler.
- New sound settings dialog pauses gameplay, independently controls SFX/BGM, resumes
  prior pause state; preferences persist under separate woorio-options-v1. Original
  progression key `woojin-adventure-v1` remains unchanged.
- Extra later flying enemies and mixed low columns/approach steps. New obstacles only
  inserted if clear of existing structure motion envelopes; whole maps still pass
  final box/patrol/coin validation. Existing boss HP6/9/14, warning windows retained.

## Mobile / fullscreen
- Landscape low-height layout fills viewport width; movement left, jump/fire right,
  safe-area aware. Logical camera width recomputed from actual viewport ratio while
  retaining H540 and physics, replacing letterboxed portrait render in side column.
- Native fullscreen request/exit plus viewport-expansion fallback. Portrait retains
  readable proportional canvas/buttons. Fullscreenchange/resize release input and
  resize without resetting progress. Hub iframe allowFullscreen explicitly enabled;
  only non-Woorio product change is that permission attribute (no other game logic).
- Slight extra scanline/tile pattern on existing hand-authored pixel surrounds.

## Actual checks
PASS adventure-pet-boxes (all9maps, all box reward identities, pet boxes after death).
PASS adventure-sweeps incl new challenge obstacles, placement, room-physics (all40
boxes jumped,20sec dynamic NPC/structure audit per map), unit/v20/v21/v22/v24,
power-duration, boss-phases and ui-polish. Updated old pet-budget / side-column
layout assertions to match user's corrected behavior, not disabled runtime checks.
PASS real Chromium mobile-settings browser: death/fire/pickup synth events; mute
prevents new effects; settings persist after reload; full-width844x390landscape with
viewWidth>1200; left/right two-finger input/release; native and simulated unsupported
API fullscreen; fullscreen within hub iframe. No autoplay-policy bypass.
PASS arcade-browser and polish-browser (BGM, font, notice/canvas stability, controls,
isolated boss projectiles). Grow browser, merge and GTW combat-unit/runtime PASS.
Opened docs/woorio-v28/{portrait,landscape,fullscreen}.png after actual rendering.
No physical device/audio hardware listening test. Landscape controls intentionally
float over bottom corners while main gameplay view uses full viewport width.
AI logs in docs/woorio-v28: local50/50, full input bot1/9clear. Still not full9clear.

## Resume
python -m http.server 8765 --directory dist
node tests/adventure-mobile-settings.cjs
node tests/adventure-pet-boxes.cjs
node tests/adventure-sweeps.cjs
node tests/adventure-room-physics.cjs
Next: real phone rotate/native fullscreen tests, more capable upper-route/combat AI,
and human balance testing of late density. Keep pet limits tied to map assignments.
Do not reset user progression or silently remove public access. Safe rollback source
bf5de23, previous deployed version28. Never force push.
