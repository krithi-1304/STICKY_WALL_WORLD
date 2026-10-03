# Shared-space completion — October 3, 2026

## 9f7b0ff — SHARED-03: candle-heart identity
Files: web/index.html; web/public/{favicon.svg,apple-touch-icon.png,icon-192.png,icon-512.png,site.webmanifest}; web/scripts/render-icons.cjs; web/src/components/LetterSeal.tsx.
Behavior: original rose wax heart with amber flame, navy app tile, and bare stationery variant; SVG, 192/512 PNG and 180 Apple icon.
Validation: PNG regeneration, build:pages/lint, desktop/mobile visual inspection, production-path browser check.
Limitations: no physical-device home-screen install test.

## 1d5b1ce — SHARED-01/02: invitation and room
Files: SHARED_SPACE_REDESIGN.md; web/src/components/{FallingLetters,RichContent,SharedBackdrop,SharedLetter,Wick}.tsx; web/src/pages/{Lobby,Shared}.tsx; web/src/index.css; web/src/styles/{black-wall,shared}.css.
Behavior: Wick invitation, phrase reactions, cancellable opening, continuous night room, real-data letter reveal, physical media, reply composer link, accessible controls and bounded ambient letters.
Validation: shared-space, help-guide, media-sharing-locks, large-media and production-path browser tests; desktop/tablet/360px, reduced motion, scene focus, privacy cancellation; build/lint pass.
Limitations: reply creation uses the existing archive rather than automatic delivery; refresh relocks and needs original encrypted link/file; seen-letter state lasts only in memory. Pinterest unavailable. No physical mobile-device testing.

## ce8fc37 — SHARED-04: falling-letter lifecycle and regressions
Files: web/src/hooks/useLetterPile.ts; web/src/pages/Room.tsx; qa/{shared-space,deployment,help-guide,large-media,media-sharing-locks}.cjs.
Behavior: enabling restores eligible closed-note piles; measurement cleanup resets pending frames and resumes after visibility changes. Tests cover repeated ambient/local toggles and shared flow. Large-video fixture draws multiple frames for reliable capture.
Validation: three OFF/ON cycles in both experiences, hidden-tab suspension/restart, preference persistence, room-motion, complete shared-space test, media locks, large media, help and production-path tests pass. Build/lint and diff whitespace check pass.
Limitations: Chromium emulation; the original room effect is CSS text settling, not continuous ambient particles. Existing unrelated ItemPrivacy, room-motion browser-selector edits and unused letter-courier.png remain unstaged.

## Documentation follow-up
Files: INSTRUCTIONS.md, PROGRESS.md, DECISIONS.md, COMMIT_LOG.md.
Records final behavior, verification, commit hashes, and maintenance constraints. No runtime changes.
