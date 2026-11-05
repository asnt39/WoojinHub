# Woorio boss rush / death pet reset / crumble fall / ground-return routes
2026-11-06. Branch feat/woorio-boss-rush from f3a73cf. Fetched Sites531aeac ancestor,
clean workspace at start. Public audience unchanged, owner default includes deploy.

## Implemented
- Boss HP doubled exactly12/18/28. Stone strides145px/s between attacks; storm dash
  390px/s (was270), farther340px limit and210px/s return; shadow strafes250px/s with
  faster vertical bob. Projectile speeds increased. Locked aim warnings .72sec
  (shadow.62), recoveries .78–1sec preserve a response/counter window.
- Pet + golden pet removed immediately in die(), including HUD. Remain absent after
  checkpoint respawn. Pet box assignments<=2 remain stable; reacquisition is allowed.
- Crumble collapse warning retained. On expiry, platform becomes non-solid immediately,
  fallX/Y snapshot and fallAge drive a 520t+900t² downward remnant, fading over.32sec.
  Remnant has no collision; no moving-platform reattachment. Reset cleanly on death.
  Giant-shattered blocks do not later spawn a duplicate crumble animation.
-19ground-return passages across9maps interrupt continuous upper-platform bypass.
  Tall gates cannot be jumped over; floor plate opens4.5sec. Existing giant power can
  still destroy them intentionally. Candidate selection validates gate motion bounds,
  full standing/traversal lane through and beyond gate, and saw/hazard envelopes.
  Spikes are kept out of plate/corridor after final hazard relocation. Nearby hint
  teaches floor plate; visible arrow/GO indicator. Early maps1seal, later2–4.

## Debugging evidence
- Initial physical passage probe found a narrow landing/exit at stage1, and a late
  switch overlapped a relocated spike. Replaced point-only bay with a complete clear
  ground corridor; considered moving platforms and saw sweeps; retain80px runup after
  gate where feasible. All19passages now cross with actual physics after plate press.
- Old v24 assumption 'all switches introduced stage5' now distinguishes ordinary
  timed gates from new route seals. Old HP assertion updated for explicit2x request.
  Gameplay checks are still run, not removed.

## Actually passed
adventure-boss-rush: HP12/18/28, immediate pet loss, falling remnant displacement,
closed seals block upper movement, plate opens safely, every19passages physically
traversed from isolated plate setup. Not a full approach-to-each-plate playthrough.
adventure-room-physics: all40boxes actual jumping;20sec per map dynamic NPC/structure.
sweeps/placement/unit/v20/v21/v22/v24/boss-phases/power-duration/pet-boxes/arcade PASS.
Real Chromium boss-rush-browser: crumble/death/boss-dash/landscape route rendering;
mobile-settings: audio, controls, fullscreen native/fallback/hub, options persistence;
arcade-browser and polish-browser also passed. Grow/merge browser + GTW runtime PASS.
Opened docs/woorio-v29/{crumble,boss,ground-route}.png. Screenshots use deterministic
isolated player setup/invulnerability to inspect mechanics, not human full clears.
AI logs current local50/50; full input bot1/9clear. Full9clear remains unverified.
No physical phone/performance or human boss-difficulty playthrough claim.

## Resume
python -m http.server 8765 --directory dist
node tests/adventure-boss-rush.cjs
node tests/adventure-boss-rush-browser.cjs
node tests/adventure-room-physics.cjs
node tests/adventure-sweeps.cjs
Next: human/stronger AI timing playtest of ground-return transitions and longer boss
fights; tune only on observed failures. Preserve warning/recovery, not random damage.
Safe rollback531aeac, previous site29. No save schema or other game logic changed.
