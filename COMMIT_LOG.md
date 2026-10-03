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

## bfee16b — feedback refinements and public sharing
Files: web/src/components/{LetterSeal,ShareLetterIcon,SharedLetter,ItemPrivacy}.tsx; web/src/domain/shareUrl.ts; web/src/pages/{Lobby,Room,Shared}.tsx; web/src/styles/shared.css; web/src/index.css; web/src/content/help.md; web/public/{favicon.svg,icon-192.png,icon-512.png,apple-touch-icon.png}; qa/{archive-interactions,deployment,gallery-interactions,media-sharing-locks,physical-interactions,private-archive,room-controls,shared-space,sound-state,ui-polish,public-share}.cjs; INSTRUCTIONS.md, PROGRESS.md, DECISIONS.md, SHARED_SPACE_REDESIGN.md.
Behavior: Sound on/off wording, unadorned lobby eyebrow, moonlit folded-note identity, outline envelope share symbol, layered invitation, flap/insert opening and faster fold animation. Local preview shares now use the public HTTPS recipient URL.
Tests: build:pages/lint, shared-space (including opening/folding, reduced motion and repeated falling toggles), sound-state, room-controls (minimum measured contrast 7.41:1), media-sharing-locks pass. public-share creates a synthetic room through UI locally and decrypts its generated link on the real public site. Desktop/mobile screenshots inspected; icon PNG regenerated.
Limits: visual refinements not published; public app currently has the earlier design but compatible snapshot decryption. Existing localhost links must be regenerated. Physical device motion testing not performed. Unrelated room-motion QA edit and unused raster illustration remain unstaged.

## 0407578 — SHARED-01/02: invitation and room refinement
Files: SHARED_SPACE_REDESIGN.md; web/src/pages/Shared.tsx; web/src/components/SharedBackdrop.tsx; web/src/styles/shared.css.
Behavior: compact stamped invitation, mobile greeting clearance, candle/letter ledge, existing master Sound control in recipient room.
Tests: build/lint, full shared-space browser flow, desktop/tablet/mobile visual inspection, room-controls and sound-state.
Limits: local preview only, browser-emulated mobile; original link/file required after refresh; reply remains explicit sharing from own archive.

## 914c95b — SHARED-03: candle-heart identity
Files: web/src/components/{LetterSeal,ShareLetterIcon}.tsx; web/src/pages/Lobby.tsx; web/src/index.css; web/public/{favicon.svg,icon-192.png,icon-512.png,apple-touch-icon.png}.
Behavior: custom amber candle in rose wax heart, matching sealed-envelope share icon, separate lobby mark above Night Archive text.
Tests: SVG-to-PNG regeneration, build/lint, shared-room screenshots, room-controls and sound-state.
Limits: home-screen installation not tested on a physical device.

## 08f596c — SHARED-04: lifecycle regression guards
Files: qa/shared-space.cjs.
Behavior: verifies bounded emission rate after each OFF/ON cycle, no hidden-tab restart while disabled, recipient Sound state, and mobile greeting clearance. Runtime falling-letter fix was already committed and passes; no unnecessary lifecycle rewrite.
Tests: complete shared-space suite passes including three ambient/local toggle cycles, wrong/right phrases, file/link input, transitions, close/reopen, media, refresh, reduced motion and clean console.
Limits: deterministic visibility simulation in headless Chromium.
