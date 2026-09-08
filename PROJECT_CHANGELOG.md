# Black Wall Project Changelog

This is the recovery map for the project. Every meaningful slice records its commit, intent, verification, and rollback point.

## Stable History

| Commit | Slice | Verification / notes |
|---|---|---|
| `8299f12` | Initial harness: agent instructions and core skills | Baseline harness |
| `49d64e7` | S0 MVP: lobby, rooms, notes, local persistence | Build, lint, browser smoke |
| `8f42e2e` | Material pass: paper grain, receding chrome, wall depth | Visual pass |
| `14f0b68` | Organic notes, handwriting, tapes, date labels, selection | User-first redesign |
| `d5451fa` | Cute wall pass: 10 colors, 8 tapes, fonts, maximize, fog | 17/17 browser checks |
| `f8d89a0` | Stable rollback point after removing temporary test script | Stable base before lobby slices |
| `d2e7347` | Lobby identity pins, deterministic room symbols, hover glow | 6/6 browser checks, zero page errors |
| `bfe6e18` | Global warm torch cursor | 6/6 browser checks, zero page errors |
| `f6bfc34` | Refined thread-hung date tags | TypeScript, lint, build, browser audit |
| `be43408` | Ranked fuzzy room search | 9/9 browser checks, zero page errors |
| `8338269` | Design engineering harness: Taste, Impeccable, UI/UX Pro Max, 21st context, Framer Motion | Build and lint clean |
| `659e251` | Night Archive atmosphere: story copy, sparse Framer Motion motes, reduced-motion fallback, audit cleanup | 7/7 browser checks, zero page errors, build/lint clean |
| `5e259fc` | Lobby threshold: archive stamp, moonlight focus, ritual empty state, aligned room shelf, room count | 7/7 browser checks, mobile overflow check, zero page errors |
| `31554d4` | Room instrument chrome: aligned capsule actions, title breathing room, mobile toolbar containment | Build/lint clean, mobile overflow regression caught and fixed |
| `cb961a0` | Sticky placement collision fix: rotation-aware footprint, deterministic grid fallback, full-height fallback spacing | 5 repeated runs, 12 notes each, zero bounding-box overlaps |
| `437540f` | Deterministic aligned wall slots: row-major placement, 320px rhythm, ResizeObserver canvas growth | Desktop 0 overlaps / 2 rows, mobile stack growth, build/lint clean |
| `59ec044` | Symbolic torch cursor: constellation glyph, orbiting sparks, writing quill state over sticky notes | 6/6 browser checks, 11 notes with zero overlap, build/lint clean |
| `349f4d0` | Delete UX: survivor notes compact into aligned slots; native cursor preserved while symbolic torch remains supportive | 7/7 single-delete/cursor checks, bulk delete verified, build/lint clean |

## Current Slice

| Status | Commit | Scope |
|---|---|---|
| Next | not started | Room-world atmosphere, intentional scene transitions, and richer artifact relationships |

## Verification Contract

- Run `pnpm build` and `pnpm lint` from `web/`.
- Run browser interaction checks with Playwright.
- Record page errors and accessibility/design audit findings.
- Capture screenshot or computed-style evidence for visual changes.

## Rollback Rules

- Never rewrite a stable commit to experiment.
- One visual slice per commit.
- If a slice breaks the core loop, reset to the previous stable commit and record why here.
- Keep user-authored `NextSteps.md` changes separate from implementation commits.
