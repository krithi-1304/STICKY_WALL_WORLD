# Pre-launch release — October 9, 2026

## Published version

Application commit: `10e40e89daf255346e10f143cc1a5948a4bdc9f4`.
The user requested completion after reviewing the five-commit sequence; the earlier deployment request authorizes publication.

[GitHub Pages deployment](https://github.com/krithi-1304/STICKY_WALL_WORLD/actions/runs/37858827136): successful.
[Hosted browser checks](https://github.com/krithi-1304/STICKY_WALL_WORLD/actions/runs/37860084841): successful on attempt 2 — 31 native tests (42.6s) and all 15 supplemental suites passed. The initial attempt was cancelled after a slow Chromium download reached only 20% in eight minutes; no application tests ran in that attempt.

## Live verification

- Hosted entry, help download, room creation, encrypted save/reload, wood asset, protected share URL and recipient unlock: PASS (`qa/deployment.cjs`).
- Room toolbar, paper editor, nested share/lock/passphrase dialogs, 320/390/1440px layouts: PASS (`qa/room-controls.cjs`).
- All 36 sampled enabled button states meet 4.5:1 contrast; minimum 7.41:1.
- Shared HTML serves expected `index-DfyorbzF.js`, CSP and no-referrer metadata.
- HTTP 200 and HSTS confirmed. No user content was uploaded; synthetic archive data remained browser-local.

## Scope and remaining limits

Local post-cleanup checks passed: 31 native Playwright tests without retries, production build, lint and test typecheck. All 15 supplemental suites also passed on hosted CI against the released application commit after cleanup.

Only approved A1–A11 cleanup was performed. Deferred store-action removal, crypto/UI extraction and large-file splitting remain outside the approved scope.

GitHub Pages responses still omit response-level CSP/frame-ancestors, X-Frame-Options and X-Content-Type-Options. Deployed CSP/referrer metadata and the frame-render guard improve defense in depth; they do not establish those response headers. Changing the hosting layer is separate work.

Mobile coverage is browser emulation. Real iOS/Android devices, Firefox/Safari, physical audio output and human screen-reader/usability review are not certified by these checks. Automated test success is not proof that no vulnerabilities exist.

## Local follow-up and test correction

The additional local run recorded six failed suites: five timed-out interaction suites and an edge suite with two locked-archive errors. Five interaction suites passed unchanged on a fresh isolated server. The edge rerun passed both archive cases but exposed a resize assertion race: setViewportSize can resolve before resize/ResizeObserver callbacks reconcile the visible tab stop. Commit `e89fe66` waits at most one second for one visible tab stop, retaining the original exact assertion. All 18 edge cases and ten consecutive focused resize runs then passed. No application code changed. The initial timeout causes were not conclusively established; their failures are preserved in the JSON evidence.

The hosted run validated the application commit before this test-only correction. Final follow-up validation covers the changed test locally. The documentation commit skips CI because it does not change the deployed application.
