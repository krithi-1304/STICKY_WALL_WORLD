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
