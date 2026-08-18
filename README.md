# ECHO

ECHO is a calm illustrated 2D adventure about places, memories, and a world that remembers decisions.

This repository contains the web/PWA prototype used to validate the core loop before native mobile packaging.

## Current phase

**Phase 0 — Foundation**

Goals:
- establish repository and documentation structure
- define architecture boundaries between game rules, content, and assets
- define the asset pipeline and naming conventions
- prepare GitHub Pages deployment
- keep the project ready for portrait/landscape prototyping

No gameplay logic is implemented in Phase 0.

## Planned prototype stack

- React
- TypeScript
- Vite
- PWA support
- Vitest
- Playwright (later)
- GitHub Actions / GitHub Pages
- Capacitor (after the web vertical slice is validated)

## Core architectural rule

`src/game/` contains reusable game rules.  
`src/content/` contains locations, events, Echo definitions, text, and balancing data.  
`public/assets/` contains runtime art/audio assets.

A new narrative event should normally be addable without changing React components or core engine code.

## Vertical slice target

World Map → Old Mill → Hotspot → Echo selection → Reaction → Choice → Persistent world change → Journal entry → Delayed follow-up.

## Documentation

- `docs/architecture/` — technical decisions and state/event architecture
- `docs/art/` — art direction, asset naming, manifests, and production rules
- `docs/gdd/` — implementation notes derived from the Game Design Document

## Status

Phase 0 in progress.