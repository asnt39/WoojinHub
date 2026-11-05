# WoojinHub / GTW — independent candidate art pack (2026-11-05)

## What was actually done

Five transparent RGBA PNG source sheets were generated specifically for the user's
Korean urban pixel-art references and added under `assets/gtw-candidates-20261105/`.
The original source art and existing playable assets were **not** replaced.

| File | Source concepts added | Status |
| --- | --- | --- |
| `npc-urban-a.png` | Food vendor, office worker, jogger, street troublemaker; four idle directions each | Candidate art, not animated runtime sprites |
| `npc-urban-b.png` | Security guard, nurse, construction worker, busker; four idle directions each | Candidate art, not animated runtime sprites |
| `buildings-a.png` | Pharmacy, noodle shop, low-rise apartment, laundromat | Candidate visual exteriors, not world geometry |
| `street-props-a.png` | 16 standalone Korean street objects | Candidate visuals, collision/interactions pending |
| `woojin-combat-keyposes.png` | Nine front-facing fist, simple club, guard, hurt/stagger key poses | Candidate key poses, not full combat or four-direction animation |

Source files are high-resolution illustrations arranged as visually regular grids,
not exact sliced cell atlases. The `manifest.json` specifies identity order, direction
order, image sizes, source SHA-256, and restrictions. Original generated PNGs remain
unaltered. `node tests/gtw-candidate-art.cjs` verifies all files/metadata.

## Existing implementation: verified by source inspection, NOT by new gameplay test

- `feat/gtw-graphics` already renders 40×48 character cells and anchors feet at
  (20,44); it already has Woojin walk/run and 3 NPC animated roles.
- `dist/city-sprites.js` currently hardcodes the existing filenames and animation
  cycle. `scripts/prepare-city-art.py` illustrates how to manually select regions,
  remove halos and rebuild uniform sprites. **Do not overwrite** the existing `npcs`
  or `woojin` sheets with this pack directly.
- Preserve fixed-step movement, `gtw-city-v1` save data, the hub, existing games,
  collision and camera while integrating.
- This independent pack changes **no runtime files, no deployed site and no saves**.

## Astra implementation work, ordered by the user's current priorities

### P1 — Simple combat first (punches + one basic melee weapon)

1. Read `docs/GTW-GRAPHICS-HANDOFF.md`, review `dist/city.js`, current combat input
   bindings and relevant tests. Avoid colliding with Claude/Astra's active branch.
2. Add a minimal combat component behind the existing city scene, in isolated
   modules where practical: state `idle → windup → active → recovery → idle`,
   interrupted by `hurt/stagger`; 4-way hit region in the facing direction;
   per-attack cooldown; health, knockback, brief invulnerability and respawn.
3. Fists available from game start; short wooden club as the one additional simple
   weapon, acquired via ordinary gameplay. **More abilities remain locked** until
   later story/mission milestones; do not deliver advanced skills prematurely.
4. Start with an explicitly designated hostile/training NPC, not every civilian.
   Enemy AI can have `idle, approach, telegraph, strike, recover, retreat, defeated`.
   Telegraph and separation prevent unfair repeated collision damage.
5. Use `woojin-combat-keyposes.png` only as source visual reference at first. It
   lacks up/left/right and exact anchors. Extract and adapt key poses; request further
   generation if needed, and retain a reasonable fallback animation while incomplete.
6. Wire desktop and touch combat controls without stealing movement/interaction
   input. Add deterministic tests for range, cooldown, only-one-hit-per-swing,
   knockback obstruction and pause/resume/save continuity.

### P2 — Add NPCs and meaningful interactions

Integrate 2–4 distinctive roles first (vendor, guard, nurse, troublemaker), then
the other four after checking appearance and frame consistency. Never call four
idle directions a walk cycle. Prepare idle + at least two visibly different walking
contacts per relevant direction and use existing distance-driven animation.

Suggested interaction mapping:

| Role | Behavior | Noncombat interaction |
| --- | --- | --- |
| Food vendor | Stays by a food cart | Small food purchase / stamina recovery |
| Office worker | Commutes along a sidewalk | Short neighborhood clue dialogue |
| Jogger | Loops through park path | Optional time challenge |
| Street troublemaker | Guards a side street | Introductory consented/quest-triggered sparring encounter |
| Security guard | Patrols a building perimeter | Warns of restricted location; reacts to fighting |
| Nurse | Works around a pharmacy/clinic | One basic health recovery interaction |
| Construction worker | Moves around construction barriers | Unlock clue for a future road opening |
| Busker | Stands near park or plaza | Ambient music/message and small event |

Add dialogue and affordances only if reachable through movement and collision.
No NPC should spawn inside walls, road traffic, or locked facades. Use a suitable
`npcId` / `type` rather than changing existing save IDs. Test collision, chase,
talking and animation on PC and mobile.

### P3 — Expand district with buildings and props

First replace the procedurally rendered outer blocks with consistent sprite
facades and place a compact connected second street (clinic/pharmacy ↔ restaurant
↔ apartment ↔ laundromat), not a huge empty map. Use distinct passable doors and
small interaction trigger areas. Collide with building wall bases, **not the
entire image rectangle**, since rooftops are visually tall and may overhang paths.

Populate sidewalks and park with the 16 props where they improve navigability.
Tall lights and signal poles need small base colliders. Manholes, drains and tactile
paving are floor decals, not impassable obstacles. Use a behind/in-front depth
layering strategy keyed by foot/base Y. Keep vehicle route clearance.

## Mandatory visual and technical QA before claiming integration

- Review every extracted frame for colored edge pixels, holes, antialias halos,
  inconsistent identity, incorrect left/right orientation and foot drift.
- Compare directly to user's city-reference image: current game world is more
  overhead than these high-detail candidate sheets, so art direction needs
  adaptation and possibly new overhead-only images.
- Use PNG transparent alpha, nearest-neighbour draw, actual runtime scaling. Test
  40×48 and at least one alternate candidate size; do not resize merely because
  a source sprite is large.
- Validate scenery collision on all sides, NPC pathfinding, entrance reachability,
  foot-sorting, pedestrian/vehicle overlap, scene transitions and saved games.
- Run relevant existing tests (`city`, `city-graphics`, `city-stability`,
  `city-runtime`), then smoke test other WoojinHub games. Compare actual in-browser
  1280×800 and 390×844 screenshots; physical mobile still unverified until tested.
- Keep the existing public/private audience unchanged and avoid deploying
  new artwork without a verified runnable branch.

## Checkpoint handoff to Astra

**Entry point:** compare the latest GitHub branches first. This independent art
branch may lag behind active Claude/Astra work. Use `assets/gtw-candidates-20261105`
as a source library, not as a completed feature. Import/cherry-pick only reviewed
changes and prefer a feature branch or PR. Existing graphics workflow is in
`docs/GTW-GRAPHICS-HANDOFF.md`.

If interrupted by quota/time: commit a passing, coherent increment to the feature
branch, update a dated checkpoint document with exact current commit SHA, tests
run/passed/failed, remaining frames and next command. Do **not** claim success if
the game was not actually loaded and played. Resume by checking the last verified
checkpoint and dirty status, not by repeating finished generation.
