# Black Wall Design System

## Direction

Warm nocturnal gallery: matte black wall, flax thread, colored pushpins, handwritten paper, plaster tape, and quiet torchlight. Pinterest is a reference for curation and tactile layering, not a reason to copy a masonry feed.

## Story: The Night Archive

The lobby is the threshold at dusk. Each room is a small world suspended from the archive's thread. A room pin is its constellation mark. Opening a room is crossing a curtain into a private wall. Notes are artifacts of a day: imperfect paper, a little tape, and a date tag still swinging from its thread.

The user should feel invited, oriented, absorbed, connected to time, and safe to make.

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

## World motion architecture

- Foreground: pointer torch and direct note movement. Responsive and purposeful.
- Middle ground: room sway, paper settle, and tape lift. Short and event-driven.
- Background: sparse low-contrast atmosphere. It gives depth without competing with notes.
- Threshold: one mist-to-focus reveal. Do not stack entrance effects.
- Prefer Framer Motion for coordinated React transitions; use CSS for material texture.
- Every ambient animation needs a reduced-motion fallback and a contrast cap.

## Intentional audit exceptions

- The two-axis gradient advisory in `web/src/index.css` belongs to the checker washi tape material, not a page background.

## Accessibility rules

- Interactive tag and control targets: minimum 44px.
- Every icon control has an accessible label or title.
- Never use color as the only meaning for room or note state.
- Preserve keyboard movement, focus visibility, and text editing.

## Audit notes

The first Impeccable audit found a decorative grid-line signature and bounce easing. The grid should only remain where it communicates wall/canvas structure; replace generic decoration elsewhere. Replace bounce easing with calm ease-out before calling a redesign complete.
