# Shared-space maintenance

Read AGENTS.md and BUILD_SPEC.md first. The October 2 recipient redesign is detailed in SHARED_SPACE_REDESIGN.md; its explicitly requested night-window, glass invitation, Wick SVG and wax-flame identity are scoped additions to the existing archive.

- Preserve encrypted, read-only snapshots. Decrypt only in memory; never persist recipient plaintext, phrases or keys. Clear URL fragments. Hide/Close must invalidate decrypt work and success-transition timers.
- Reuse SharedBackdrop across entry and opened scenes. Wick and LetterSeal are original inline SVG; no external illustration, scene library or replacement app shell.
- Real note bodies and validated media feed SharedLetter. Safe links keep ExternalLink confirmation. The typing treatment is optional and leaves normal rich content unchanged.
- Leave one back goes through the existing encrypted archive and composer; sharing the reply is an explicit later action. There is no automatic delivery service.
- Existing-room Falling Letters is a measured CSS letter pile. Enabling restores closed-note IDs; disabling clears them. Do not replace it with ambient particles.
- Recipient FallingLetters is an independent decorative layer with at most eight envelopes, one owned RAF, immediate restart, visibility/reduced-motion listeners and full cleanup.
- Keep 44px controls, 360px layouts, input labels, focused scene headings, reduced-motion end states and safe-area padding.
- Rebuild the PNG icons from favicon.svg with web/scripts/render-icons.cjs when the mark changes; preserve base-relative manifest paths.
- Run qa/shared-space.cjs for this surface and relevant existing room/privacy tests. QA_BASE_URL selects the local server; PLAYWRIGHT_CHROMIUM_EXECUTABLE can select an installed browser. Run web build:pages and lint before shipping.

October 3 completion: LetterSeal accepts `seal` for bare wax on stationery; retain the dark rounded square for navigation and app icons. Production preview must use `--base=/STICKY_WALL_WORLD/`.

Latest October 3 refinement: master controls read Sound on/off. Lobby eyebrow has no icon. Identity is a folded cream note with a navy crescent, superseding the heart-flame badge. Share controls use ShareLetterIcon. SharedLetter owns cancellable 440ms open / 180ms fold timers; reduced motion skips them. All generated share URLs go through domain/shareUrl.ts; local previews use the public GitHub Pages recipient URL, hosted installs preserve their own origin/base. Test public-share with synthetic data only.

## Shared-room refinement — October 3
Recipient controls use the existing master Sound store; never label room audio Chimes. Use the candle-flame heart seal consistently for favicon, app icons and stationery; the lobby mark sits separately above the unadorned Night Archive label. Keep Wick’s mobile greeting clear of navigation. Preserve the existing memory-only encrypted snapshot flow.

## Shared Open recovery — October 3
Published d3f7ed7 through GitHub Pages run 37122722759; live protected-share decryption passed. Bare /shared/ and refresh intentionally have no encrypted payload. Explain the missing invitation beside Open and disable phrase entry until a valid link/file exists. Do not persist recipient payloads or pretend the phrase can locate a message. Original links and file imports retain the existing behavior.

## October 4 — moonlit journal identity
Latest user direction supersedes the candle-heart brand: a silver crescent shelters a warm folded page on near-black navy. Reuse the original SVG in lobby, recipient navigation and dark stationery seals; Share uses a moon-sealed envelope. Regenerate favicon/192/512/Apple assets. Wick remains the candle messenger within the scene. The tested same-page protected-link fix is included in this deployment.

## Regression audit workflow
Use qa/regression-all.cjs for the 13 current suites; it defaults to serial execution after media/motion timing failures under two workers. Set QA_BASE_URL and PLAYWRIGHT_CHROMIUM_EXECUTABLE for the environment. qa/regression-edge-cases.cjs intentionally fails until the six defects documented in REGRESSION_REPORT_2026-10-04.md are fixed; do not weaken assertions to make the audit green. QA_CASES selects individual reproductions. Retired plaintext gallery/archive suites are historical, not current gates.

For adversarial-input coverage, also run qa/security-input-matrix.cjs against local Vite (it imports domain modules). Start recipient-only persistence tests directly on /shared/ so archive-gate setup does not contaminate database assertions. Latest evidence and limitations are in SECURITY_TEST_REPORT_2026-10-07.md. A green normal-flow suite does not supersede failing privacy/capacity edge checks; distinguish development dependency advisories from production audit results.

## October 7 — regression fixes
The six audited defects are now fixed locally. Both qa/regression-edge-cases.cjs (18 cases) and qa/security-input-matrix.cjs (12 groups) must pass alongside the 13 feature suites. Earlier audit findings above are historical. Hide must immediately gate rendering and wait for entry/save work before clearing the key; failed saves stay concealed with encrypted export/retry. Enforce new-room/new-note limits in the store, while permitting structurally valid existing oversized encrypted archives to open for recovery.

## Approved pre-launch test runner
Use npm run test:e2e (from web) for the production-path Playwright suite; npm run test:e2e:ci enables retries/forbid-only, and npm run test:e2e:typecheck checks fixtures/config. Port 5190 must be free; the runner owns its server. Do not persist encryption keys in auth storageState. Native fixtures seed synthetic ciphertext into isolated contexts and unlock through the real form. PR CI additionally runs existing deep regressions on dev port 5191. See web/e2e/README.md for failure artifacts and limitations. The current user requires approval before Stage 3 cleanup; Stage 4 is a proposed command sequence, not authorization to commit automatically.

## October 9 — commit authorization
The user’s continuation authorized execution of the concrete five-commit plan in PRELAUNCH_COMMIT_PLAN.md. This supersedes the earlier pending Stage 4 status only for that reviewed sequence. Future cleanup outside A1–A11 still needs approval. Deployment remains separate.

## Release verification record
PRELAUNCH_RELEASE.md supersedes earlier not-deployed/pending-CI status for the approved pre-launch work. When testing responsive observers, allow the browser callback to complete using a bounded condition wait; retain behavior assertions. Do not equate viewport command completion with observer delivery. Physical-device and response-header limitations remain explicitly recorded.
