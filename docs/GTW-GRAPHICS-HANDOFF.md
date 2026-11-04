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
2. B: generate/prepare separate building, tree, prop and vehicle assets; tile ground (first pass done; visual polish remains).
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
Checkpoint A source inspection was committed at `b4e42dc`.

### Checkpoint B — 2026-11-05
- Added `dist/city-scene.js` as a separate scenery renderer, loaded between
  `city-art.js` and `city.js`. It creates independent tile/pavement/road markings,
  convenience-store storefront and roof details, trees, street props and vehicle art.
- Focused on the convenience-store intersection first; world positions, obstacle
  shapes, NPC/vehicle paths, and old save schema (`gtw-city-v1` and `-backup`) stay intact.
  Original five reference images and their manifest remain untouched.
- Replaced only the old ground and prop render functions in `city.js`.
- Verification run: `node --check dist/city-scene.js`, `node tests/city-scene.cjs`
  (361 scene colors, transparent sprite/dimension assertions),
  `node tests/city-runtime.cjs` (8-direction movement, collision, vehicle, mission,
  save/backup, 60,000 simulated ticks) and `git diff --check` all passed.
- Both new smoke tests use locally installed `@napi-rs/canvas`; this environment
  has no Chromium executable, so the original Playwright browser tests and live
  1280×800 / 390×844 screenshot comparison are **not run** here. These tests are
  not replacements for real browser or touch-device verification.
- A local 640×400 scene render was visually inspected. It improves structural detail
  but remains significantly simpler than the supplied reference's illustrated art.
  No deployment / main-branch merge was performed.
- Pending: sprite character work (C), NPC role/vehicle polish (D), actual browser
  screenshots and regression suite (E). Continue from this checkpoint without
  regenerating originals or changing game persistence.

## Resume
Read this file and latest commit first. The next priority is step C: adapt the
provided four-direction Woojin source into top-down-friendly walk/run poses, with
explicit frame/feet-anchor checks. Do not mistake the 12 reference poses for a
complete overhead animation set. Then NPC roles and the browser/quality checks.
Continue testing and committing each useful unit; do not claim unverified art
reaches the supplied reference's quality.
