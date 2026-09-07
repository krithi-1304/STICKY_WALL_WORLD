# Black Wall Sticky Note World — Current State (as of f8d89a0)

> **NOTE:** The "Pinterest aesthetic pass" commit (f577bd3) was ROLLED BACK on user request —
> it broke tapes, text alignment, and introduced off-screen UI. We are back to the
> last stable, fully-tested state. Redo of the aesthetic work starts from here.

## Project Overview
A peaceful, aesthetic digital sticky note wall inspired by Pinterest — rooms hang like polaroids on a string, each room is a warm charcoal wall where handwritten notes with plaster/washi tapes live.

**Live:** `http://localhost:5173/` | **Repo:** https://github.com/krithi-1304/STICKY_WALL_WORLD

---

## What's Built (S0 Complete)

### 1. Lobby — The Gallery Entrance
- **Mist reveal** on first load (fog clears in 1.6s)
- **String with pins** across the top — warm flax thread, metallic pins catch light
- **Polaroid room cards** hang at varied heights/lengths (organic, not grid)
- **Glassy "New room" card** — frosted glass invitation with dashed border
- **Pinterest symbols** auto-generated from room name (✷ ◈ ☾ ❋ ⌂ ✿ ◎ ☼)
- **Gentle sway** animation on cards; hover = lift + glow

### 2. Room — The Wall Canvas
- **Warm charcoal wall** with paper fiber texture, subtle gold vignette
- **Torch light cursor** — focused warm glow follows pointer (mix-blend-mode: overlay)
- **Doodle field** (planned) — tiny sketches from note titles float in background
- **Title** in Caveat handwriting, centered, fades with chrome after 2.5s idle
- **Floating action ring** (planned) — expands on hover

### 3. Sticky Notes — Handmade Paper
- **10 warm paper colors:** Butter, Blush, Peach, Mint, Sage, Sky, Lilac, Rose, Cream, Mist
- **7 handwriting fonts:** Caveat, Gaegu, Delius, Shantell Sans, Indie Flower, Nanum Pen, Zeyada
- **8 plaster/washi tapes:** plain, dots, diagonal, grid, hearts, stars, checker, confetti
  - Torn edges (clip-path polygon)
  - Translucent with adhesive glow
  - Slight corner curl
- **±13° rotation** — no two notes sit the same way
- **Organic sizes** (168–252px) — varied like real paper
- **Paper grain** + **corner lift** + **soft shadow**
- **Date tag hangs by string** — torn paper tag, 13px thread, tiny knot, gentle sway
- **Maximize** — hover ⤢ or Cmd+Enter → fullscreen overlay, Esc closes, editable
- **Drag physics** — pendulum swing against drag, lifts with deeper shadow

### 4. Interactions
- **Marquee select** — drag empty wall → selection box → bulk delete
- **Shift-click** — multi-select individual notes
- **Sort** — ↑ oldest / ↓ newest → loose organic grid (keeps handwriting character)
- **Tidy** — organic grid (oldest-first)
- **Font picker** — 7 font cards with handwriting preview (planned: larger cards)
- **Chrome fades** — top bar fades to 20% after 2.5s idle, returns on pointer move

### 5. Persistence
- **localStorage** — rooms + stickies survive refresh
- **S1-ready schema** — Room/Sticky types map to future DB

---

## Token System (New — Pinterest Warmth)
```
Colors:  --pw-charcoal, --pw-cream, --pw-gold, --pw-thread, --pw-string, --pin-metal
Papers:  10 warm tones with matching ink colors
Tapes:   plaster, washi, adhesive glow variables
Type:    DM Sans (UI), Caveat (title), 7 cursive hands (notes)
Motion:  gentle easings, 180–500ms durations
```

---

## File Structure (web/)
```
src/
├── domain/
│   ├── types.ts      # Room, Sticky, 10 colors, 7 fonts, 8 tapes, limits
│   ├── slug.ts       # slugify, uniqueSlug
│   └── storage.ts    # localStorage load/save
├── state/
│   └── wall.ts       # Zustand store: organic spawn, tidy, sort, maximize-ready
├── components/
│   ├── RoomTag.tsx   # (old) — being replaced by RoomCard in Lobby
│   └── StickyNote.tsx # Full: drag, maximize, date tag, font, tapes
├── pages/
│   ├── Lobby.tsx     # Mist, string+pins, RoomCard grid
│   ├── NewRoom.tsx   # Name + symbol picker (auto-suggested from name)
│   └── Room.tsx      # Torch, wall, notes, floating actions, sort, marquee
├── styles/
│   └── tokens.css    # New Pinterest token system
└── index.css         # All styles (lobby, room, notes, torch, overlays)
```

---

## What's Half-Done / Needs Polish (Current Focus)

| Area | Status | Needs |
|------|--------|-------|
| **Lobby** | New RoomCard done, old RoomTag still referenced | Replace Lobby.tsx to use RoomCard |
| **Torch cursor** | CSS + JS in Room.tsx | Move to App-level for global |
| **Date tag** | Works (thread + knot + sway) | Make more torn/paper-like |
| **Tapes** | 8 styles in CSS | Add more Pinterest patterns (fabric, lace, floral) |
| **Doodle field** | Not started | Generate from note titles |
| **Font picker** | Works but tiny buttons | Font cards with handwriting preview |
| **Floating action ring** | Not started | Expand on hover, proper alignment |
| **Room header** | Basic | Breathing room, glassy title |
| **Alignment audit** | Not done | Every element pixel-perfect |

---

## Known Issues to Fix
1. **Lobby.tsx still uses old RoomTag** — needs rewrite to use new RoomCard
2. **Torch light only in Room** — should be global (App.tsx)
3. **Font picker buttons too small** — need card-style previews
4. **Action buttons cramped** — need floating ring with expand
5. **No doodle field yet** — generate SVG sketches from note titles
6. **Date tag could be more aesthetic** — more torn, handwritten date
6. **Alignment pass needed** — consistent spacing, optical centering

---

## Next Immediate Steps (in order)
1. Rewrite `Lobby.tsx` to use `RoomCard` component (extract from CSS)
2. Move torch to `App.tsx` + global pointer tracker
3. Build `FontPicker` component with handwriting preview cards
4. Build `FloatingActionRing` component
4. Add doodle field generator (title → simple SVG doodle)
5. Refine date tag: more torn, pin head, handwritten date font
6. Full alignment audit + spacing system
7. Integration test + visual audit

---

## Commands
```bash
cd web
pnpm dev          # http://localhost:5173/
pnpm build        # production build
npx tsc --noEmit  # type check
npx oxlint src    # lint
```

---

## Design Principles (for future work)
1. **Warmth over cool** — gold/cream/flax, not blue/white
2. **Handmade over perfect** — torn edges, varied rotation, organic spacing
3. **Depth through layers** — string → pin → card → shadow → glow
4. **Light as material** — torch reveals, pins catch light, tape is translucent
5. **Breathing room** — generous padding, nothing cramped
6. **Motion with purpose** — sway = hanging, swing = paper physics, fade = focus
7. **Pinterest soul** — collected, curated, tactile, inspirational