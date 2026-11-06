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
