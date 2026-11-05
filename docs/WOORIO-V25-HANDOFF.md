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
