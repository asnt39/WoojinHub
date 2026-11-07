# Woorio major patch — 2026-11-07 (KST)

Base: current Sitesv38 source5cb3bde;GitHub main9cab50c is older. Clean branch
feat/woorio-major-patch. Preserved latest other-author jump camera quantization fix.
No publication authorized. Only Woorio code modified.
Baseline PASS adventure-unit,woorio-leaderboard,adventure-power-duration.
Known report: Samsung Browser airborne trembling not reproduced previously;physical
phone remains unverified. Do not claim this patch fixes it.

Checkpoint1: clipped every platform's texture to its own rectangle (existing loops
could draw y+50,x+9 detail outside short tiles);unified font CSS,boss name red,
warning/enrage outline without boss attack changes,item names,contrasting gauge,
feature-detected optional weak haptics. Units and duration/ranking tests passed.

Checkpoint2: removed only companion auto-kill;retained follow,gold transformation,
collection range and death reset. Fire480 vs345,life.70 vs.97 yields336 vs334.65
nominal horizontal range. Substeps<=6px prevent narrow-hit tunneling. Enemy0 chase
multiplier2.05 (stage4+) vs1.8;projectile enemies slightly shorter cooldown,min floors
unchanged. No boss attack logic edits. Three costume palettes share the same hero
atlas/collision;separate optional woоrio-skin-v1. EX uses new9room layout over existing
factory theme,23enemies,8gaps,combined moving/crumble and cycling spikes. 9-stage
ranking untouched;EX is explicitly unranked. Eight isolated EX ground-gap physics
checks passed;full EX traversal not proven.
