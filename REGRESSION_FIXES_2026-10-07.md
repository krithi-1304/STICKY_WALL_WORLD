# Regression fixes — October 7, 2026

All six confirmed defects from the earlier audit are fixed and pass their local regressions. These changes have not been deployed.

## Changes

| Finding | Fix and affected files |
|---|---|
| Pending unlock overrides Hide | `VaultGate.tsx` invalidates pending results on Hide. `storage.ts` tracks create/unlock/restore/reset operations and waits for them before releasing the key. `ForgotPassphrase.tsx` ignores completion after unmount. Crypto work can finish, but cannot reopen the screen. |
| Return exposes pending-save content | Hide resets readiness immediately. Return shows a securing state until cleanup finishes. Failed saves retain concealed memory with encrypted export/retry; neither notes nor the unlocked lobby render. |
| Room 501 prevents reopening | Shared constants in `types.ts`; `wall.ts` rejects new rooms at 500. `NewRoom.tsx`, `Lobby.tsx`, and `ThoughtComposer.tsx` show actionable feedback. |
| Note 10,001 exceeds loader capacity | Store rejects creation at the global note limit; room/composer flows explain the limit before creating a new room. Existing per-room limits remain. |
| Final Keep accepts empty draft | `ThoughtComposer.tsx` rechecks current text before any room/note mutation. |
| Lights lose keyboard access after resize | `FairyLights.tsx` reconciles its single tab stop with visible bulbs on resize and restores focus when the focused bulb becomes hidden. |
| Development dependency advisory | Only `source-map-js` changes in `web/pnpm-lock.yaml`, from 1.2.1 to 1.2.2. |

Existing structurally valid oversized encrypted archives can open, export, rotate passphrases and be reduced below the creation limits. Other validation remains active. This compatibility path avoids stranding users whose data was saved by the earlier bug. Saves now validate the snapshot structure before encryption. Pending backup file reads also ignore stale selections after Hide or a newer selection.

## Verification

- `npm run build:pages` and `npm run lint`: PASS.
- All 13 existing feature suites: PASS, serial execution.
- Security/input matrix: all 12 groups PASS.
- Expanded edge suite: all 18 cases PASS. This includes the original 14, Hide during restore/reset, recovery of a 501-room archive, and Hide during quota failure followed by encrypted export/retry and successful content recovery.
- Capacity regressions now require rejection and explicit limit feedback, not merely successful reopening. Restore/reset cases require a fresh successful unlock after the hidden operation finishes.
- Local production build at `/STICKY_WALL_WORLD/`: deployment smoke PASS, including encrypted save/reload, assets, help download, same-page recipient invitation and actual decryption.
- Full dependency audit, including development dependencies: zero reported advisories.
- Changed-file syntax and whitespace checks: PASS. Browser suites reported no uncaught page errors.

Evidence: [qa/results/regression-fixes-2026-10-07.json](qa/results/regression-fixes-2026-10-07.json). The full run included 16 edge cases; the final expanded edge suite was then rerun with all 18 and stronger capacity assertions. No application code changed between those runs.

## Scope

Chromium automation with isolated synthetic data; no Safari/Firefox, physical-device or screen-reader testing. This is not a guarantee of zero vulnerabilities. Hosting-header hardening recommendations in the security audit remain open. Production still serves the previous version until deployment.

The unavailable `quality-review` skill was covered by direct review: stale completion guards, key/write-lock cleanup order, failure recovery, every createRoom call site, schema compatibility, DOM visibility and tab-stop behavior were checked alongside the tests.
