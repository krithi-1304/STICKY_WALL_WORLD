---
name: ui-design
description: Use when designing UI, UX flows, visual systems, components, layouts, motion, or aesthetic direction for Black Wall Sticky Note World (and related screens). Trigger on UI design, design system, mockups, wireframes, sticky note visuals, lobby tags, room canvas, peaceful aesthetic, creative layout, design critique, or design tokens.
---

# UI Design Skill Harness

Peaceful · Creative · Aesthetic · System-designed

Load this skill before any visual or interaction design work on **Black Wall Sticky Note World**. Do not invent one-off styles; follow the harness, then specialize.

## When to use

- New screens, components, or flows
- Visual direction, tokens, motion, empty states
- Design critique or redesign of existing UI
- Lobby (room tags), room canvas, stickies, tape, wall paint

## Design north star

| Pillar | Meaning | Test |
|--------|---------|------|
| **Peaceful** | Low noise, slow breath, generous space | Could someone stay here for an hour without fatigue? |
| **Creative** | Feels like making, not filling forms | Does the UI invite play within clear limits? |
| **Aesthetic** | Physical metaphor (paper, thread, tape, matte wall) | Would a still frame look intentional on a mood board? |
| **System-designed** | Tokens → components → patterns → screens | Can a new screen be composed without new one-off rules? |

**Product metaphor:** a quiet dark gallery. Rooms hang as tagged keys. Each room is a matte black canvas. Notes are paper objects with tape—not cards in a SaaS grid.

## Harness workflow (always run in order)

Copy and track:

```
UI Design Progress:
- [ ] 1. Intent & constraints
- [ ] 2. Information architecture
- [ ] 3. Token & material check
- [ ] 4. Component composition
- [ ] 5. Interaction & motion
- [ ] 6. States (empty / loading / error / success)
- [ ] 7. Accessibility & calm defaults
- [ ] 8. Critique pass
- [ ] 9. Handoff spec
```

### 1. Intent & constraints

State in one line each:

- **Job:** what the user is trying to do
- **Emotion:** calm focus / gentle delight / quiet pride
- **Primary action:** one only (e.g. open room, create sticky)
- **Non-goals:** what we refuse (busy dashboards, rainbow chrome, modal stacks)

Constraints that create beauty (defaults):

- Limited sticky palette (≤ 8 colors)
- Rotation only ±8°
- Soft snap optional; free drag default
- One primary CTA per view
- No competing sidebars on the room canvas

### 2. Information architecture

Map before pixels:

```
Lobby  →  Room wall (canvas)  →  Sticky focus / create
  │              │
  └─ create room └─ wall decor (tint / washi) [secondary]
```

Rules:

- Depth ≤ 3 for core loop
- Shareable URL = room entry (no forced auth wall for view)
- Lobby = discovery of rooms; Room = creation surface

Read: `references/ia-and-flows.md`

### 3. Token & material check

Design only with tokens. If a value is missing, propose a token—do not hardcode magic numbers in specs.

Layers:

1. **Foundation** — color, type, space, radius, elevation, motion
2. **Material** — wall, paper, tape, thread, tag
3. **Semantic** — surface, text, accent, danger, focus
4. **Component** — sticky, room-tag, top-bar, fab-plus

Read: `references/design-tokens.md`

### 4. Component composition

Prefer composition over new primitives:

| Need | Compose from |
|------|----------------|
| Room entry | `RoomTag` (thread + tag + symbol + label) |
| Note | `StickyNote` (paper + tape + content + optional pin) |
| Create | `QuietIconButton` (+) in top bar |
| Wall | `BlackCanvas` + optional `WallTint` / `WashiStrip` |

Each component spec must include: anatomy, variants, props (design-level), do/don't.

Read: `references/components.md`

### 5. Interaction & motion

Motion is physical and short:

| Event | Motion | Duration |
|-------|--------|----------|
| Sticky create | Peel / settle onto wall | 200–320ms |
| Drag | Lift (shadow↑, scale ~1.02) | follow pointer |
| Drop | Soft land + optional snap | 150–220ms |
| Tag hover (lobby) | Thread sway subtle | 300–500ms |
| Room enter | Fade + slight scale from tag | 250–350ms |

Rules:

- Honor `prefers-reduced-motion` → opacity/position only, no sway/peel
- No infinite decorative loops
- Easing: ease-out for entrances; gentle spring only for drag release

### 6. States

Every surface needs:

| State | Design note |
|-------|-------------|
| Empty lobby | One hanging “New room” tag; vast calm wall |
| Empty room | Title + + ; faint guide “Pin your first note” |
| Loading | Soft pulse on paper silhouette—not spinners that shout |
| Error | Quiet inline; never red full-screen panic |
| Success | Brief settle animation; no confetti |

### 7. Accessibility & calm defaults

- Focus rings visible on dark (`focus.ring` token)
- Sticky text contrast ≥ 4.5:1 on chosen paper color
- Keyboard: create, focus notes, move (arrows/nudge), delete confirm
- Hit targets ≥ 44×44px for + and tag
- Do not rely on color alone for note meaning (optional icon/label)
- Calm defaults: reduced chrome, no autoplay sound, no forced onboarding tour

### 8. Critique pass

Run the checklist in `references/critique.md` before handoff. Fix blockers; log nice-to-haves.

### 9. Handoff spec

Output structure (use this template):

```markdown
## Screen: [name]
**Intent:** …
**Entry / exit:** …
**Layout:** [regions]
**Tokens used:** …
**Components:** …
**Interactions:** …
**States:** …
**A11y:** …
**Open questions:** …
```

## Aesthetic rules (non-negotiable)

1. **Black wall is sacred** — chrome is minimal; content is paper and tags
2. **Silence over status** — hide secondary metrics; no badge spam
3. **Objects, not widgets** — shadows, tape, fiber > gradients and glassmorphism stacks
4. **Restrained color** — color lives on stickies and small accents; UI chrome stays near-monochrome
5. **Typography** — room title: human/marker feel; UI/chrome: clean neutral sans; body on notes: readable sans
6. **Density** — prefer sparse; cluster only when user creates density
7. **One surprise max per view** — e.g. thread sway OR peel-in, not both competing

## Anti-patterns (reject)

- Generic startup dashboard on lobby
- Neon cyberpunk “black” with glow overload
- Sticky notes as Material cards with elevation-24
- Modal → modal → toast stacks for simple create
- Rainbow unbounded color pickers
- Dense toolbars over the canvas
- Stock illustrations that break the paper/thread world

## System design techniques (UI layer)

Apply these deliberately:

1. **Token pipeline** — foundation → material → semantic → component (no skips)
2. **Progressive disclosure** — canvas first; tools on demand (+ menu, selection toolbar)
3. **Constraint systems** — snap grid, rotation clamp, z-index bands (wall < notes < dragging < chrome)
4. **State machines** — idle | creating | dragging | editing | selected (document transitions)
5. **Composition over configuration** — few primitives, many layouts
6. **Contract-first components** — anatomy + variants before CSS
7. **Design QA gates** — critique checklist = merge gate for UI

## Parallel skills (suggest, don’t block)

- System/architecture of data & realtime → separate system-design discussion
- Implementation → follow tokens/components from this harness
- Copy tone: quiet, short, second person sparingly (“Pin a note”)

## Quick start prompts (for agents)

When user asks to design something, start from:

1. Which surface? `lobby` | `room` | `sticky-create` | `share`
2. Run harness steps 1–9
3. Cite tokens and components by name
4. End with critique score and open questions

## Reference index

| File | Use |
|------|-----|
| `references/design-tokens.md` | Colors, type, space, motion, materials |
| `references/components.md` | Anatomy and variants |
| `references/ia-and-flows.md` | IA, user flows, URL model |
| `references/critique.md` | Peaceful/creative/aesthetic QA checklist |
| `references/patterns.md` | Recurring UX patterns |

## Definition of done (UI)

- [ ] Matches metaphor (gallery / paper / thread)
- [ ] Uses only defined tokens (or adds tokens explicitly)
- [ ] One primary action; calm empty states
- [ ] Motion respects reduced-motion
- [ ] Critique checklist passed (no Blockers)
- [ ] Handoff spec written
