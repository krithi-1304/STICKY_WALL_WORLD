# Black Wall Design System

## Direction

Warm nocturnal gallery: matte black wall, flax thread, colored pushpins, handwritten paper, plaster tape, and quiet torchlight. Pinterest is a reference for curation and tactile layering, not a reason to copy a masonry feed.

## Current source of truth

- Runtime tokens: `web/src/styles/tokens.css`
- Surface styles: `web/src/index.css`
- Domain palette and handwriting: `web/src/domain/types.ts`
- Room identity: `web/src/domain/symbols.ts`

## Tokens

- Wall: `--bw-black`, `--bw-charcoal`, `--bw-ash`
- Text: `--bw-text`, `--bw-text-dim`, `--bw-text-faint`
- Accent: `--accent`, `--focus-ring`
- Materials: `--tag`, `--thread`, `--tape-washi`, `--tape-clear`
- Motion: `--ease-out`, `--ease-land`, `--dur-fast`, `--dur-med`, `--dur-slow`

## Component language

- `RoomTag`: thread + colored identity pin + paper tag
- `StickyNote`: paper + tape + handwriting + thread-hung date
- `FontPicker`: progressive disclosure for handwriting choice
- `FloatingActionRing`: one primary add action, secondary wall actions hidden until asked

## Motion rules

- Use motion to explain physical material: hang, lift, settle, sway.
- Prefer smooth ease-out over bounce or elastic easing.
- Never use infinite motion for decoration unless it is extremely subtle and meaningful.
- Disable or simplify motion under `prefers-reduced-motion`.

## Accessibility rules

- Interactive tag and control targets: minimum 44px.
- Every icon control has an accessible label or title.
- Never use color as the only meaning for room or note state.
- Preserve keyboard movement, focus visibility, and text editing.

## Audit notes

The first Impeccable audit found a decorative grid-line signature and bounce easing. The grid should only remain where it communicates wall/canvas structure; replace generic decoration elsewhere. Replace bounce easing with calm ease-out before calling a redesign complete.
