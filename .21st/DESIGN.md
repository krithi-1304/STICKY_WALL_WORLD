<!-- Project-aware context for 21st.dev. Source decisions live in design.json. -->
# Black Wall Sticky Note World

## Project

- Product type: creative journaling canvas / personal gallery
- Stack: Vite, React, TypeScript, CSS variables, Zustand
- Theme: dark, warm, tactile
- Density: sparse

## Design direction

Warm nocturnal gallery. The black wall is the stage. Rooms hang as paper tags on flax thread. Notes are colored paper with handwriting, plaster tape, and small memory labels. Pinterest is a reference for curation and tactile layering, not for copying a masonry feed.

## Must preserve

- Black wall as the primary stage
- Warm paper palette and handwritten typography
- Colored room identity pins
- Visible focus and keyboard access
- Reduced-motion support
- One clear primary add action

## Avoid

- Generic SaaS dashboards
- Unrelated component-library chrome
- Bounce or elastic easing
- Decorative grid noise without canvas meaning
- Adding a component without checking it against the paper/thread/tape language

## Source files

- Tokens: `web/src/styles/tokens.css`
- Styles: `web/src/index.css`
- Components: `web/src/components/`
- Product brief: `PRODUCT.md`
- Full design system: `DESIGN.md`
