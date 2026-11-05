# Woorio stage/placement/art polish — WIP
Branch feat/woorio-stage-polish based on latest Sites merge ecdbbae (v24), not old GitHub main.
No deployment authorized. Other game files and saves must remain unchanged.
## Baseline classification
- Implemented + v24 test passed: nine stages; 3/6/9 boss kinds; shoes/shield/giant/fire;
  spring/crumble/elevator/conveyor/timed switches; bats/turrets; fixed box rewards;
  monster respawn; boss checkpoints; ability gauge; pet55/65 range; fire lifetime.97.
- Errors reproduced: stars inside filled stairs, patrol swept rectangles cross solids,
  stationary turrets clamp to x0, stomp-transformed enemies keep wrong identity after death.
- Partial/underdeveloped: common stage layout generator; bosses differ in projectile
  spread but have no readable windup/recovery or required distinct multi-phase actions.
- Unverified baseline: full nine stage clear, actual boss item pickup-to-kill play,
  mobile physical hardware. Previous v24 tests teleported shots for boss damage.
## Placement checkpoint
- Nine height profiles and selective bridge/alternate route structures added, common
  generator retained (not yet full nine bespoke levels / vertical tower camera).
- Full coin collection bounds clean, safe patrol intervals chosen before snapshot,
  stationary turrets keep own position, original enemy type restored on death.
- Tests passed: adventure-placement, adventure-unit, adventure-v24, adventure-v22.
- Local real-input jump search 128/132, failed stage5 gaps8/10 andstage6 gaps13/14.
  Trace includes deaths from active enemies; no claim maps impossible or full clear.
  Needs further approach timing/AI and level QA. Do not hide this failure.
- Graphic source7749.jpg opened. Extraction currently in progress; runtime untouched.

## Graphics / UI / boss checkpoint (partial delivery, not deployed)
- Source7749.jpg preserved at assets/woorio-reference/7749.jpg. Manually inspected
  crop regions; threshold mask + largest silhouette + hole filling removes gray grid.
  Original image is not edited. scripts/prepare-woorio-art.py reproduces10poses and
  8buttons. Runtime hero atlas64x80, feet32,72; no interpolation; supplied independent
  left/right poses used. Landing11/100sec, run contacts, jump and idle integrated.
- Actual screenshots opened at docs/woorio/{desktop,mobile,landscape}.png. Pixel
  silhouette is visibly improved. Boss art remains prior procedural art, not claimed
  as final authored boss sprites. JPG source limits fine alpha edge accuracy.
- Label-free purple movement, green jump, gray/orange fire; pointer press states,
  fire readiness including cooldown and pause, retained pointer capture/multitouch.
- Ability/boss meters overlay viewport so game never shifts on grant/expiry. Stages
  collapsed by default, in-play stage change confirms. Fullscreen feature-detected.
- Existing bosses reused: stone alternates ground shockwave and aimed rock, vulnerable
  to stomp; storm alternates dash and low saw projectile; shadow spreads aimed shots
  and warns by crumble timer before changing arena ledges at low HP. All warn.8/.9sec
  then recover>=1.05sec. Names match request. Position/pattern/phase reset on death.
- New warning markers on shadow bat/turret; basic abilities and balance retained.

## Latest actual tests
PASS: adventure-unit/v20/v21/v22/v24; adventure-placement; adventure-boss-phases;
adventure-power-duration (four exact timers, gauge ratio, expired body dimensions,
original stomped enemy identity after death).
PASS real Chromium adventure-polish-browser:1280x800,390x844,844x390; canvas grant
stability; fire state; two-finger move+jump/release; real special-projectile travel
hits on all3bosses AFTER pickup. Isolated player setup/invulnerability used; not a
complete boss battle, no projectile teleport or HP overwrite in this browser test.
PASS existing grow browser.cjs and merge.cjs, GTW combat-unit/city-runtime. No other
product code changed; save key `woojin-adventure-v1` intact.

FAIL / unverified (must disclose)
- Final actual-input local jump search129/132. Full log docs/woorio/local-jumps.jsonl.
  Enemy interactions remain enabled; timings and approach routes need further study.
- Full nine stage AI attempt0/9, max4deaths each, one timing variant, no warps/state
  edits: docs/woorio/ai-playthrough.jsonl. Not proof of impossible maps, not a clear.
- Nine map profiles / selective alternate bridges are PARTIAL structural differentiation;
  common generator still used, no complete vertical tower camera or bespoke9maps.
- Every star has static clear bounds/support height validation; every individual star
  or optional platform NOT reached by physical bot. Static check != physical reach.
- Full boss dodge/defeat/exit and mandatory final mechanism fair-difficulty playthrough
  remain unverified. Old v24 HP loop uses shot teleport and is NOT clear evidence.
- Real mobile hardware/fullscreen API behavior/performance long run not measured.

## Resume
No publication: user explicitly requires separate approval. Work only on this branch,
not old GitHub main. Run node tests/adventure-placement.cjs and the unit suites first.
Preview: python -m http.server 8765 --directory dist.
Then node tests/adventure-polish-browser.cjs. AI commands are in tests/adventure-ai-*;
expect nonzero for the recorded diagnostic failures. First priority: investigate the
three failed local crossings with AI_TRACE/AI_GAP, then full approach routes and
mandatory stage-specific geometry. Keep existing9boss/capability systems; don't redo.
Safe source rollback:ecdbbae baseline or placement checkpoint800500a on this branch.
Keep saves; never force push. Public site has not been updated by this task.

## Diagnostic correction checkpoint
- Source checkpoint b303fb3 confirmed pushed to GitHub.
- Local jump test's1.5sec horizon truncated a spring-assisted successful crossing
  in stage2 gap9 while the player was still airborne. Extended observation to2.5sec;
  success still requires a real grounded landing beyond the gap, with hazards/enemies
  enabled. Final130/132, not129/132 above. Remaining stage5 gap10 andstage6 gap14
  traces include enemy/spike hits; leave unresolved, do not infer impossible geometry.
- Full input bot remains0/9. Logs retain exact failure coordinates/causes. Next work
  needs approach-aware waiting, combat and platform planning; not relaxed success.
- Published site is untouched. Both code checkpoints saved on feat/woorio-stage-polish.

## Publication authorization — 2026-11-06 (KST)
User now explicitly authorized deploying this checkpoint and asked that future edits
include deployment by default. This supersedes the previous no-publication rule
above. See DEPLOYMENT-PREFERENCES.md. Fetched Sites HEAD ecdbbae and confirmed it is
an ancestor, so no newer user code is being overwritten. Current public audience
revision4 retained. Before packaging, re-ran placement, boss-phases, power-duration
and actual Chromium PC/mobile polish test successfully. Existing AI limits unchanged.

## Confirmed deployed checkpoint
- Published source c513bd123f0e861cf476d436fa33d175bc0cbfd2, Sites version26:
  appgprj_6ae9c47115308191b262fff9998049d6~appgver_f3852dc6db848191a28422ae1f7177b7.
- Deployment appgdep_6aecb064de0081918376e42c4f01e5d7 returned succeeded.
- URL https://woojingame.asnt1.chatgpt.site/#adventure ; public audience preserved.
- Gameplay limitations still130/132 local jump probes and0/9 full AI clears.
  Publication success does not change those results. This last note is docs-only.

## Superseded by distinct room maps
See WOORIO-V26-HANDOFF.md and feat/woorio-distinct-maps. Old132gap counts and repeated
room layout are no longer current; new maps have50gaps, local jump probe50/50.
