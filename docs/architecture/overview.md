# Architecture Overview

## Goal

ECHO's prototype architecture is designed around a strict separation between presentation, deterministic game rules, authored content, and runtime assets.

## Boundaries

### `src/screens/` and `src/components/`
UI and interaction only. Screens render current state and dispatch player intent. They should not contain narrative requirements or hard-coded story outcomes.

### `src/game/`
Deterministic game rules: world state, event resolution, Echo state, journal generation hooks, save/load, migrations, and time handling.

### `src/content/`
Authored data: locations, events, Echo definitions, localization, journal lines, requirements, effects, and balancing values.

### `public/assets/`
Runtime art and audio. Asset references should use stable IDs/paths defined by content data rather than being embedded throughout UI code.

## Vertical-slice systems

1. World state
2. Location state
3. Event resolver
4. Echo state
5. Journal
6. Save/load
7. Delayed follow-up scheduler

## Design constraints

- Persistent choices must restore deterministically after reload.
- A location should support major visual states plus smaller swappable layers.
- New events should usually be authored as data rather than custom UI code.
- Mobile touch interaction is the primary input model.
- Portrait and landscape remain open until both prototypes are tested.
