# Regression audit — October 4, 2026

> Historical pre-fix findings. The six defects were subsequently fixed and verified locally; see [REGRESSION_FIXES_2026-10-07.md](REGRESSION_FIXES_2026-10-07.md).


Audited runtime commit: `c0cda5478d6655dcd7f7d32c4044cd5eaccddf93`.

**Six confirmed bugs. Four are high priority because they affect privacy or reopening saved data. No runtime fixes or deployment changes were made during this audit.**

## Results and method

- Production-path build and lint: PASS.
- 13 current browser suites: all ultimately PASS. The first run used two workers: 10 passed and three timed out. `media-sharing-locks`, `large-media`, and `physical-interactions` each passed when rerun serially. Treat the first failures as unresolved timing/resource sensitivity, not established product defects. Runner now defaults to serial execution.
- 14 additional edge-case checks: 7 PASS, 7 FAIL, representing the six bugs below (the first bug has both create and unlock reproductions).
- Live GitHub Pages smoke: PASS, including bare recipient page → protected link in the same tab → actual decrypted message.
- Tested in isolated Chromium contexts with synthetic archives; ordinary and reduced motion, desktop/tablet/mobile widths covered by the existing suites. Added a 360 × 420 short viewport, long content, keyboard positioning, resize focus, interrupted encryption/decryption and archive boundary fixtures.
- Delay injection makes crypto races deterministic: the crypto operation is unchanged, but its completion is delayed 1.2 seconds, approximating a busy/slow device. Boundary fixtures seed valid large archives rather than requiring hundreds of manual clicks.
- Two initial exploratory assertions were faulty: they counted both screen-reader and visual copies of revealed text, or checked before route completion. Corrected assertions pass; these are NOT app bugs.

Machine-readable evidence: [qa/results/regression-2026-10-04.json](qa/results/regression-2026-10-04.json).

## Confirmed bugs, in fix order

### BUG-01 · P1 · Pending unlock/create overrides Hide screen

Source: [VaultGate.tsx:27](web/src/components/VaultGate.tsx#L27), [VaultGate.tsx:41](web/src/components/VaultGate.tsx#L41).

Steps:
1. Create a synthetic archive with a saved note, then hide it and return to Unlock.
2. Begin unlocking with the correct phrase while decryption is delayed.
3. Open Help & guide → Hide screen → Return before the unlock finishes.
4. Wait for decryption to finish.

Expected: the user remains at the locked entry; a hidden operation cannot reopen the archive.
Actual: the pending `submit` resumes, installs the decrypted world, and calls `setReady(true)`. The lobby appears without a new unlock after Return. The equivalent race also occurs during initial archive creation.

Cause: Hide and submit have no shared operation-generation/cancellation guard. Hiding can clear the key before the pending crypto operation later installs it again.

Evidence: `hide-during-unlock` and `hide-during-create` consistently fail with one unlocked app surface instead of zero; no console errors.

Fix direction: invalidate in-flight create/open/restore operations on hide/unmount, guard both state installation and key ownership, and discard stale completion safely. Check restore/reset as related paths, without assuming they are already reproduced.

### BUG-02 · P1 · Return exposes an archive while saving is still finishing

Source: [VaultGate.tsx:30](web/src/components/VaultGate.tsx#L30), [VaultGate.tsx:54](web/src/components/VaultGate.tsx#L54), `storage.ts:forgetKey`.

Steps:
1. Open a note and begin an edit while encryption is delayed.
2. Choose Hide screen before the save finishes.
3. Immediately choose Return.

Expected: Return shows a locked or safely waiting state.
Actual: the unlocked lobby appears until the pending save completes and the asynchronous hide cleanup finally sets `ready` false. This is a separate window from BUG-01 and requires no pending unlock.

Cause: `ready` is reset only after `forgetKey()` finishes; Return clears `hidden` immediately.

Evidence: `hide-return-during-save` fails with an unlocked surface present. The test does not claim loss of saved content.

Fix direction: immediately gate access when hiding while retaining pending unsaved data in a protected recovery path. Do not solve this by discarding failed saves.

### BUG-03 · P1 · Creating room 501 saves an archive that cannot reopen

Source: [wall.ts:103](web/src/state/wall.ts#L103), [storage.ts:42](web/src/domain/storage.ts#L42).

Steps:
1. Prepare an otherwise valid encrypted archive containing 500 rooms.
2. Use New room, enter a name, and choose Hang it up.
3. Wait for “Saved encrypted on this device.”
4. Refresh and unlock with the correct phrase.

Expected: reject the new room with a clear limit message, or support that size consistently through save/load/export.
Actual: room 501 is accepted and saved. After refresh the loader rejects the whole archive as damaged/unsupported. This is an access-loss risk; the encrypted bytes are not proven destroyed.

Cause: creation has no matching room limit; save serializes without `validateWorld`, while load/export reject more than 500 rooms.

Evidence: `room-cap-round-trip` fails after a real encrypted save and reload with an alert on correct-phrase unlock.

Fix direction: enforce one authoritative limit before mutation and ensure older oversized archives can be recovered rather than permanently rejected.

### BUG-04 · P1 · Note 10,001 is accepted although archive validation rejects it

Source: [wall.ts:147](web/src/state/wall.ts#L147), [storage.ts:42](web/src/domain/storage.ts#L42).

Steps:
1. Prepare a valid world with 10,000 notes across 50 full rooms, plus one empty room.
2. Add a note to the empty room using the same store action called by Pin a thought.
3. Validate the resulting world using the loader/export validator.

Expected: prevent exceeding the supported archive-wide limit or support the new total consistently.
Actual: the action accepts note 10,001; `validateWorld` rejects the result. The save path accepts this data, so reopening/exporting is at risk.

Cause: `addSticky` enforces only the 200-notes-per-room limit, whereas the loader also enforces a 10,000-note global limit.

Evidence: `note-cap-validation` fails. This case uses the exact store mutation and validator; unlike BUG-03, a 10,001-note reload was not separately exercised.

Fix direction: guard the global total before mutation, with consistent feedback in both the composer and room editor.

### BUG-05 · P2 · Clearing a draft after Keep still creates an empty note/room

Source: [ThoughtComposer.tsx:11](web/src/components/ThoughtComposer.tsx#L11).

Steps:
1. Write a draft in the lobby and choose Keep it.
2. While choosing the destination, erase the entire draft.
3. Choose Keep this thought.

Expected: the final action rejects an empty draft just as the initial Keep action does.
Actual: an empty note is saved; choosing a new room also creates that unnecessary room.

Cause: only the first-stage button checks `text.trim()`. The final submit handler does not revalidate.

Evidence: `composer-empty-after-keep-choice` fails after waiting for the destination route to settle.

Fix direction: validate current draft text before creating any room or note.

### BUG-06 · P2 · Responsive fairy lights lose keyboard access

Source: [FairyLights.tsx:7](web/src/components/FairyLights.tsx#L7), [FairyLights.tsx:20](web/src/components/FairyLights.tsx#L20), [hanging-gallery.css:54](web/src/styles/hanging-gallery.css#L54).

Steps:
1. At desktop width, keyboard-focus overhead fairy light 2.
2. Resize the window to 360px width (or cross the responsive breakpoint).
3. Try to return to the overhead lights using Tab.

Expected: one visible bulb remains a keyboard tab stop.
Actual: light 2 becomes `display:none` but remains the only bulb with `tabIndex=0`; every visible bulb has `tabIndex=-1`. The entire group is skipped by Tab.

Cause: roving focus state does not reconcile with responsive visibility changes.

Evidence: `fairy-lights-keyboard-after-resize` finds zero visible tab stops instead of one.

Fix direction: when the active bulb is hidden, select a visible bulb as the group's tab stop and handle focus recovery.

## Component-by-component coverage

“Pass” means the exercised checks passed; it does not assert that every possible state/branch is bug-free.

| Component / surface | Checks | Outcome |
|---|---|---|
| App/routes; Lobby; NewRoom; Room | Create/navigate/rename/cancel, duplicate Unicode names, persistence, live repository-base routing | Pass ordinary flows; BUG-03/04 at limits |
| VaultGate | Create/unlock/wrong phrase, migrate, save/reload, concurrent tabs, quota failure, panic hide, delayed operations | Pass ordinary flows; BUG-01/02 |
| ArchiveTools | Export, retry save, nested-dialog hide/help/change phrase | Pass existing privacy/help suites |
| ForgotPassphrase | Export old encrypted archive, explicit reset confirmation, competing tab guard | Pass passphrase-recovery |
| PassphraseDialog | Mismatch, rotation, failure preserving old archive, queued edits, old backup restoration | Pass passphrase-recovery |
| ThoughtComposer | Keep destination, release cancel/confirm, draft preservation while help is open | Pass ordinary flows; BUG-05 |
| RoomTag | Door navigation, locked-room presentation, release/cancel, responsive layout | Pass current suites |
| RoomName | Unicode/duplicate names round-trip; source review of decorative text layer | Pass checked paths; legacy dust is CSS-hidden |
| DiaryNote | Read/open, keyboard reposition/persist, pile/reassemble, light reveal, release | Pass |
| NoteEditor | One editor, formatting selection, 10,000-character boundary, previous/next, media, narrow/short viewport | Pass |
| PileText; useLetterPile | Individual graphemes, transforms, bounded settling, enable/disable, reduced motion | Pass physical/room-motion/shared suites |
| ReleaseDialog | Cancel/confirm deletion, delayed release, hide, reduced motion | Pass |
| ItemPrivacy | Note/room lock, temporary read-only preview, nested locks, explicit removal, locked-item exclusion, share link/file | Pass serial rerun |
| RichContent | Escaped HTML, Markdown, safe URL confirmation, styled text reveal, real content | Pass |
| Shared page | Wrong/right phrase, hash replacement without reload, hide/new invitation, close/reopen, invalid/bare link, reply entry | Pass |
| SharedLetter | Seal/open/fold/reopen, per-note reveal state, actual image/audio/video/link content | Pass |
| SharedBackdrop | Continuous scene, light toggle, 360/768/1440 layout captures | Pass inspected states |
| Wick | Wrong/right phrase states, reduced motion, mobile greeting clearance | Pass existing shared-space checks |
| FallingLetters | Three OFF/ON cycles, bounded nodes/emission rate, visibility while on/off, reduced motion | Pass |
| FairyLights | Activation and audio; keyboard responsive-state transition | BUG-06 |
| DarkBackdrop | Pointer depth, hidden-tab suspension, reduced motion | Pass ui-polish |
| TorchCursor | Match/wand switch, touch hiding, editing fields, physical motion | Pass private/physical/shared suites |
| InteractionFeedback | Distinct surface sounds, default mute, rapid toggles, immediate tail silencing, click depth | Pass physical/sound-state |
| Arrival | Fresh-entry appearance and dismissal; reduced-motion skip exercised in setup | Pass exercised entry flows |
| HelpGuide | Search/no-results/reset, download, focus restoration, drafts, nested hide, mobile | Pass |
| LetterSeal; ShareLetterIcon | Built SVG assets, icon integration through lobby/recipient/share controls | Build/integration pass; aesthetic judgment not a regression assertion |

Data/services: AES-GCM snapshot round-trips, encrypted IndexedDB save/restore, Web Locks concurrency, media type/decode validation and large files, safe links, search, and public share URL routing are exercised through the suites. Public testing used synthetic content only.

### Historical/unmounted code

`RainbowFlame`, `RoomToolsMenu`, `StickyNote`, `WebGLTorchField`, `WorldAtmosphere`, and `WritingStylePicker` have no import path from the current app entry. They were inventoried, not claimed as tested live UI. Historical `archive-interactions.cjs` and `gallery-interactions.cjs` target the retired plaintext flow and are not valid current acceptance tests.

## Test execution and artifacts

Current-suite runner: `qa/regression-all.cjs` (serial by default; `QA_SUITES` selects comma-separated suites). It supplies the configured installed Chromium to older suites that did not support the executable override, logs each suite, and continues after failures.

New regression probes: `qa/regression-edge-cases.cjs` (`QA_CASES` selects named cases). This intentionally exits nonzero while the confirmed bugs remain unfixed; assertions describe desired safe behavior, not the broken behavior.

Set `QA_BASE_URL` to a running local Vite origin and `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to the installed browser when its version differs from Playwright's default. Then run:

```sh
node qa/regression-all.cjs
node qa/regression-edge-cases.cjs
npm run build:pages --prefix web
npm run lint --prefix web
```

Production smoke uses `QA_BASE_URL=https://krithi-1304.github.io/STICKY_WALL_WORLD/ node qa/deployment.cjs` with the same browser override.

Local full logs and failure screenshots:
- `/tmp/black-wall-regression-UrizHx` — initial suite run.
- `/tmp/black-wall-regression-sH2KVI` — serial confirmation of all three timeouts.
- `/tmp/black-wall-edges-DvXKOk` — final 14-case edge run; JSON and failure screenshots.

The compact JSON result is saved in the repository; `/tmp` artifacts are temporary.

## Review boundaries

- Chromium on macOS with emulated device dimensions; no physical iPhone/Android, Safari, Firefox or screen-reader run.
- No claim of exhaustive branch coverage, formal penetration testing, memory-leak proof, or all-browser certification.
- Crypto timing and high-count fixtures are intentionally injected test conditions, clearly distinguished from normal UI journeys.
- Accessibility review used the current [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md); BUG-06 was reproduced in the browser, not inferred solely from a checklist.
- CI's existing `end-to-end.cjs` runs only eleven baseline suites. Shared-space/public-share and these new edge cases are not currently in that gate. Add them after repairs, keeping heavy media tests serial to reduce timing sensitivity.
