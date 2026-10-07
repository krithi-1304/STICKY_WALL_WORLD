# Security and regression testing — October 7, 2026

> Historical pre-fix findings. The six defects were subsequently fixed and verified locally; see [REGRESSION_FIXES_2026-10-07.md](REGRESSION_FIXES_2026-10-07.md).


**Not ready for a clean sign-off: six product defects remain reproducible.** The normal feature journeys and the new adversarial-input matrix pass. No application code, dependencies, or deployment were changed during this audit.

Runtime tested: `c0cda5478d6655dcd7f7d32c4044cd5eaccddf93`. Local Vite at port 5186; live GitHub Pages smoke also passed. Tests used isolated Chromium contexts and synthetic data, never the owner's real archive.

## Results

| Check | Current result |
|---|---|
| Production Pages build and lint | Both PASS |
| Existing feature suites | 13/13 PASS, run serially |
| New security/input groups | 12/12 PASS |
| Targeted regression edge cases | 8/14 PASS; six failures reproduce six defects |
| Live deployment smoke | PASS: entry, help download, room, encrypted save/reload, assets, protected link, recipient unlock |
| Production dependency audit | Zero reported advisories |
| Full dependency audit | One high-severity development dependency advisory |

Durable machine-readable evidence: [combined results](qa/results/security-2026-10-07.json), [full dependency audit](qa/results/dependency-audit-2026-10-07.json), [production audit](qa/results/production-audit-2026-10-07.json). Local diagnostic logs/screenshots are in `/tmp/black-wall-regression-6XQ7uk`, `/tmp/black-wall-edges-rT9T6L`, and `/tmp/black-wall-security-C3aHig` and may be removed by the OS.

## Feature coverage

All current suites passed: `private-archive`, `privacy-failures`, `passphrase-recovery`, `media-sharing-locks`, `large-media`, `physical-interactions`, `ui-polish`, `help-guide`, `sound-state`, `room-motion`, `room-controls`, `shared-space`, and `public-share`.

Together these exercise archive creation/unlock/wrong phrases, encrypted persistence and reload, backup/restore, recovery, legacy migration, concurrent-tab exclusion, quota/save failures and retry, locked-content sharing rules, note editing and release, media handling, physical room interactions, help, actual audio state, motion, light controls and shared recipients. Shared tests cover wrong/right phrase, Enter submission, intentional reveal, real text/image/audio/video/link content, Close/reopen, reply flow, same-page invitation navigation, refresh relock, three repeated falling-letter OFF/ON cycles, hidden-tab behavior, desktop/tablet/360px widths, and reduced motion. A passing ordinary Hide journey does not override the failing race reproductions below.

The previous component inventory and reproduction steps remain in [the October 4 report](REGRESSION_REPORT_2026-10-04.md). Historical unmounted components and retired plaintext-era tests are not current feature gates.

## New security and varied-input testing

`qa/security-input-matrix.cjs` adds these independent groups:

| Area | Inputs and assertions |
|---|---|
| URL safety | 23 URLs: HTTP/S allowed; script/data/file/blob/FTP, credentials, relative and obfuscated unsafe URLs rejected |
| Authenticated encryption | Four phrase variants round-trip; repeated encryption produces distinct salts/IVs/ciphertext; 31 wrong-phrase, damaged-envelope and invalid-length cases rejected |
| Archive validation | 145 malformed worlds rejected, including invalid types, slugs, oversized text, duplicate rooms and orphan notes; prototype payload does not pollute objects |
| Script injection | Nine text/markup payloads through room/note/shared-recipient rendering; no script execution or injected active DOM; safe links use protected new-tab behavior |
| Plaintext leakage | Synthetic note/passphrase absent from inspected local/session storage, cookie, encrypted envelope, captured requests and console; protected link contains neither marker |
| Invalid uploads | Eight corrupt, empty or unsupported image/audio/video/HTML/SVG files rejected |
| Recipient recovery | Four malformed files rejected; valid file recovers; wrong phrase fails; correct phrase opens; Close clears content; refresh requires invitation again; recipient-only context creates no database |
| Four user profiles | 32 note-input journeys: English, Japanese, Arabic, Tamil, emoji, combining characters, HTML-looking text, whitespace, multiline, Markdown and 10,000 characters; phrases of 12–200 characters; 360/390/768/1440px widths |
| Save ordering | 104 rapidly typed characters remain exact after encrypted save/reload |

Profile journeys include room creation, editing, refresh/unlock, further editing, canceling deletion, confirming deletion and horizontal-overflow checks. These are automated user simulations, not a recruited human usability study. All 12 groups finished without uncaught page errors.

One initial recipient assertion failed because the test setup visited the archive gate before the recipient page, creating an empty archive database. Corrected setup opens the recipient page directly. The complete matrix was rerun successfully; that failure was test contamination, not a product defect.

## Confirmed bugs — fix order

| ID | Priority | Current reproduction and impact |
|---|---|---|
| BUG-01 | P1 privacy | Begin delayed unlock → Hide → Return → pending unlock completes and exposes the archive without a fresh unlock |
| BUG-02 | P1 privacy | Edit during delayed save → Hide → immediate Return → unlocked archive is briefly exposed while save cleanup finishes |
| BUG-03 | P1 data access | Create room 501 → save → refresh → correct phrase cannot reopen because the loader rejects the saved room count |
| BUG-04 | P1 data access | Add note 10,001 through the store action → accepted mutation fails the loader's global note limit |
| BUG-05 | P2 correctness | Write draft → Keep → clear draft at destination step → final Keep saves an empty note and can create an empty room |
| BUG-06 | P2 accessibility | Focus light 2 at desktop → resize to 360px → the only tab stop is hidden and visible lights cannot be reached with Tab |

Detailed source pointers, expected/actual behavior and fix directions are in the October 4 report. Delay injection simulates slow crypto completion; it does not replace the crypto algorithm. BUG-03 uses an actual encrypted save/reload; BUG-04 checks the production store mutation and loader validator rather than separately reloading 10,001 notes.

The initial-create variant of BUG-01 passed this run, whereas it failed in the prior audit. The unlock variant still failed. This is timing sensitivity, not evidence that the unmodified cancellation path was fixed. Current results are six failures rather than the previous seven.

## Dependency and hosting findings

The installed development dependency `source-map-js@1.2.1`, reached through Vite/PostCSS, is reported by `pnpm audit` under [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) / CVE-2026-93749. The advisory describes event-loop denial of service from crafted indexed source maps; patched versions are 1.2.2 and later. Update the compatible dependency/lockfile and rerun the build. This is a development-tool dependency finding, not a demonstrated exploit in the deployed app. No malicious source-map exploit was executed. `pnpm audit --prod --json` reports zero advisories, which is not proof that runtime code has no vulnerabilities.

A read-only HEAD request to the live `/shared/` returned HTTP 200 and HSTS (`max-age=31556952`). It did not return Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, or Referrer-Policy. The source HTML also has no CSP/referrer meta policy. Treat these as defense-in-depth gaps: evaluate a restrictive compatible CSP, framing protection through hosting headers, nosniff and an explicit referrer policy. No clickjacking exploit was attempted. Wildcard CORS on this public static page is not by itself disclosure of the browser-local encrypted archive.

The app requests Google Fonts. The leakage probe observed a fonts.gstatic.com request without synthetic private markers. This remains an external request/privacy consideration; self-hosting fonts would remove it. No note/passphrase exfiltration was observed in the tested journey.

## Scope and limitations

- Chromium automation only; no Safari/WebKit, Firefox, real iOS/Android device, screen-reader session, or human usability panel.
- This is bounded application testing and source review, not a formal penetration-test certification or mathematical cryptography audit.
- Local encryption does not protect an already unlocked/compromised browser or weak guessable phrases. Passing marker checks covers the inspected paths, not every possible information channel.
- No backend exists to load-test; multi-tab/save ordering is covered, but this is not a multi-user server concurrency or sustained performance benchmark.
- No destructive testing of real user data, host infrastructure attacks, dependency exploit execution, or exhaustive fuzzing was performed.
- No runtime fixes or deployment were performed. Resolve the four P1 issues first, then the two P2 defects and dependency advisory; rerun the affected checks and the full suite before sign-off.

## Re-run

Run a local Vite server and set `QA_BASE_URL` to it. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` when the installed Chromium differs from Playwright's expected binary.

```sh
node qa/regression-all.cjs
node qa/regression-edge-cases.cjs
node qa/security-input-matrix.cjs
```

The edge suite is expected to exit nonzero until the defects are fixed. `QA_CASES` selects named security/edge cases. From `web`, run `npm run build:pages`, `npm run lint`, `pnpm audit --json`, and `pnpm audit --prod --json`. Run `qa/deployment.cjs` with the live site as `QA_BASE_URL` for the isolated production smoke.
