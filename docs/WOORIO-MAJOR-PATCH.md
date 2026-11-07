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
