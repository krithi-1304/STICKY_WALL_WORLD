---
name: ui-resource-research
description: Use when researching or selecting external UI components, animation inspiration, icons, or visual effects for Black Wall. Covers 21st.dev and React Bits without importing generic component noise.
---

# UI Resource Research

## 21st.dev

Use the local CLI first:

```bash
pnpm exec 21st search "calm dark sticky note wall" --type theme --limit 5 --json
pnpm exec 21st search "accessible search input" --type component --limit 5 --json
```

Install a component only after checking its source, dependencies, accessibility, and fit with `DESIGN.md`:

```bash
pnpm exec 21st add <author>/<slug> --print
```

Never install a whole registry for this project.

## React Bits

React Bits is a source registry, not a runtime dependency. Browse for inspiration or copy one source component at a time. Prefer CSS for wall materials and Framer Motion only when CSS cannot express the interaction.

Rules:

- Add no more than one React Bits effect per visual slice.
- Disable or simplify effects on touch and reduced-motion devices.
- Adapt colors, timing, and geometry to the Black Wall tokens.
- Do not copy an effect that competes with paper, thread, tape, or torchlight.

## Selection gate

- [ ] Does it solve a real user problem?
- [ ] Does it fit the gallery metaphor?
- [ ] Is it keyboard and reduced-motion safe?
- [ ] Is its dependency cost justified?
- [ ] Was it browser-tested after integration?
