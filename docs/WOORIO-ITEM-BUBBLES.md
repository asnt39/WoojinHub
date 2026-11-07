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
retain their previous32x30/34x28logical dimensions and render at even positions,
so the half-resolution Canvas never lands them on half-pixel origins. Existing dog
shape,relative size,pet ability and collection behavior are preserved.
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

## Owner-approved publication — supersedes no-deploy instruction above
2026-11-07:owner explicitly requested publication after implementation.
Sitesv40 SUCCEEDED2026-11-07T02:32:22UTC(11:32KST),public audience retained.
Sourcee7b1e2fdb1ec8eef2087f0679784ea1642a72e1d;remote Sites main was70eac3e,
confirmed ancestor before fast-forward push. Exact tracked static archive uploaded.
Versionappgprj_6ae9c47115308191b262fff9998049d6~appgver_074bfd93ac988191a38d5cc5a21db466.
Deploymentappgdep_6aee8da8ab388191ada63a5a97ab3768.
URLhttps://woojingame.asnt1.chatgpt.site/#adventure.
Sprite regression unit rerun PASS;product unchanged from tested feature commit.
Native publication success confirmed;physical Samsung playthrough not claimed.

## Size / immediate pickup correction — latest behavior
Owner feedback afterv40:icons were too large. Display now24logical(icon),32logical
(bubble),half ofv40's48/64;24x24hitbox unchanged. This supersedes the larger-display
notes above. At390wide this is approximately14pxicon/19pxbubble,similar to old pickups.
Removed the.24second collection age gate for ALL5types. Test overlap before physics
integration and after movement,so an item already touching at spawn is collected on
that first simulation tick even if its upward velocity would move it away.
PASS woorio-instant-pickup(all5age-zero grants),woorio-item-sprites,ability duration,
item-bubbles browser andrun-shield browser. Updated mobile screenshot opened.
Owner requests publication;audience retained. No other ability/save changes.
