# GTW world systems — 2026-11-06

## A. Source verification / plan
- Branch: `feat/gtw-world-systems`, clean branch from Sites source
  `45c92b4cb3e91ba4b7358bb01ab4d7e272f3ddd0` (v33). Fetched current Sites main;
  independently checked saved version provenance. GitHub main9cab50c is older.
  v33 happened to match the reference, not assumed current. Original branches retained.
- Current site metadata: public revision4, latest33. Direct live asset HTTP requests
  returned403 in this runner; live bytes were NOT compared. No hosting/access writes.
- Read graphics/combat/activities handoffs and current Canvas2D modules. Existing
  combat, residents, three jobs, missions, sedan, touch controls reused. No interiors,
  time cycle, home placement or multi-vehicle system in fetched source. Van PNG exists.
- Baseline PASS: city-combat-unit, city-residents-unit, city-activities-unit,
  city-runtime (60,000 simulated ticks), city.cjs (Chromium keyboard/touch, vehicles,
  mission, backup restore, hub). Browser at1280x800 and390x844.
- Keep `gtw-city-v1`, backup, version1; add optional clock/interior/home/fleet fields.
  Existing fields and old sedan restored. No other game product code modifications.

## Implementation order / choices
B. Pure clock module; configurable real minutes per day; cached tint + local lights,
   compact clock HUD, simple night rest for selected residents. Pause/inactive freeze.
C. Data-defined store and garage rooms; swept room collision, foot-sorted objects,
   local service NPC, fade transitions, safe exterior return; outside world frozen
   while inside. Prevent combat and vehicle entry into rooms during transitions.
D. Garage as home: small curated furniture grid, select/move/remove via accessible
   panel; validate doors, player overlap and connected floor before applying. Optional
   home field; car selection pad reuses fleet controls after E.
E. Type data for existing sedan + motorcycle + van, shared driving/input, per-type
   dynamics/radius; safe spawn/load/exit; preserve old sedan save field. Reuse van PNG;
   only generate actually missing art, inspect it before claiming finished assets.
F. New core unit/browser scenarios + old regression suites, screenshots and inspection.

## Status / resume
Only A completed. No deployment authorized for this task. Next: B clock tests and
implementation, then test/commit/push each checkpoint. Use HTTP server on8766 for
GTW browser suites;8765 for other games. Never force push/reset user changes.

## B. Clock checkpoint
- Added CityTime:20-minute default day,10/20/40 setting,24-hour wrap, persisted
  optional worldTime, dawn/dusk tint, restrained night tint and four lamp/window lights.
- Office worker/runner/busker rest at night without teleporting; other residents retain
  normal routes. Clock uses simulation dt, freezes on pause/inactive/dialog as movement.
- PASS city-time-unit, city-time-browser (real reload/pause/hub-message freeze),
  city-runtime60,000ticks. Day/night desktop and night mobile captures in docs/gtw-world;
  opened desktop image: road/actors readable; lighting is modest, not dynamic shadows.
- No deployment. Next C: data-defined interiors / entrance / safe exit / local NPC.

## C. Interiors checkpoint
- Data-defined store/garage,0.4s fade with midpoint swap, room walls/furniture colliders,
  local clerk and30won/35HP purchase, garage workbench healing, safe exit candidates.
  Existing outdoor NPCs/cars freeze inside; money/mission/combat/activity state retained.
- Optional interior save; legacy p remains exterior coordinates so old readers can
  restore safely. Invalid room/player data defaults safely. No fights/vehicle entry inside.
- Generated one transparent8-prop atlas from existing environment reference; source at
  assets/gtw-world-generated/props-source.png, extraction script and provenance manifest.
 8 hard-alpha PNGs; existing sedan/van retained. Motorcycle and home decor prepared for
  later checkpoints. New art is modest-detail matching current runtime, not reference parity.
- PASS city-interiors-unit/browser,city-world-art,city-runtime,city.cjs. Store/garage
  desktop and garage390x844 captures opened. Room floor/lighting remain simpler than
  outdoor store art; no claim of commercial graphics completeness. No deployment.
- Next D: home selection/placement with connectivity and entrance validation.

## D. Personal base checkpoint
- Garage reuses interiors,three catalog furniture types (sofa/table/plant),plan touch
  placement,8px directional adjustment,store/remove; selected kind and errors visible.
- Pure CityHome validates full visual bounds/overlap,player clearance,door/vehicle pad,
  service targets,plus16px-grid flood-fill to all room targets/exit. Optional home field,
  safe default furniture for old saves, invalid entries ignored individually.
- PASS city-home-unit (including many placement proposals),home-browser on desktop and
 390x844 with actual editor button clicks/save/reload,interiors-browser,city-runtime.
  Captures opened; crisp small sprites but indoor floor and lighting deliberately simple.
- Editor pauses simulation, clears movement on open/close; garage NPCs not duplicated.
  No vehicle collection selection yet; next E shared fleet and garage selection UI.

## E. Fleet checkpoint
- Shared CityVehicles type table/controller: original sedan accel110/max155/turn1.65/
  radius30 unchanged; motorcycle185/195/2.2/r22; delivery van78/125/1.2/r34.
- Three non-overlapping parked vehicles; swept collisions against world and parked
  cars,8 exit candidates,car selection/recall from garage with safe exterior placement.
  Legacy car field ALWAYS remains sedan; optional vehicles adds all3 and selection.
  Invalid vehicle entries fall back safely; old combat/money/mission keys preserved.
- Existing van PNG reused; motorcycle from prepared source. Rider reuses a crouch pose
  (not a newly drawn full riding animation). Interior returns also check parked cars.
- PASS vehicles-unit/browser (3 actual keyboard types,real CDP two-finger van controls),
  city.cjs,combat-browser,residents-browser,activities-browser,home-browser,runtime.
- Failures investigated/fixed: van-specific slower acceleration needed a matching
  movement assertion (observed31-33speed vs sedan47-49 after0.5s); combat test's temporary
  car fixture must be restored because cars now obstruct melee sight; real regression
  store door intercepted supply pickup -> active pickup now takes priority over entry.
- Night-rest actors now use idle pose,not their last walking contact. Fleet buttons
  support Enter without closing dialogue prematurely. No deployment.
- Next F: old/backup save fixtures,transition/input/exit edge cases,all-mode regressions
  and final screenshots. Current verified local changes saved at this checkpoint.

## F. Integration / final handoff
- All four requested feature groups implemented. No site source push,version save,
  deployment or audience mutation. At final check Sites stillv33/public revision4.
- Last confirmed remote checkpoint before this final commit: d16c99a81137295f62e32a6f81495c75f965c9d3.
  Final verification commit is the commit containing this section; use `git log -1`.
  Origin URL remains asnt39/woojingame; GitHub now redirects to asnt39/WoojinHub.
- Added end-to-end original v1 + backup fixture retaining54321won,63HP,club,mission2,
  active supply job and unrelated localStorage bytes. New optional fields do not reset
  old progress. Old sedan's position/angle persist. Inside-room legacy p stays outside.
- Safe exit search now includes wider nearby points if a parked van covers doorway.
  Reproduced the trap in integration test before fixing; test passes after correction.
  Garage preview vehicle has a solid footprint so actors cannot walk through it.
- Reproduced secondary-touch sprint problem: old click-only toggle did not fire while
  primary joystick was down. Pointerdown now toggles once; keyboard-generated click
  still works. Updated obsolete stability fixture to current toggle and10NPC contract.
  Chromium CDP touchEnd must release all contacts for this test; partial-contact end
  produced a misleading joystick-release failure,diagnosed using pointer event trace.
- Landscape editor originally wrapped every direction button to full width; screenshot
  exposed a hidden completion button. Fixed widths/compact rows; test now asserts
  completion button itself is within viewport at844x390,not just outer panel bounds.

### Tests actually executed (all GTW below PASS)
No server:
```
node tests/city-time-unit.cjs
node tests/city-interiors-unit.cjs
node tests/city-home-unit.cjs
node tests/city-vehicles-unit.cjs
node tests/city-world-art.cjs
node tests/city-combat-unit.cjs
node tests/city-residents-unit.cjs
node tests/city-activities-unit.cjs
node tests/city-runtime.cjs
```
With `python -m http.server 8766 --directory dist`:
```
node tests/city-world-integration.cjs
node tests/city-world-play.cjs
node tests/city-time-browser.cjs
node tests/city-interiors-browser.cjs
node tests/city-home-browser.cjs
node tests/city-vehicles-browser.cjs
node tests/city.cjs
node tests/city-combat-browser.cjs
node tests/city-residents-browser.cjs
node tests/city-activities-browser.cjs
node tests/city-graphics.cjs
node tests/city-stability.cjs
```
- Real browser keyboard walks store spawn→counter→purchase→exit; real mobile joystick
  walks garage spawn→vehicle station→van selection. Outdoor approach and some long
  mission scenarios use arranged fixtures,not a claimed full human traversal.
- Stability:60,000ticks in both headless runtime and Chromium;1,000simulated seconds.
  Graphics diagnostic600draw submissions averaged0.08ms on runner;NOT device FPS.
- PASS other games:browser.cjs(grow),merge.cjs,quality.cjs,ui-polish.cjs,
  adventure-unit.cjs,woorio-retro-contract.cjs,adventure-corrosion-boss.cjs.
  Grow/merge browser suites use server8765. Existing product files unchanged fromv33.
- Known baseline FAIL:adventure-arcade-browser.cjs `landscape uses whole screen width`.
  Reproduced on untouched45c92b4 in separate /tmp/gtw-v33-baseline worktree; therefore
  pre-existing Woorio issue,not hidden or fixed as part of GTW. Subsequent independent
  Woorio tests above passed. Full9-stage AI completion not attempted for this task.
- `git diff --check` passed. No physical phone,real long-duration FPS,mobile GPU battery
  test or production playthrough. Direct live assets403;version provenance verified
  through Sites metadata/source only. Older city-scene test not rerun.

### Visual review / remaining limits
- Opened actual1280x800 day/night/store/garage/home/motorcycle and390x844 night/home/
  van captures; final844x390 home editor opened after correction. All in docs/gtw-world.
- Existing upper-left art light,pixel scaling,feet anchors retained. Eight new discrete
  sprites use original environment palette; interior floor is cached tile drawing,
  NOT a pasted whole-room backdrop. Store shelves/counter/fridge rendered individually.
- Indoor floor/lighting is simpler than mature outdoor storefront,not commercial-art
  parity. Garage fridge is a compressed display cabinet; improve proportions/art next.
  Motorcycle rider reuses boarding crouch,not dedicated directional ride animation.
  Exterior lighting uses a low-cost tint/light pools/windows,not full occlusion lighting.
- Doors can be entered only on foot/out of combat;E prioritizes active supplies pickup,
  then entry,then nearby parked vehicle. Interior services and all existing jobs retained.
- Only3furniture kinds,2interiors,3vehicle types. They are data catalogs for extension.
  No new building interiors for record shop/houses,advanced furniture rotation,traffic
  AI or external service introduced. Those were outside first requested scope.

### Resume / rollback
1. Read this doc and `git status`,fetch origin;inspect current feature branch before edits.
2. Run time/interior/home/vehicle units and city-world-integration with server8766.
3. Highest next priority:physical-phone feel/performance and indoor art/vehicle riding
   polish. Investigate existing Woorio landscape issue separately if requested.
4. Deploy ONLY after owner approval. Do not merge/revert public site automatically.
5. Safe baseline view: `git worktree add --detach /tmp/gtw-before-world 45c92b4`.
   Existing publicv33 is untouched. Preserve gtw-city-v1 and its backup when comparing;
   do not reset current checkout or remove optional fields from player's save.
6. Artwork rebuild: `python scripts/prepare-world-art.py` (Pillow,numpy). Originals at
   assets/gtw-world-generated/props-source.png;runtime provenance dist/assets/city/world-manifest.json.

## Publication authorized — 2026-11-06
Owner now explicitly requests deployment and automatic publication after future
verified edits. This supersedes the earlier no-deploy instruction above. Product
commit0a1c4b3 is unchanged;21GTW checks and known baseline Woorio failure remain as
recorded. Fetched Sites main again:45c92b4,ancestor of this branch;no intervening source
changes. Audience remains public revision4. Publication result will be recorded below.

## Confirmed public deployment — v34
- SUCCEEDED2026-11-06T05:39:22UTC,https://woojingame.asnt1.chatgpt.site/#city.
- Exact pushed source:5a17d0dcbbb255850ca2bb24747d5f628f17b5a6;product unchanged from0a1c4b3.
- Saved version:appgprj_6ae9c47115308191b262fff9998049d6~appgver_bd5c7a3259b0819181ad4dee04d8799c.
- Deployment:appgdep_6aed67fd00c08191b66d4841d8e506ae,status succeeded.
- Audience public revision4 retained. No save key changes or access-setting mutations.
- Sites workflow helper was unavailable in executor/cloud skill resources. Used ordinary
  authenticated Git fetch/fast-forward push and exact `git archive HEAD .openai/hosting.json dist`,
  then native save_site_version/deploy_site_version. Archive137files/36444160bytes,
  hashsha256:ed00b5547548d633183c63dda2e6b2da9ff619e0665c84ebf6befb4cb962fa19.
- Native deployment success verified;no production browser playthrough claimed.
- Any following commit is handoff-only,not a different unverified product build.
- Future game edits:verify then publish by default per latest owner instruction.
