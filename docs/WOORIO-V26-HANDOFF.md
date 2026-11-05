# Woorio distinct rooms / collision envelopes / death sprite — 2026-11-06

## Source and publication
Branch feat/woorio-distinct-maps from d03176c. Sites fetched c513bd1 was an ancestor,
working tree clean at start. Public audience retained, deployment authorized by
owner's persistent default. No other game's product code or save keys changed.

## Implemented
- Replaced repeated island/stair/box formula with 9 authored room sequences, varying
  room lengths, gap positions/widths, surface heights and structural motifs. Shared
  construction helpers retain existing gameplay objects; no parallel physics engine.
- Distinct opening in every stage. Later rooms: forest grove/terraces; coastal piers,
  tidal crumble route/warehouse; ruin columns/court/shrine/arch; cave upper/lower forks;
  rampart/gates/gallery; elevators/gantries/depot/rail; belt/press/gear factory;
  ruins/split/fragile walls; final mixed precision rooms. Three existing boss arenas,
  powers, respawns, fixed rewards, controls and save format retained.
- Lucky boxes are validated only AFTER complete room and boss assembly. Full box,
  underside/standing bay and moving/elevator platform sweeps must be clear. Conflicts
  relocate to nearest valid ground bay, keeping deterministic reward unchanged.
- All enemy patrol/flight envelopes include entire bodies, ±48px bat / conservative
  ±54px shadow bat; compare to complete moving-platform ±58X / elevator ±50Y envelope,
  including one-way platforms (old tests excluded them). Entire patrol interval fits
  a continuous clear ground room. Stationary turrets stay at their own coordinates.
- Spikes checked against all structures; conflicting spikes relocate to clear bays.
- Death rebound uses NEW supplied hero atlas crouched pose for left/right with same
  feet/scale as normal poses. Existing rebound physics retained. Old heroDead sprite
  is only unloaded-art fallback, not shown when atlas is ready.

## Actual tests
- New adventure-sweeps first failed36cases on old maps; now passes9maps. Includes box
  body vs structures and complete enemy/structure motion sweeps, not initial point only.
- adventure-room-physics: all40boxes activated using engine jump input from isolated
  standing setup (no direct bump call);20simulated seconds per stage with dynamic
  NPC/structure body checks. Passed. This is not a full route-to-each-box playthrough.
- Existing adventure-unit/v20/v21/v22/v24, placement, boss-phases, power-duration PASS.
- Real Chromium adventure-distinct-browser: all9room sequences and renders, oldDead
  draw count zero during actual rebound, mobile overflow/runtime errors PASS.
- Real Chromium adventure-polish-browser: controls, multitouch, stable canvas and
  isolated boss pickup/projectile travel PASS. Grow browser.cjs and merge.cjs PASS.
- Captures docs/woorio-v26/intro-1..9, stage-1..9, death, mobile, nine-starts.png.
  Opened contact sheet, death, and several actual interior frames for comparison.
- Final real-input local jump search50/50 PASS with enemies/hazards enabled. Isolated
  takeoff setup, not continuous clear. Different count follows changed authored maps.
- Full input-only AI one variant, max4deaths:1/9clear, no warps or state edits. Complete
  logs docs/woorio-v26/ai-playthrough.jsonl and local-jumps.jsonl. Full9clear remains
  unverified. Do not claim this is proof allmaps impossible or fully validated.
- No physical mobile hardware or long-run real-device performance test.

## Resume / commands
`python -m http.server 8765 --directory dist`
`node tests/adventure-distinct-browser.cjs`
`node tests/adventure-room-physics.cjs`
`node tests/adventure-sweeps.cjs`
`node tests/adventure-ai-jump-reachability.cjs`
`AI_ATTEMPTS=1 node tests/adventure-ai-playthrough.cjs` (known diagnostic nonzero).
Next priority is stronger input AI for upper routes/waiting/monster timing and actual
human mobile playthroughs, not another duplicate combat or generic map generator.
Safe rollback is previous public source c513bd1; keep saves and never force push.

## Confirmed publication
- Source dd8de1ddd18116ea194db7213fe7eb2579940233 pushed to GitHub and Sites.
- Sites version27: appgprj_6ae9c47115308191b262fff9998049d6~appgver_4d02ed0bbf208191bdcb1deccd9c5cdd.
- Deployment appgdep_6aecb39c525c8191a4eacc2fee4130e9 returned succeeded.
- URL https://woojingame.asnt1.chatgpt.site/#adventure . Public unchanged.
- Stage1 input bot cleared; other8not yet cleared by the limited bot. Placement and
  isolated physical checks passed as recorded above; full9clear not claimed.
