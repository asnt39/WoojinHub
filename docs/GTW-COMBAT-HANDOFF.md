# GTW combat / NPC / world — WIP, 2026-11-05

## Baseline
- Branch `feat/gtw-combat`, based on graphics `53141f7` (deployed product `d1e13be`).
- Fetched all origin branches: main `9cab50c`, city `0e1805e`, graphics `53141f7`.
  No dirty user files, no newer competing branch at start. Never force push.
- Read latest graphics handoff and actual runtime. No combat system exists yet.
  Existing action atlas has an unused hurt pose, not health/hit detection.
- Canvas2D fixed 60Hz step; four direction sprites, 40x48 / feet (20,44), desktop
  WASD/Shift/E/F/Escape; pointer-captured stick and run; separate gtw-city-v1 saves.
- Existing game and save baseline: `node tests/city.cjs` passed in Chromium.

## Pack verification
- Read supplied docs/GTW-ART-PACK-20261105.md and manifest.json. All five images opened.
- `node tests/gtw-candidate-art.cjs` passed PNG dimensions/RGBA/hash checks.
- NPCs are front/back/left/right static poses at lower camera angle; NOT walk cycles.
- Combat is 9 south-only key poses. Need overhead other directions and actual timing.
- Buildings have deeper perspective/sidewalls than runtime. Do not blindly apply.
- Props have red edge debris; remove in derived output only. Ground decals must not
  become colliders. Original sources kept immutable outside dist.
- Attached notes are reference workflow suggestions, not higher priority instructions.

## Ordered implementation
1. Pure combat component + directional punch tests, phase timing, hurt/knockback.
2. Club with distinct timing/reach; attack cooldown; optional combat save fields with
   old v1 migration/defaults. No old progress reset.
3. A small early-game encounter: readable alert/approach/telegraph/strike/recover/
   retreat/defeat, civilian safety, recovery into exploration, replayable encounter.
4. Four-direction matching combat sprites, effects/audio and real mobile multitouch.
5. Only after combat checks pass: useful NPC roles from pack, proper walking contacts.
6. Only after NPC checks pass: connected useful places/props; no empty large expansion.

## Design decisions
J / Space attack, Q switch weapon. Existing keys retain behavior. Initial fists;
short wooden club acquired from a nearby tool crate through E. No advanced powers.
Attack locks facing through windup/active/recovery. One target hit once per swing,
line-of-sight blocks through walls, hurt interrupts attacks. Holding attack is rate
limited; a short breather after three attacks prevents unbounded chaining.
Enemy melee has a longer readable windup and never causes damage merely by contact.
Player defeat returns to a safe spawn with health, preserving money and mission.
First encounter is explicitly started via interaction, outside the original mission
path; the old delivery remains playable. No civilian attacks or vehicle combat.

## Next start / verification
Run `node tests/gtw-candidate-art.cjs`; server 8766 + `node tests/city.cjs`.
Combat unit and browser tests will be added before implementation. Re-run existing
city runtime/graphics/stability and existing game regressions before publishing.
Known baseline: Woorio full combat bot stage 3 failure; do not attribute to new GTW.
Original private deployment remains untouched until verified. No changes deployed yet.
