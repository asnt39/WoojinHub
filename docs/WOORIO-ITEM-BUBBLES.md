# Woorio item bubbles — 2026-11-07 KST

Branch feat/woorio-item-bubbles, based on27c3cbd (published product70eac3e/v39).
Fetched origin before starting;clean working tree. Sites latest version39. No site
source push,version save,publication or access mutation authorized/performed.

## Source / art decisions
Inspected adventure.js itemArt/world.items/bump/grant and pixel-art.js dog/cache.
The supplied inline1280x720 reference was viewed. No original file was exposed in
workspace attachments,so three shapes were hand-reconstructed as24x24 pixel art
in woorio-item-sprites.js. These are close low-resolution adaptations,not exact crops.
Reference roles:yellow/orange fire core with red left tail pointing right;blue single
shoe with upper rear white wing;ivory person with pink outline/yellow expansion marks.
Feather detail and curves necessarily simplified. No image-generation service used.

Runtime creates and caches3transparent24px canvases and1translucent32px bubble once.
Actual game context scales logical coordinates by.5,so field icons draw48logical pixels
and bubble64logical pixels to retain ALL source pixels (24/32native canvas pixels).
Hitbox remains24x24;collection age>.24,physics coordinates/gravity/rewards unchanged.
Bobbing moves render only by0..4logical pixels,always above floor;terrain mask also
prevents icon/bubble/pop paint into intact adjacent platforms. Stepped rim,upper-left
white highlights,lower reflected line,sparse sparkle. Pop8short rays expires.24s;
max12simultaneous,cleared on restart/death. Pause follows existing simulation.

No external image-loading dependency. If module is unavailable,optional integration
falls back to existing itemArt and gameplay continues. Four PNGs under art/woorio/items
are reproducible exports of the exact runtime glyphs,not separate untested artwork.
Regenerate from repo root: node scripts/export-woorio-items.cjs.

## Scope / protection
All5field item labels removed;HUD/power names,timers,notices retained.
Bubble onlyfire/shoes/giant. Shield original pixel drawing retained. Dog source rows
and palette unchanged. Removed solid blue square behind dog item. Dog item/follower
now render32x20logical at even positions:exact2x source geometry vs previous uneven
32x30/34x28stretch,so boundary columns do not shimmer. Dog is slightly shorter as a
consequence of restoring original sprite aspect;no pet ability or collection changes.
No save schema/key changes;no modifications to other games or ranking module.

## Actual checks
PASS node tests/woorio-item-sprites.cjs:transparent corners,24pxsize,bubble alpha26/255
at center,object identity caching,1000renders only4canvas allocations,unmodified item
physics object,ground AND side-block clipping,pop cleanup,pet/shield exclusion.
PASS node tests/woorio-item-bubbles-browser.cjs (server8765):real luckybox bump spawns
24x24item;PC1280x800/mobile390x844 screenshots opened;all3types visibly present;no field
text;3real collection grants andpop lifecycle;module-abort fallback still playable;
no uncaught page errors. Screenshot items use arranged positions for comparison,
not a claim of a natural full-stage playthrough. Render clipping tested separately.
PASS adventure-unit.cjs,adventure-v24.cjs,adventure-power-duration.cjs,
woorio-major-unit.cjs,woorio-leaderboard.cjs,ui-polish.cjs.
PASS browser testswoorio-run-shield-browser.cjs,woorio-ranking-motion-browser.cjs,
woorio-major-browser.cjs. Shield retained30s andthrough timed ability expiry then
absorbs a hit;companion without attack andEX regressions retained.
No physical Samsung Browser / GPU / battery performance test. Allocation bounds
are NOT proof of60FPS. Existing tests/adventure.cjs full combat playthrough not run;
previous EX AI0/1 limit remains. No claim of zero bugs or fixing earlier jump report.

## Review / next steps
Screenshots docs/woorio-items/{desktop,mobile,sprite-preview}.png opened and inspected.
Mobile items now roughly28px icon/37px bubble at390wide:recognizable but larger than
old pickups;physics intentionally unchanged. Terrain mask can partially hide a bubble
while emerging from its box or touching a wall. That is intentional,not broken alpha.
Check physical-device readability and acquisition feel before publication. User has
explicitly requested no publication for this task. Re-read latest instruction before
any later deploy. Resume from feature branch and run unit + browser checks above.
