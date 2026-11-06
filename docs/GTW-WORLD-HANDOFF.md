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
