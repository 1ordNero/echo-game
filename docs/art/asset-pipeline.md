# Asset Pipeline

## Phase 0 rule

Produce only assets that validate composition, readability, state changes, and the visual identity of the vertical slice. Avoid producing the full MVP asset catalogue before the Old Mill benchmark is proven.

## First asset batch

### Environment
- World-map composition study
- Old Mill — ABANDONED
- Old Mill — DISCOVERED
- Old Mill — REPAIRED
- Old Mill swappable layers: waterwheel, water, vines, nest, light

### Echoes
- Lumen concept + clean idle pose
- Drip concept + clean idle pose
- Mossi concept + clean idle pose

### UI
- location panel / story panel
- choice card
- Echo card frame
- journal paper/card treatment
- navigation icon style sample

## Preferred runtime formats

- `.webp` for opaque/full-frame raster illustrations
- `.png` or `.webp` with alpha for transparent layers, depending on export quality
- `.svg` for simple UI icons when stylistically appropriate
- `.ogg` / `.mp3` for web audio prototypes; native packaging can be revisited later

Keep layered source files outside the runtime asset folder if they are large production sources. Runtime exports belong in `public/assets/`.

## Naming convention

Use lowercase kebab-case and semantic states.

Examples:

- `old-mill-abandoned.webp`
- `old-mill-repaired.webp`
- `old-mill-layer-waterwheel.png`
- `lumen-idle.png`
- `lumen-ability-light.png`
- `ui-choice-panel.webp`

Never use filenames such as `final2.png`, `image23.png`, or `new-new.png`.

## Composition safety

Until portrait vs. landscape is decided, environment art should preserve a generous safe central composition. Important interactable objects should not sit directly at the extreme left/right or top/bottom edge.

Create composition studies before expensive final rendering.

## Layer rules

A major location state should not require repainting every small choice. Use reusable layers for meaningful but local changes. Every transparent layer must be exported against the same canvas dimensions and origin as its corresponding location background so it can be positioned at `0,0` without manual alignment.

## Asset review gate

Before an asset is treated as production-ready, check:
- readable on a small phone
- silhouette/value hierarchy is clear
- hotspot remains identifiable without a glowing game-like marker
- state change is visible at a glance
- style is consistent with material-first Echo design
- file is named and entered in the asset manifest
