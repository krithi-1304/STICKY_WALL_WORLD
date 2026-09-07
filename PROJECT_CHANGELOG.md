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
