# Woorio local low-death ranking + image share — 2026-11-07

## Scope / status
- New code on GitHub branch `feat/woorio-death-leaderboard`, branching from `feat/gtw-world-systems`. NOT merged to `main`.
- Public WoojinHub site v34 is unchanged by this GitHub work. No Sites deploy tool exposed in this chat, so **NOT deployed**.
- Player request: when all stages 1–9 completed, show total deaths and collected stars/light fragments, enter nickname, rank lower deaths first, share results.
- Implementation uses a **browser-local leaderboard only**, not a global leaderboard visible across phones or browsers. Connected Supabase accounts have no accessible projects, so no remote data store was created and no public score claims should be made.

## Modified/new source
- `dist/woorio-leaderboard.js`: run model, `woorio-ranked-run-v1`, `woorio-local-ranking-v1`, `woorio-last-finish-v1`. Only sequential progression 1→9 ranks. Saves after each death and cleared stage. `retry` preserves cumulative deaths, `select` invalidates run unless entering stage 1 to start anew. On refresh, offers an option to resume from last cleared-stage checkpoint (restarts the current stage, not mid-stage).
- Scoring: 9-stage cumulative `deaths`, and only within-run total collected light fragments `◆` (not legacy lifetime `total`). Lower deaths first; equal deaths: more fragments first; then earlier recorded time. Nicknames 1–12 characters, NFKC normalized, plain text DOM rendering, per-name best preserved. Last result stored for nickname submission.
- `dist/adventure.html`: HUD death counter, end panel with nickname form + final stats + ranking link + share button, collapsible local ranking.
- `dist/adventure.js`: integrates game death/clear/retry/resume into model, renders results, creates pixel 800x480 PNG card. Native Web Share file menu if available; otherwise triggers PNG download. Card includes nickname, TOTAL DEATH and light fragments.
- `dist/woorio-ranking.css`: navy/gold retro theme, narrow viewport handling.
- `tests/woorio-leaderboard.cjs`: model assertions including cumulative deaths/stars, sequential validation, reruns, persistence and tie breaks. Do not infer runtime browser success from static assertions.

## Verification actually done
- Fetched all affected source from remote branch, parsed both JavaScript modules using JavaScript Function constructor and tested the rank model in an isolated JS environment; all assertions passed.
- Executed the game source with a mocked DOM/canvas and passed a simulated 1→9 stage sequence including one death. Test forced boss HP to zero and warped hero to exit (not a human complete playthrough), resulting in `{eligible:true,deaths:1,fragments:0}`.
- New Node test file committed but not independently executed through `node` in a checkout. Chrome/Samsung Internet, touch, image-sharing permissions, the download fallback, real gameplay, and legacy full-regression suite remain **untested** in this task.

## Important follow-ups
1. Work in this feature branch; run `node tests/woorio-leaderboard.cjs`, existing Woorio unit/browser tests and all-other-games smoke tests.
2. Open desktop + Android real browser; test 9-stage in-game completions, repeated deaths, retry/refresh, leaderboard, special characters and PNG/native share.
3. Deploy the tested exact branch using the authenticated Sites project workflow, preserving other games and saves; check deployed version. GitHub push alone is not a Sites deployment.
4. A **shared online ranking** needs provisioned database/backend plus anti-fraud verification. Client-side death counts can be modified, so do not claim tamper-proof or globally fair rankings from this local version. Project creation may cost money; seek user approval.
5. If sharing fails in an iframe, check browser Web Share permissions policy, user gesture requirements and download fallback; avoid silently discarding scores.

## Backward compatibility
- Keeps original `woojin-adventure-v1` storage and `total/unlocked` fields unchanged. New ranking data uses distinct localStorage keys. GTW and other games were not edited.
