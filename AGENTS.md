# Black Wall Sticky Note World — Agent Instructions

## Product

The latest product/design authority is `BUILD_SPEC.md`. Apply its named `skill:*` rules on demand; it supersedes earlier visual directions and governs privacy, materials, and build priority.

Peaceful dark gallery: lobby of hanging room tags → matte black room walls → colored sticky notes with tape. Creative, aesthetic, calm.

## Skills (load on demand)

| Skill | When |
|-------|------|
| `token-efficiency` | Always apply; load on multi-step work |
| `system-design` | Architecture, data, API, auth, sync, stages |
| `ui-design` | Visual/UX, tokens, components, motion |
| `quality-review` | Review, critique, ship gate |
| `design-taste-frontend` | Anti-slop direction, variance, motion, density |
| `impeccable` | UI audit, extract, polish, accessibility, production quality |
| `ui-ux-pro-max` | Design-system research and stack-aware recommendations |

Do **not** load all skills at once. Prefer one domain skill + token-efficiency habits.

### Installed workflow and usage efficiency

- Start visual work with `design-taste-frontend`; use `ui-animation` only for motion tasks.
- Use `impeccable` for focused critique/polish, or `web-design-guidelines` for interface/accessibility review. Avoid duplicate full audits of the same unchanged slice.
- `token-efficiency`, `impeccable`, and `web-design-guidelines` are user-level skills under `~/.codex/skills`; the two existing design/motion skills are project-local.
- The other skill names above are desired capabilities, not confirmed installations. If unavailable, use the matching installed skill or a direct review; do not repeatedly search for missing skills.
- Define a small acceptance checklist, search before reading whole files, reuse existing components, and run relevant checks once after changes stabilize. Do not skip required validation to reduce usage.
- Keep updates concise. Record durable decisions in existing docs so later work can resume without repeating discovery.

## Design resource workflow

- Read `PRODUCT.md` and `DESIGN.md` before UI changes.
- Use 21st.dev to search first, then install only a component that fits the existing wall language.
- Use React Bits as source inspiration or copy one component at a time; it is not a runtime dependency.
- Use Framer Motion only for interactions that CSS cannot express cleanly. Respect reduced motion.
- Run Impeccable/21st review after a visual slice; resolve warnings that affect users and record intentional exceptions.

## Narration while building (required — not a separate skill)

Be a clear storyteller **during build**, without burning tokens:

1. **Before a slice (2–4 lines):** Where we are in the journey · what this slice unlocks · what we deliberately skip  
2. **During:** Name files/decisions in plain language (“this is the door URL”, “this is paper on the wall”)  
3. **After (1–3 lines):** What the user can feel now · next chapter title only  

Use the product metaphor (doors, walls, paper, tape, gallery). No novels, no repeating tool output. If user says “just code”, drop narration.

### Chapter map (reference)

| Chapter | Meaning |
|---------|---------|
| Foundations | Domain types, tokens, app shell |
| Doors | Lobby + room tags + routes |
| Walls | Black canvas + title + |
| Paper | Sticky CRUD, colors, tape |
| Memory | Persist refresh-safe |
| Keys | Share links / edit tokens |
| Echoes | Realtime (later) |

## Stages

S0 MVP local → S1 share/persist → S2 collab → S3 scale. Don't skip without ADR.

## Quality bar

Peaceful UI · single write path · no secrets in client · review with `quality-review` before calling a slice done.
