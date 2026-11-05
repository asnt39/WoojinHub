# Woorio v21 — playable vertical stages and boss encounter

## Intent

Correct the visually empty/repetitive new stages and make all eight worlds play like a deliberate pixel platformer. Preserve WoojinHub's existing four-game shell and the adventure save key.

## Scope and decisions

- Stages 1–5 alternate between low and raised ground, step-like brick formations and safe upward routes, with recognizable stage-specific scenes rather than flat ground repeated.
- Stages 6–7 introduce dense but traversable elevated routes with clear footholds, difficult jumps, active enemies and hazards. Stage 8 becomes a boss arena reached through climbing and jumping.
- Stage 8 boss is defeated only by collecting special airborne ammunition and hitting it; the final flag is gated until boss HP reaches zero. Attacks and dodge windows must be readable.
- Giant mode destroys spikes upon contact, with the obstacle remaining gone for the current attempt. Non-giant spike contact remains fatal.
- Falling out of the world triggers a distinctive rebound death arc and transition. Dead players reset used/broken lucky boxes and temporary items.
- Re-acquiring pet while accompanied upgrades Maltese companion Doobu to gold, with visibly distinct sprite and UI.
- Upgrade touch controls with larger distinct silhouettes and visual pressed state; maintain existing input mapping and preserve responsiveness on mobile.
- Existing game storage key, stage order, other three games, and hub appearance remain unchanged.

## Approaches considered

1. Keep procedural level and only add visual overlays: fast but repeats the current failure to provide differentiated, verified platform routes.
2. Replace all stages with hand-authored tilemaps: expressive but high-risk for a rushed change and incompatible with much of the current collision design.
3. **Chosen:** retain the physics engine, evolve stage generation to intentional elevation and step routes, add a dedicated boss arena and scripted interactions. Provides variety with bounded changes.

## Validation / risks

- Dedicated headless tests for raised ground, structural reachability, stage 6–8 unique features, sprite/character existence, giant spike breaking, lucky box reset, gold Doobu, falling death animation, boss item combat/goal gate, and regression from the other games.
- Browser visual check including frame start. Mobile touch responsiveness and real player difficulty still need device playtesting; geometry verification is not proof every level is enjoyable.
