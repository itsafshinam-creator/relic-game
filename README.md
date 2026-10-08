# RELIC — The Lost World — Modular Final 1.0

This build is refactored from the previous RELIC Final Test Build into a modular ES-module project.

## Structure
- `index.html` — only page shell / UI markup
- `css/style.css` — all styles
- `src/main.js` — composition/bootstrap only
- `src/core/` — configuration, Three.js/Telegram loading, state, persistence
- `src/data/` — characters, enemies, resources, items, quests
- `src/world/` — world construction and material cache
- `src/entities/` — player controller
- `src/systems/` — input, combat, AI, interaction, progression
- `src/ui/` — HUD/menu updates
- `assets/characters/`, `assets/enemies/`, `assets/environment/`, `assets/objects/` — reserved for future GLTF/GLB/texture/audio assets
- `vendor/` — reserved for locally hosted third-party libraries

## Important rule
Content values should be changed in `src/data/` or `src/core/config.js` first. Avoid putting gameplay numbers into `src/main.js`.

## Running
Because ES modules and Telegram Web Apps require a web origin, do not open `index.html` with `file://`. Host the folder on HTTPS (GitHub Pages is suitable for testing).

## Optimization included
- Shared material cache
- Capped device pixel ratio
- Reused geometries for repeated trees/rocks
- Data-driven spawns
- Separate systems for movement/combat/AI/UI
- No framework/build dependency required
- LocalStorage save remains offline for testing
- Existing Three.js CDN fallback strategy preserved

## Production still needed
This is a modular playable test build, not a production online MMO. A production release should add server-side accounts/progression, Telegram initData validation, server authority/anti-cheat, asset pipeline, pooling/culling/LOD/chunk streaming, analytics, backend economy and optional Web3/token integration.
