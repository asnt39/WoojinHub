# Woorio arcade presentation / powers / difficulty — 2026-11-06

Branch feat/woorio-arcade-audio based on b7d0397. Fetched Sites dd8de1d (ancestor).
Owner default is validate then publish; preserve current public audience. No save
migration or other game product edits. Existing `woojin-adventure-v1` key is unchanged.

## Delivered
- At most2pet rewards per stage attempt INCLUDING checkpoint respawns. Planned boxes
  capped at2; runtime cap also guards giant-triggered/custom item sources. A new stage
  or explicit retry starts a new round. After quota, pet reward becomes shield; cap
  is not reset on death. This intentionally takes priority over repeating a pet drop
  from the same previously used box. Other fixed rewards remain deterministic.
- Clear pointed shield item silhouette and matching badge beside player, replacing
  generic cyan square frame. Ordinary one-hit8sec shield rules unchanged.
- Giant contact destroys urchin-like saws using circle/AABB collision, spikes,
  non-ground walls/ledges/boxes/gates and belts. Box reward still emits. Destroyed
  gates stay destroyed; dead saws stop rendering/colliding. Death resets obstacles.
  Ground remains load-bearing, pits remain lethal, bosses retain combat health.
- Boss health3/6/9stages now6/9/14 (previous4/6/9). Warning/recovery windows preserved.
- Enemy totals by stage6,6,7,9,10,10,15,15,27. Added enemy placements still go through
  full postassembly motion envelope validation. Late crumble warning .58sec vs.72.
- Notice moved outside ABOVE viewport, fixed38px shelf (30px landscape), so messages
  never move/cover game. Pixel skyline/star/tile page surrounds authored in CSS.
- Local Galmuri11@2.40.3 pixel font, SIL OFL license retained in dist/fonts.
  Downloaded from jsDelivr package dist; no external runtime font request.
- Original64step WebAudio pulse/triangle BGM in woorio-audio.js, no sampled/copyrighted
  game track. Starts only on game start user gesture; independent BGM switch, pause,
  hidden/finished game silence. Scheduler runs only with visible game frame, short
  audio horizon, voices disconnected after release. No autoplay bypass in final test.
- Fixed landscape CSS grid intrinsic canvas sizing that previously clipped bottom;
  now bounded track shows whole canvas alongside controls.

## Actual validation
PASS new adventure-arcade.cjs:2drop cap across respawn, saw/gate destruction and reset,
late monster increase, boss health6/9/14. It was RED on old uncapped runtime.
PASS adventure-room-physics: all40boxes activated by engine jumping;20secs per map
of dynamic enemy/structure collision checks. PASS placement/sweeps/boss-phases/
power-duration. Existing adventure-unit/v20/v21/v22/v24 also passed.
PASS actual Chromium arcade-browser: real AudioContext running and oscillator notes,
BGM start/mute/pause/resume, local font loaded, notice clears canvas and does not shift
it, desktop1280x900/mobile390x844/landscape844x390 (whole canvas fits screen).
PASS existing adventure-polish-browser: multitouch/release, UI, boss projectile hits;
grow browser.cjs and merge.cjs regressions. No physical mobile/audio hardware audition.
Screenshots docs/woorio-v27/{desktop,mobile,landscape}.png opened and inspected.
Latest AI logs: local-jumps50/50; full input bot1/9clear. Full9clear not verified;
more health and enemies are deliberately harder. Do not label this full difficulty
playthrough. Same limits for human mobile performance as previous handoffs.

## Resume
Run python -m http.server 8765 --directory dist and
node tests/adventure-arcade-browser.cjs; node tests/adventure-arcade.cjs;
node tests/adventure-room-physics.cjs; node tests/adventure-sweeps.cjs.
Next: human playtest later enemy density and long boss fights, richer upper-route AI.
Avoid reintroducing live external font/music dependencies or resetting existing saves.

## Confirmed deployment
- Source bf5de2338e8f0b512759afd94a39cd15a78ebe96 pushed to GitHub and Sites.
- Sites version28: appgprj_6ae9c47115308191b262fff9998049d6~appgver_a253ef9a05f08191aed7436d8f37bc13.
- Deployment appgdep_6aecb8beb4348191aafea18f7a7db700 returned succeeded.
- URL https://woojingame.asnt1.chatgpt.site/#adventure , public audience preserved.
- Final docs-only record commit is not required in runtime archive. All gameplay
  validation limits, including1/9full AI clears, remain as above.

## Corrected by user
See WOORIO-V28-HANDOFF.md: maximum2pet-assigned boxes, not lifetime drop budget.
Mobile landscape and fullscreen behavior supersede this version.
