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

## d3f7ed7 — deployment bundle
Files: qa/room-motion.cjs; web/public/letter-courier.png. Included remaining project files as requested; the courier artwork remains unused by the SVG experience. Build:pages/lint pass. GitHub Pages run 37122722759 completed successfully; hosted room creation, persistence, protected sharing and recipient Open passed.

## d2c0cd5 — missing invitation recovery
Files: web/src/pages/Shared.tsx; qa/{shared-space,deployment}.cjs; INSTRUCTIONS.md; PROGRESS.md; DECISIONS.md.
Behavior: bare /shared/ and refreshed recipient pages explain why Open is disabled and how to recover via the original link or encrypted file; phrase entry is disabled until a payload is present.
Tests: build:pages/lint and full shared-space regression pass, including missing-link state, valid-link decryption, file import, wrong phrase, refresh, mobile and reduced motion.
Limits: original-link/file requirement is intentional privacy behavior; no phrase lookup service or recipient persistence.

## b72534c — receive a new invitation on the existing shared page
Files: web/src/pages/Shared.tsx; qa/{shared-space,deployment}.cjs; PROGRESS.md; DECISIONS.md.
Root cause: mount-only hash parsing missed same-document navigation from /shared/ to a protected link. A hashchange listener now replaces the in-memory envelope, cancels pending decrypt/reveal work, clears the fragment and restores focus.
Tests: full shared-space including same-page link arrival passes; build:pages/lint pass. Hosted regression now exercises this exact path (same-document navigation has no HTTP response).
Limits: refresh still requires original encrypted invitation by design.

## 1fdd72b — moonlit journal identity
Files: LetterSeal.tsx; ShareLetterIcon.tsx; favicon.svg, icon-192.png, icon-512.png, apple-touch-icon.png, site.webmanifest; INSTRUCTIONS.md; PROGRESS.md; DECISIONS.md; SHARED_SPACE_REDESIGN.md.
Behavior: silver crescent and warm folded journal page on near-black navy; matching moon-sealed envelope. Supersedes candle-heart brand per latest user feedback; Wick remains in the shared scene.
Tests: regenerated PNG assets visually inspected, build:pages/lint pass.
Limits: physical home-screen installation not tested.

## 5f1be2c — regression fixes and repeatable security tests
Files: web/src/components/{FairyLights,ForgotPassphrase,ThoughtComposer,VaultGate}.tsx; web/src/domain/{storage,types}.ts; web/src/pages/{Lobby,NewRoom,Room}.tsx; web/src/state/wall.ts; qa/{regression-all,regression-edge-cases,security-input-matrix}.cjs.
Behavior: immediate concealment, stale-entry suppression, concealed quota-failure recovery, central room/note creation limits, recovery of existing oversized archives, final draft validation and visible fairy-light keyboard focus.
Tests: build:pages/lint; 13 feature suites; 12 security groups; 18 final edge cases; local production-path smoke; no uncaught page errors.
Limits: Chromium automation only; hosting-header recommendations remain; not deployed.

## dfb07a1 — patched development source-map dependency
Files: web/pnpm-lock.yaml.
Behavior: source-map-js 1.2.1 → 1.2.2 without unrelated dependency changes; no visual change.
Tests: build:pages/lint and browser suite with patched installation; full pnpm audit reports zero advisories.
Limits: an advisory scan is not proof of absence of vulnerabilities; not deployed.

## Pending pre-launch work — October 8
No commits have been created for this pass. PRELAUNCH_COMMIT_PLAN.md contains the exact five-commit sequence, file lists, split dependency staging, explanatory bodies and validation limits. Intents: security hardening; native E2E coverage; PR CI; approved unreachable-code cleanup; documentation/evidence. Post-cleanup build/lint/typecheck and 31 native tests pass. Prior to cleanup, all 15 supplemental suites pass. Deployment and GitHub-hosted CI execution remain pending.

## October 9 — pre-launch commits (supersedes pending status)

### 2e5fe87 — production security hardening
Files: web/src/main.tsx; web/scripts/pages.mjs.
Behavior: framed visits show an open-in-own-tab link; production entrypoints carry CSP and no-referrer policies.
Tests: production build/lint, framing and script enforcement, encrypted sharing/media checks; final native suite passes.
Limits: response-level frame-ancestors headers require hosting support; not deployed.

### a963c01 — isolated private archive E2E journeys
Files: .gitignore; web/e2e/{README.md,archive.spec.ts,fixtures.ts,responsive.spec.ts,security.spec.ts,sharing.spec.ts}; web/{package.json,pnpm-lock.yaml,playwright.config.ts,tsconfig.e2e.json}; web/src/components/{DiaryNote,FairyLights,FallingLetters}.tsx.
Behavior: encrypted synthetic fixtures, isolated browser contexts, desktop/mobile journeys, failure artifacts and test scripts; stable component selectors.
Tests: final post-cleanup 31 native Playwright tests pass without retries; lint, test typecheck and production build pass. All 15 supplemental suites passed before cleanup.
Limits: Chromium and emulated mobile; no persisted auth keys; not real-device or human accessibility certification.

### ef54a52 — pull request browser checks
Files: .github/workflows/e2e.yml.
Behavior: runs native and supplemental suites on PRs, retaining reports and failure evidence.
Tests: underlying commands pass locally; workflow reviewed.
Limits: GitHub-hosted workflow has not run; legacy suites produce logs/screenshots rather than native Playwright traces.

### b052a02 — approved unreachable-code cleanup
Files: web/{package.json,pnpm-lock.yaml}; web/src/components/{RainbowFlame,RoomToolsMenu,StickyNote,WebGLTorchField,WorldAtmosphere,WritingStylePicker}.tsx; web/src/assets/{react.svg,vite.svg,hero.png}; web/src/domain/{motion,slug,types}.ts.
Behavior: removes approved A1–A11 only and orphaned animation dependencies; reachable app behavior unchanged.
Tests: post-cleanup build/lint/test-typecheck and 31 native tests pass, zero retries; dependency audit reports zero advisories.
Limits: deferred store actions, crypto/UI extraction and file splitting remain untouched. Supplemental suites passed before cleanup and were not rerun.

### Documentation commit accompanying this record
Files: INSTRUCTIONS.md; PROGRESS.md; DECISIONS.md; COMMIT_LOG.md; PRELAUNCH_COMMIT_PLAN.md; qa/results/prelaunch-{e2e,cleanup}-2026-10-08.json.
Behavior: records approvals, measured results, exact staging recipe and actual implementation hashes.
Tests: staged whitespace checks and JSON parsing; no runtime changes.
Limits: each historical implementation state was not independently checked out and retested. No push or deployment in this sequence.

## e89fe66 — synchronize responsive keyboard regression
Files: qa/regression-edge-cases.cjs.
Behavior: waits up to one second for resize callbacks before the existing exact visible-tab-stop assertion. No runtime changes.
Tests: all 18 edge cases and ten consecutive resize repetitions pass.
Limits: the hosted 31-test/15-suite pass precedes this test-only synchronization.

## Release evidence commit accompanying this record
Files: PRELAUNCH_RELEASE.md; qa/results/prelaunch-release-2026-10-09.json; INSTRUCTIONS.md; PROGRESS.md; DECISIONS.md; COMMIT_LOG.md.
Behavior: records successful deployment of 10e40e8, hosted CI, live smoke/contrast/layout checks, initial local failures and follow-up results.
Tests: JSON parsing and whitespace checks; application code unchanged.
Limits: device/browser coverage and hosting-header gaps remain documented. CI is skipped for this documentation-only head to avoid redeploying an identical app bundle.
