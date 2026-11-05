# GTW graphics — playable graphics update, overall PARTIAL

Latest status is the final checkpoint at the end of this file; earlier entries are chronological.

## Baseline / recovery
- Working branch: `feat/gtw-graphics`, based on `feat/gtw-city` at `0e1805e`.
- GitHub main remains untouched. Existing site is owner-only; do not change access.
- No user modifications existed at start. Keep original assets outside `dist`.
- Baseline functional checks were recorded in `GTW-HANDOFF.md`; repeat after edits.
- Safely inspect the baseline with `git worktree add /tmp/gtw-baseline 0e1805e`; do not reset shared work.

## Checkpoint A: actual source inspection
All five files from `Photos-1-001.zip` decode as PNG. Original hashes, dimensions,
alpha ranges and roles are in `assets/gtw-originals/manifest.json`.

- A / city: 1672×941. Near overhead projection with shallow front facades; warm gray
  paving, blue-gray asphalt, muted brick, olive foliage. Light comes from upper left.
  At approximately half source resolution people should be roughly 22–28×36–44
  logical pixels. Building footprints and traffic lanes must remain playable.
- B / Woojin: 1086×1448. Three poses per direction (front, back, left, right).
  Feet and body extents differ: trim each detected silhouette, do not blind-grid crop.
  View is lower than A. Redesign perspective before final in-world use, retain dark
  hair/shirt, slight belly, slit eyes and natural adult proportions.
- C / NPC1: four roles × four directions, **static direction poses, not walk cycles**.
- D / emotions: 1536×1024, six poses. Alpha is not a clean cutout: background glow is
  partially opaque. Cannot directly swap into movement without alignment/cleanup.
- E / NPC2: four further roles × four directions. Red/yellow edge contamination.
  Automated extraction must be visually inspected; originals must remain unchanged.

## Implementation decisions / sequence
Keep Canvas2D, fixed-step physics, independent `gtw-city-v1` saves and existing hub.
Use discrete transparent environment objects and tiled ground, never the reference
as a full playable background. Match logical pixel density; all runtime scaling uses
nearest neighbour. Feet anchor at world positions for shadow, sorting and collision.
First improve the convenience-store intersection; extend only consistent assets.

1. A: preserve + inspect inputs (done).
2. B: generate/prepare separate building, tree, prop and vehicle assets; tile ground.
3. C: prepare overhead Woojin directional poses, walking and running; validate frames.
4. D: NPC roles and vehicle rendering; do not pretend static NPC poses are walk cycles.
5. E: screenshots 1280×800 / 390×844, compare source, regression tests, commit/push.

## Verification commands
`python -m http.server 8766 --directory dist`
`node tests/city.cjs` and `node tests/city-stability.cjs`
Other games: server on 8765, then `node tests/browser.cjs`, `node tests/merge.cjs`,
`node tests/quality.cjs`, `node tests/adventure-geometry.cjs`.
Known baseline issue: full combat bot `tests/adventure.cjs` fails stage 3; unrelated
to GTW graphics. Simulated stability is not equivalent to real long-duration play.

## Current status
Only source analysis completed at checkpoint A. No new graphics/functionality tested
yet. No new deployment. Last confirmed remote baseline is `0e1805e`.

## Resume
Read this file and latest commit first. Verify current game locally before editing.
Continue highest priority unfinished item; test and commit each useful unit. Do not
repeat completed extraction or claim unverified graphics meet the source quality.

## Checkpoint B/C/D — first integration
- Last confirmed remote analysis checkpoint: `b4e42dc`.
- Image generation tool actually used with supplied A/B/C references. Generated source
  sheets are preserved under `assets/gtw-generated`. These are new derived assets,
  not the original character sheets pasted unchanged.
- Reproducible extraction: `python scripts/prepare-city-art.py` (Pillow/numpy/scipy).
  15 optimized runtime PNGs in `dist/assets/city`, manifest records source hashes,
  exact inspected extraction regions, direction order and feet anchor (20,44).
- Actual sources cover 2 buildings, 2 trees, 2 cars, bench, lamp, vending, bin, bike;
  player 4 directions × idle/walk A/B/run A/B; 3 NPCs × 4 directions × idle/walk A/B.
- First district now uses individual sprites, deterministic tiled pavement/asphalt,
  markings, cracks, drains, manholes, park grass and dirt paths. No backdrop image.
- New `city-sprites.js` preload/cache; `city-ground.js` creates ground once. Existing
  world physics/save keys retained. NPC animation now advances by distance, and
  stops when talking; player no longer walks in place into a wall.
- `node tests/city.cjs` PASSED after restarting local server. Earlier connection
  refused was a stopped server, not game logic. New PC/mobile images inspected at
  `docs/gtw-graphics/{desktop,mobile}.png`; no claims based on old preview files.
- Quality still PARTIAL: outside first intersection two buildings use old procedural
  art; 5 supplied NPC designs are not yet integrated. Generated side walk poses are
  close to one another, need manual animation review. Actions/emotions still pending.
- Vehicle boarding has a short positional transition, not yet dedicated sprite poses.
- Current edits not deployed. Owner-only access remains unchanged.

## Concurrent remote checkpoint integration
Remote `55a2567` appeared after local checkpoint A. Merged without force pushing.
Its original handoff is preserved in `GTW-GRAPHICS-CHECKPOINT-B.md`.
Kept `city-scene.js` loaded for improved fallback outer-district buildings; first
district uses the new raster sprites and ground. Both remote smoke tests retained;
updated runtime smoke harness to load actual PNGs and await asset initialization.


## Final graphics checkpoint (before private deployment)
Last confirmed GitHub remote checkpoint: `a0f84a3` (includes remote `55a2567`).

### Implemented and actually verified
- Separate generated environment sprites derived from A, and high-viewpoint hero/NPC
  sprites derived from A/B/C. Original uploads untouched. D used for new action atlas.
- Four-direction idle, two walking contacts and two distinct running contacts for
  Woojin, foot-anchored at (20,44). Animation advances with actual travelled distance.
- Four-direction interaction reach/extend, crouch on entry, step on exit, brief surprise
  on pickup/reward, automatically returning to normal. These are short transitions,
  not full-length cinematic animation. Hurt pose exists but is NOT wired to damage;
  anger, fall/recovery animations are NOT implemented.
- Three NPC roles with directional idle/walk poses, stopping while approached.
  Two side-walk contact poses remain too similar; polish needed for stronger gait.
- Two building sprites in the first district, detailed sedan, two tree variants,
  lamps, bench, vending, bins, bicycle; layered ground and opaque sprite outlines.
  Second generated car (van) is prepared but not placed in the world.
- Retained remote checkpoint's outer-district procedural buildings; these remain
  visibly lower quality and have NOT been reported as finished final artwork.
- Fixed bag render order (now sorted by feet), expanded tree fade coverage to actual
  canopy, solid prop-base collisions, lighter road grain, scrollable short-screen menu.

### Validation actually run
All passed in this environment with `/usr/bin/chromium`:
- `node tests/city.cjs`: real keyboard, 8 directions, swept collision, car entry/drive/
  steering/exit, mission sequence, reward, save/backup, retained hub iframe, touch cancel.
- `node tests/city-stability.cjs`: Chromium CDP two-finger joystick + run and release;
  60,000 simulated ticks / 1,000 simulated seconds without invalid positions.
- `node tests/city-graphics.cjs`: loads all runtime assets, frame opacity/bounds/feet,
  separate walk/run frames and keyboard speed, standing NPC, timed interaction,
  pause/resume, PC/mobile/landscape/tablet layout, actual screenshots.
- `node tests/city-runtime.cjs`: native canvas runtime smoke including same saves,
  mission, driving, 60,000 ticks. Harness updated for actual image loading.
- `node tests/city-scene.cjs`: retained previous checkpoint's procedural renderer test.
  Its 361-color count describes that fallback, NOT proof of new art quality.
- `node tests/browser.cjs`, `node tests/merge.cjs`, `node tests/quality.cjs`,
  `node tests/adventure-geometry.cjs`: all passed for existing three games.
- Re-ran city and graphics tests after final tree-anchor/bag-order/short-menu changes.
- 600 repeated browser draw calls averaged ~0.05ms CPU submission on this runner.
  This is NOT measured end-to-end FPS or a real long-duration mobile performance test.
- Full combat bot `tests/adventure.cjs` not re-run: its known stage-3 baseline failure
  remains outside this change. No grow/merge/adventure product code changed.
- Screenshots genuinely opened and inspected: `docs/gtw-graphics/desktop.png`
  (1280×800), `mobile.png` (390×844), `intersection.png`, `park.png`, `frames.png`,
  `action-frames.png`. `reference-comparison.jpg` puts A next to actual gameplay.

### Honest quality assessment
1. Material detail: store, trees and car much closer to A; ground and park still simpler.
2. Consistency: first district uses one muted palette and logical pixel grid; outer
   procedural buildings do not yet match that quality.
3. Perspective: regenerated overhead actors replace low-view input, roof/facade view
   broadly matches. Original urban layout differs from A and is intentionally retained.
4. Proportions/readability: normal adult bodies, slight belly, high-view hair/shoulders,
   common feet anchors; emotions could use further hand-tuned facial pixel work.
5. Density: first storefront detailed; park and residential streets still sparse.
6. Lighting: upper-left highlights and lower-right ground shadows consistent in first
   district. Generated facade lighting and simple world shadows need finer matching.
7. Motion: sprites remain crisp in actual browser play; few animation contacts are
   visibly less fluid than a finished commercial sprite set.
**Overall PARTIAL. Not claiming parity with reference or commercial release quality.**

### Next session, exact starting point
1. Read this document, `git status`, `git log -5`, fetch and inspect remote before pushing.
2. Run `node tests/city.cjs` with local server 8766; inspect the stored comparison.
3. Highest priority: finish first-district ground/park material and NPC walk contacts.
4. Adapt remaining five NPC designs (C fourth role and all E); do not paste low-view
   static source directly or claim recoloring equals a new animated character.
5. Improve/complete facial states, multi-frame boarding and hit/recovery; then extend
   sprite building quality to the two outer neighborhoods. Keep saves/access unchanged.
6. Use functional checkpoints and pushes. Re-run relevant checks before each commit.

### Restart command
“Continue GTW graphics in asnt39/woojingame. First read
`docs/GTW-GRAPHICS-HANDOFF.md` and the latest commit. Do not redo completed assets.
Verify the current game before editing; prioritize the highest unfinished visual
quality item and commit/test each unit.”

## Confirmed remote save and private deployment
- Working branch: `feat/gtw-graphics`.
- Last tested product/source commit, confirmed pushed to GitHub and Sites source:
  `d1e13bee9a795f084c519bb2cedec288497f6400`.
- GitHub checkpoint history: `b4e42dc` analysis; `3477ebf` first integrated art;
  `a0f84a3` merge of remote checkpoint; `d1e13be` actions and final verification.
- GitHub default branch was NOT merged or force-pushed. Existing saved game data and
  hosting/access manifest unchanged. Any subsequent commit here is documentation only.
- Private deployment SUCCEEDED at 2026-11-04 22:47 UTC.
  URL: https://woojingame.asnt1.chatgpt.site/#city
  Version: `appgprj_6ae9c47115308191b262fff9998049d6~appgver_edb1be9c2c588191ab8e111f380630ef`
  Deployment: `appgdep_6aebb600786c8191991c198dc927b61d`
- Before publishing, access revision 3 was confirmed custom owner-only: one owner,
  no groups/external visitors. Used the owner-private deployment operation, which
  checks and preserves that audience. No access setting mutation was made.
- Browser gameplay verification was local Chromium; no physical-phone playtest or
  post-deployment authenticated browser playthrough is claimed.
- To inspect the last tested state safely: `git worktree add /tmp/gtw-tested d1e13be`.
  To inspect the pre-graphics state use `0e1805e` in a separate worktree. Do not reset
  current work or deploy an older version without checking the user's intent.

## Latest activities integration
Newer user Sites source795251f integrated on feat/gtw-activities. See
[GTW-ACTIVITIES-HANDOFF.md](GTW-ACTIVITIES-HANDOFF.md) for current source, tests,
NPC sprites and job state. Older combat branch is a retained checkpoint, not the
latest whole application. User explicitly requested keeping current public audience.
