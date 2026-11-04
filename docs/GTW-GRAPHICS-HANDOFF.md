# GTW graphics — work in progress

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
