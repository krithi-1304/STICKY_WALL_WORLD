# Black Wall work history

This file records the work completed in the repository and the current rollback map. The product remains a local, browser-saved “night archive” where rooms hang like keepsakes and notes live on a matte black wall.

## Current state

### September 17 — illuminated hanging gallery

References inspected: pins `862509766163278050` (paper and fairy lights), `1072701204979237493` (rows of clipped cards), and `658792251712168155` (brown cards with colorful clips). The existing gallery remains the layout and product concept.

- Added curved brown cords with twisted highlights, glass bulbs and metal sockets, wood-grain heart clips, paper corners, and softly colored cards. Hover/focus catches a brighter colored light; controls have glass highlights and depth.
- Every visible bulb is clickable, with a 44px target, a 1.6-second brighter glow and light spill. Card-strand bulbs illuminate their card; the lobby subtitle catches warm reflected light. Keyboard users enter a strand once and use Left/Right/Home/End to choose bulbs.
- Lobby links and non-destructive buttons emit a brief rainbow flame. The effect lives outside routes so navigation is immediate; only one burst exists at a time. Deletion deliberately has no celebratory flame. Reduced motion removes flame travel and bulb pulsing while retaining immediate light feedback.
- Room chimes now derive pitches, intervals, timing, and decay from room identity. Opt-in sound and remembered mute remain. Browser tests recorded different oscillator frequencies for two rooms; this is not a physical-speaker listening test.
- Replaced vague supporting copy with instructions about creating rooms and pinning thoughts, literal room counts, and clear empty/search states. The title is preserved; the browser-local storage notice remains accurate.
- Fixed deletion focus recovery, stale search after deleting the final room, long search-copy wrapping, and bulb hit-area overflow on small screens. Reduced bulb density on narrow screens. Fixed motion-preference changes interrupting keyboard-triggered flames.

Validation: build, lint, original archive regression suite, and `node qa/gallery-interactions.cjs`. New checks cover ten rooms, a 60-character name, long searches, 320/390/768/1024/1440px layouts without horizontal lobby overflow, light activation/expiry, keyboard bulb selection, rainbow cleanup across navigation, distinct chime pitches, reduced motion, and emulated touch taps. Reviewed desktop/mobile screenshots. No external responsiveness score is claimed; physical devices and Safari/Firefox remain untested. Direct review used the previously loaded motion/Impeccable guidance and preserved the requested glass/material treatment as an intentional design choice.

Rollback: revert the commit titled `feat: add interactive fairy lights and colorful hanging cards` to remove this slice together. No production dependencies were added.

### September 17 — stronger fire and colored atmosphere

Follow-up reference: https://in.pinterest.com/pin/571816483961203348/. Inspected the supplied pin's thumbnail (gold flame with blue/pink smoke) and retrieved its video; this implementation interprets the visual direction rather than claiming frame-matched motion.

- Increased the cursor flame to 66px with a bright core, independently moving gold/blue tongues, a larger wooden match, colored smoke rising 128px, and drifting sparks.
- Added a feathered pointer glow and blue/rose/amber background light with slowly drifting vapor over the existing water. Preserved gallery layout, text, controls, and paper.
- Added no dependencies. The cursor remains hidden while editing, on touch, and under reduced motion; background vapor becomes static with reduced motion.
- Validation: production build, lint, and Chromium interaction suite, including flame-layer presence and background/reduced-motion checks. Desktop screenshot reviewed for flame visibility and text legibility. Physical device/GPU performance remains unverified.
- Rollback this follow-up independently using the commit titled `feat: intensify match flame and colored atmosphere`.

### September 17 follow-through — requested task checklist

The recent requests are treated as refinements of the existing hanging-room gallery. Message timestamps are not available, so this checklist uses the recent reference-led prompts and the latest instruction to preserve the concept.

- [x] Preserve the black walls, hanging room tags, handwritten lobby title, and paper notes. Retain the existing transparent floating-title treatment and glass switch.
- [x] Replace the decorative cursor with a wooden lit match, flickering flame, warm glow, and three animated smoke curls. Keep the precise native pointer; hide decoration over text fields, on touch, and with reduced motion.
- [x] Complete the light-on ignition/smoke animation and cancel it correctly during rapid toggles or navigation.
- [x] Give room names a small particle hover effect while preserving readable text; fix the old rule that prevented room-heading hover.
- [x] Add brown thread and heart-marked clips, with a short settling shake on the inner tag so the clickable link stays still.
- [x] Keep subtle dark-water reflections below the gallery and glass highlights on controls. Paper remains readable rather than turning every surface transparent.
- [x] Make Delete visible and touch-sized. Confirm before deleting a room and its notes through the existing store action.
- [x] Provide opt-in chimes with a remembered preference, rate limiting, and one reused audio context.
- [x] Explain browser-local storage in the lobby. Keep search and room creation discoverable.
- [x] Correct water overflow, narrow-screen toolbar layout, and stale room-heading positioning. Wake controls on keyboard/touch activity and clear note focus after deletion.

### Review and limits

The black-water reference works as restrained atmosphere behind the hanging gallery; stronger movement would compete with writing. The original visual concept is preserved. References informed material and motion direction; exact video timing has not been verified.

Impeccable's launcher returned permission denied, so review used the installed audit guidance, project PRODUCT/DESIGN documents, source inspection, and Chromium interaction checks. This is not a full accessibility certification. Intentional exceptions: existing gallery copy/typography is preserved; requested glass and decorative motion remain; the 720ms paper settle and 1.4s ignition never delay actions. Reduced motion disables the added ambient effects.

Remaining product work, separate from this visual pass:

1. **Sharing and privacy:** rooms are still local to this browser, not publicly shared or encrypted. Real shared secrets require persistence, access/edit keys, expiration, and deletion rules before presenting them as private online rooms.
2. **Recovery:** export/import and undo or trash would help users recover deleted notes and protect against cleared browser storage. Current deletion confirms and is permanent.
3. **Broader validation:** physical touch devices, Safari/Firefox, assistive technology, and low-end GPU performance still need dedicated coverage. Current responsive evidence is Chromium viewport emulation.

The automated regression script is `qa/archive-interactions.cjs`; run the Vite server on port 5173, then `node qa/archive-interactions.cjs`. It uses an isolated browser session and writes screenshots to a temporary directory, without modifying the user's saved rooms.

Validation: production build and lint pass. Chromium checks cover room creation, note writing and reload persistence, animated cursor smoke, light timing and rapid toggles, sound preference persistence, search recovery, 1440/768/390/320px layouts, reduced motion, and both canceled and confirmed cascading deletion. The wall remains a scrollable canvas; smaller screens preserve saved note positions.

Rollback for this follow-through: the implementation, regression script, and checklist are grouped in the commit titled `fix: complete matchstick and gallery interactions`. Revert that commit to return to the prior gallery state; do not reset or discard saved browser data. Older rollback commands below describe their historical slices and are not a substitute for reverting the newest dependent change first.

## September 17, 2026 — resumed private archive build

The current authority is `BUILD_SPEC.md`. Earlier entries below describe historical versions. The resumed session inherited a substantial uncommitted implementation; it did not recreate those features or discard existing changes.

**Product:** no account and no public sharing. Choose a device-local passphrase, write in the lobby, then Keep it in a room or intentionally Let it go. Rooms are readable diary walls with wood, opaque paper, tape, dates, a light switch, and one open editor. The dark sea, amber light, heart clips, and fairy lights connect the two spaces. Glass belongs to controls. The paragraph-to-learning-graph idea is a separate future product, not part of this archive.

**Already present when resumed:** lobby composer/search, hanging tags and room deletion confirmation, room renaming, automatic note grid, radial reveal and staggered letters, note editing/navigation, limited Markdown and safe links, audio/video limits, muted-by-default synthesized sounds, reduced-motion styles, encrypted IndexedDB, legacy migration, backups, and panic hiding. These were source-level findings until exercised in the browser.

**Fixed in the resumed pass:**

- A waiting tab unlocked a stale encrypted snapshot after the first tab saved newer writing. The existing failure test reproduced this. Unlock now acquires the writer lock before reading the latest envelope; failed attempts release the lock.
- An old creation screen can no longer overwrite an archive created by another tab. Restore separately decrypts the selected file, confirms replacement, and checks for an archive appearing before the write. Choosing an invalid backup clears any previously selected backup.
- The editor now uses a native modal dialog, closes cleanly on unmount, names its modality, and stays above the wall. Backup, retry, and panic controls remain available inside it. Release confirmation also offers panic hide. Router-aware hiding returns to the lobby correctly.
- Formatting cannot push a note beyond its 10,000-character limit. Wall previews always offer an explicit path to the full text.
- Room deletion and privacy controls have 44px targets. The tape retains its small visual size with a larger hit area. Placeholder contrast is improved.
- Added an overhead copper lamp, warm light falloff, brief match flare/smoke on relighting, and bounded movement-driven cursor smoke. Reduced motion removes the added travel effects. No animation blocks light toggling.

**Validation:** `npm run build`, `npm run lint`, and `git diff --check`. Run `npm run dev -- --host 127.0.0.1` from `web/`, then `node qa/private-archive.cjs` and `node qa/privacy-failures.cjs` from the repository root. Both use isolated browser storage, never the user's archive. The scripts expect port 5173.

Browser coverage includes create/write/reload, wrong passphrase, encrypted content checks, audio upload and size rejection, rich-text safety, canceled external navigation, radial reveal, one modal editor, keyboard focus staying out of background controls, previous/next notes, release cancel/confirm, room deletion and reload, encrypted export/restore, panic hide, 1440/768/390/320px lobby widths, 390/320px touch-emulated editor, reduced motion, rapid light toggles, saved sound preferences, and no page errors. Failure coverage includes legacy migration, concurrent-tab blocking, storage quota failure, export while saving fails, retry, reopening the latest text in a second tab, malformed backup, corrupt legacy data, and stale creation screens.

**Review and limits:** Impeccable's launcher failed with permission denied; review used its installed guidance, source inspection, and Chromium screenshots. The mobile editor's initial layering issue was corrected and the settled screenshot checked. 21st.dev was searched; existing components fit the paper/wall language, so no component dependency was added. Three main Pinterest references failed to load; exact reference matching is not verified. These checks are not an accessibility certification or a security audit.

Before public release, exercise Safari/Firefox, physical touch/virtual keyboards, screen readers, low-end GPU behavior, full video/duration-limit coverage, and authenticated-but-malformed imports. Visual refinements still possible: more natural wood/water and flame texture, a true recorded chime instead of synthesized tones, and burning the original card rather than the current confirmation-paper representation. The editor uses a short entrance with immediate close; a spatial return-to-wall transition is not implemented. Do not present these approximations as exact reproductions or promise therapeutic outcomes. Nothing has been deployed or committed by this resumed session.

---

The committed product baseline is `627cdcd` (`docs: record room controls refinement`). The lobby and room experience at that commit are the preserved design: hanging room tags, a quiet dark gallery, search, room symbols, torchlight, sticky notes, and room controls.

The current product includes a glass 3D hover treatment on the existing lobby title, “Rooms for thoughts that stay.” It keeps the title text and layout, but wraps each word so the words can lift independently. The effect includes frosted translucent panels, milky pastel lettering, layered depth shadows, a highlight streak, and a small sparkle. It is CSS-only and has a reduced-motion fallback. A later reference-led pass adds the room light’s compact glass switch and a short room-tag wobble that settles on hover.

## Work completed in the project

The Git history contains the earlier product slices, in order:

- Foundations for room and sticky-note state, storage, symbols, slugs, search, and the app shell.
- Lobby and room tags with threads, pins, room symbols, and local room creation.
- Sticky-note placement, overlap protection, deterministic wall slots, tidy/sort behavior, and compacting after deletion.
- Torch cursor, ink-lantern cursor, sparkle trail, sparkle wake, and reduced-motion handling.
- Room light controls, dark beam reveal, word constellation mode, and room state refinements.
- Lobby search creation and archive thread/icon refinements.
- Room controls and light-burst refinements.
- Pinterest reference-led material pass: transparent glass room switch and a short 3D room-tag hover wobble. The pearly bubble-letter experiment was reverted; the earlier glass title remains.
- Black sea atmosphere and tactile interactions: low-contrast animated water rings and glyphs in the lobby, match flame and smoke on room light-on, a small match-flame cursor, glass treatment across navigation controls, room-name hover echo, room deletion with confirmation, and a quiet throttled two-note chime on room hover.

Some experimental lobby redesign work was intentionally rolled back before this title slice. The preserved lobby is the prior hanging-tag design.

## Files changed by the current slice

- `web/src/pages/Lobby.tsx` — wraps the existing title words in spans and adds an accessible `aria-label`.
- `web/src/index.css` — adds the title’s 3D perspective, glass panels, hover transitions, shadows, highlight, sparkle, the glass room switch, room-tag wobble, and reduced-motion rules.
- `AGENTS.md` — records the installed skill routing and token-efficient working habits.

## Usability review

The primary path is clear: lobby → create or open a room → pin a note. Search remains keyboard accessible, room tags remain large click targets, and deletion is separated from the room-opening link with a native confirmation. Room deletion also removes its notes through the existing single store write path.

The next product improvements to consider are share/edit keys for public links, an explicit sound preference if chimes become frequent, and an undo affordance after deletion. Those belong to the Keys and Echoes stages and should be designed before adding a backend.

## Commit and rollback map

The changes are split into small commits:

1. `d49d465 docs: record project work history and workflow` — this file and the durable `AGENTS.md` guidance.
2. `7da357f feat: add glass 3d hover title to lobby` — the lobby title markup and CSS only.
3. `d46e20f feat: refine lobby glass title float` — title transparency and floating depth calibration.
4. `03db781 feat: match lobby title to pearly bubble reference` — experimental bubble-letter treatment.
5. `535e992 Revert "feat: match lobby title to pearly bubble reference"` — removes that experiment and restores the prior title.
6. `1c249f8 feat: add glass room switch and tag hover motion` — reference-led room switch and room-tag hover motion.
7. `1d5aa68 feat: shape black sea atmosphere and tactile room interactions` — black-water lobby, match-light reveal, glass chrome, cursor flame, room-name hover, delete action, and chime.

To remove only the title treatment while keeping the documentation:

```sh
git revert 7da357f
```

To remove the documentation/workflow commit as well:

```sh
git revert d49d465
```

To return to the preserved product baseline before both commits:

```sh
git revert 7da357f d49d465
```

`git revert` makes a new inverse commit, so the history stays recoverable.

To remove only the latest room switch and room-tag motion:

```sh
git revert 1c249f8
```

The latest title state is preserved by `535e992` reverting the experimental bubble-letter commit; `d46e20f` remains the title-depth refinement underneath it.

To remove the black-sea interaction pass while retaining the prior title and switch work:

```sh
git revert 1d5aa68
```

## Validation

The current slice passes:

- `npm run build` in `web/`
- `npm run lint` in `web/`
- `git diff --check`

## September 18, 2026 — passphrase recovery prepared; live application pending

Completed recovery implementation in `/private/tmp/black-wall-recovery-606ujtmi`, served separately on port 5180. Durable, checked patch: `qa/recovery-ready.patch` (apply with `git apply qa/recovery-ready.patch` only after resolving the user's unlocked-tab status). The live project source was deliberately not updated: its port-5173 preview is running, the user forgot their passphrase, and a hot reload of the storage module could discard their sole unlocked key. Asked whether any tab still displays their notes; answer pending. Do not treat silence as confirmation that every tab is locked.

Patch adds Change passphrase to the privacy bar and editor, a modal that re-encrypts the current archive without requiring the old passphrase, and Forgot passphrase guidance. Starting fresh requires downloading the old encrypted envelope, entering a new matching passphrase, and typing START FRESH; it checks the writer lock and unchanged exported envelope before replacing anything. Old backups still require their original passphrase. No actual user archive was reset or accessed.

Validation in isolated copy: build, lint, existing private-archive and privacy-failures suites, and new passphrase-recovery suite all pass. New checks cover failed write preservation, edits queued during key rotation, old-key rejection, mismatch handling, explicit reset gating, concurrent-tab protection, new empty archive reload, restoration of the old backup, and 320px form reachability. Mobile screenshot reviewed; long-form alignment corrected. `git apply --check qa/recovery-ready.patch` passes. Direct focused quality review used existing components; no new design dependencies. Safari and physical-device testing remain outstanding from the prior handoff.

Next: if all tabs are locked, apply the checked patch; user then chooses whether to start fresh. If a tab remains unlocked, preserve that session and recover its in-memory world through a deliberate export/rekey step before touching live source. Do not tell the user to reload an unlocked tab. Recovery does not bypass encryption.

## September 18, 2026 — recovery applied; preferred gallery restored

User confirmed an archive remains unlocked in another tab and authorized applying all changes. First installed a small `UnlockedRecovery` control using the existing storage module, preserving its live key. Tested re-encryption, new encrypted export and reopening using the new passphrase in disposable storage. The user's own recovery still requires them to enter a new passphrase and download the backup; no user archive was read or reset by the agent.

Stopped the original Vite server (PID 3273, port 5173) before changing storage.ts, preventing its HMR from replacing the unlocked session. DO NOT restart port 5173 until the user has saved a new passphrase/backup: Vite's old client can reload automatically when that server returns. The loaded old tab has the recovery control and performs crypto/storage/download locally without the server. No guarantee about tab survival if the browser discards or reloads it. Updated project preview is at http://127.0.0.1:5182; this origin has separate browser storage. User can restore the newly downloaded backup there. Original tab should stay open until recovery succeeds.

Applied the previously tested passphrase rotation, Forgot passphrase, download-before-start-fresh and concurrency guards. `qa/recovery-ready.patch` is now historical and MUST NOT be reapplied. Restored the previous handwritten title, main overhead FairyLights, gold/blue flame layers from firelight.css, subtle colored atmosphere and movement-driven smoke; preserved the wand state, touch behavior and reduced motion. Current storage code is the prepared implementation; temporary UnlockedRecovery remains as a record/support for the existing old session and is no longer imported by VaultGate.

Build and lint pass. Recovery suite passes on 5182. The visual-only live version also passed private-archive and privacy-failures before full recovery integration. Reviewed desktop and mobile screenshots: restored title and lights are visible, controls readable, no horizontal overflow. Impeccable launcher could not execute; focused review used its installed guidance and existing product/design docs. Full integrated browser suites run on 5182 via QA_BASE_URL. Physical-device and Safari/Firefox checks remain outside this pass.

Final integrated validation on 5182: private-archive, privacy-failures and passphrase-recovery all PASS, along with build, lint and git diff --check. No deployment or commit performed.


## September 18, 2026 — user confirmed recovery complete

User said “done continue” after the passphrase/backup/restore instructions. Resumed the normal preview at 127.0.0.1:5173 and retained 5182 so the restored archive there remains accessible. These are separate storage origins; never silently transfer or overwrite either. Removed the now-unused UnlockedRecovery component and already-applied recovery-ready.patch. Earlier stop-server and pending-recovery instructions above are historical and superseded by this entry. The normal Change passphrase / Forgot passphrase flows remain. No user data was inspected, moved or reset.

## September 18, 2026 — existing-world physical enhancement and private sharing

User requested realistic lighting/depth/falling paper without redesign, then photos, audio, links, scoped sharing and heart-shaped per-room/per-note locks. Preserved the title, layout, routes, paper and existing elements. No agent delegation, heavy library, accounts, cloud service or deployment added.

**Motion/materials:** diagnosed lamp collision as reuse of the centered `match-light-reveal` container (110×150, inherited negative centering) inside a 70×60 lamp. Replaced only its lamp use with a dedicated 800ms approach/contact/retreat path: flame reaches bulb underside at 340ms; wood remains below; OFF cancels pending ignition. Added two smaller lamps, material shading, warm falloff/bloom and surface response. Existing tilt gains elevation, press feedback and highlights. Room-tag navigation uses a 340ms perspective flight with surrounding retreat; modified clicks remain native. Note editor opens from its wall rect with perspective, then closes using sampled quadratic gravity; letters have deterministic differing delays/drift/rotation/duration. Confirmed deletion persists first while a local visual copy finishes falling, preventing navigation during animation from resurrecting a deleted note. Closing the editor does not delete notes. Word grouping avoids letter-by-letter line breaks in previews. Reduced motion bypasses travel; no looping JS animation.

**Media:** allow JPEG/PNG/WebP photos (3 MB, upload decode check, 16 MP), plus explicit photo/audio/video buttons and HTTP(S)-only link insertion. Existing audio/video and 8 MB archive limits remain; locked media counts toward the same budget. Images render as image elements with filename alt text; safe React rich text remains unchanged.

**Privacy/share decision (local stage retained):** asked about local snapshots versus an online storage service; no preference response received while independent work continued, so proceeded with the stated local default. AES-GCM/PBKDF2-protected snapshots support single note, room, or entire space. Locked items are excluded. URL fragments are limited to 12,000 encoded characters; larger content uses an encrypted file, never silently drops media. `/shared` bypasses the recipient's vault creation gate, validates decrypted input, displays read-only content and keeps it memory-only; removes fragment from current history and offers immediate hide. Recipient must receive share passphrase separately. No automatic upload, recipients/contact integration, public links service, revocation or live updates. Preview-origin URLs cannot reach another person's device; hosting remains necessary for actual external link access. UI explains these limits.

**Item locks:** separate authenticated encrypted payloads for notes and rooms; room payload retains nested note locks. Outer archive encryption/backups still apply. Locked note text/attachments leave the normal store; locked room name becomes a neutral label and its notes leave the normal store. Routes/metadata remain for navigation. Locked targets reject ordinary edit/add paths. Unlock validates IDs/world structure and removes the extra lock; it is not a temporary auto-relocking session. Explicit UI warns that item passphrases cannot be reset. Source/state review covered concurrent async updates, media quota counting, wrong passphrases, malformed envelopes, panic during shared unlock, and safe recipient rendering. This is not an independent security audit.

**Validation:** `npm run build --prefix web`, `npm run lint --prefix web`, `git diff --check`, plus `node qa/private-archive.cjs`, `node qa/privacy-failures.cjs`, `node qa/passphrase-recovery.cjs`, `node qa/physical-interactions.cjs`, `node qa/media-sharing-locks.cjs` all pass in isolated Chromium storage. New coverage: unlit/no-glow, three lamps, sampled shade clearance throughout match path, rapid toggles, accelerating close, letters, close preserves text, actual DOM falls before removal, responsive/reduced motion, decoded photo and oversized rejection, audio, safe-link entry, wrong nested-lock passwords, reload, locked-room encrypted backup/restore preserving inner note lock, share exclusion, selected-note media export/recipient rendering, no plaintext in share file, whole-space export, recipient hide. Existing tests updated to await animation outcomes; recovery restoration now uses actual UI instead of a separate Vite module instance.

**Focused review:** used installed Impeccable guidance, source inspection and desktop/mobile screenshots; native modal focus and high-opacity paper retained. Pinterest pages for falling text and heart locks were unavailable; no exact-reference claim. Locks use an original inline SVG heart/shackle/keyhole. Physical phone, Safari/Firefox and independent security/accessibility review remain. No user archive was read, reset, shared or published by the agent.

## September 19, 2026 — final narrow-screen handoff

Continued final validation at the user's request. Build/lint and the extended media-sharing-locks suite pass; the latter now checks the 320px share dialog and captures the 390px heart-lock note layout. Reviewed both screenshots: dialog scroll is reachable, existing room composition preserved. Darkened the locked-note button label/border for readable contrast on paper. All five suites passed during this implementation; no public deployment performed. Normal preview remains http://127.0.0.1:5173. Large snapshot sharing uses encrypted files; cross-device URL sharing still requires a reachable hosted copy of this app. Independent security review, real devices and other browsers remain before public release.

## September 19 — make word falling perceptible

User reported that the promised word fall was not visible. Found two causes: dim-state lettering inherited the same dark color as the note, and editor paper began falling concurrently with its letters. Replaced the editor's character fragments with whole-word fragments, varied 660–839ms falling durations and staggered delays, paused the paper for 450ms before its 680ms exit, and positioned the effect within the visible editor when Done is clicked after scrolling. Wall darkening and confirmed release animate visible word groups, with the letter transforms disabled during that effect; paper release pauses 350ms. Reduced motion skips the travel. Closing still preserves content.

Build/lint pass; physical-interactions passes with new assertions for distinct word transforms and visible opacity at 350ms. Inspected `/private/tmp/words-falling-midway.png`: words visibly detach/tumble independently while paper is still stationary. Whitespace check passes. No data/schema changes.


## September 19 — persistent word piles, steel bindings and material feedback

Latest user direction supersedes disappearing letters and the old attachment limits. Preserved the title, fairy lights, routes and existing composition.

- Words now settle within the lower part of the paper and remain visible. `useWordPile` measures flow positions only when text/size changes; each word has a different landing position, angle and delay. Opening visibly reassembles the words. Closing returns the editor to its wall position after the words settle; it never deletes the note. Previous/next navigation also preserves the outgoing pile. Confirmed release still drops a visual paper copy after saving deletion. Text remains available through the ordinary editor and accessible labels; reduced motion skips travel.
- Added crossed braided steel strands behind centered heart padlocks on existing locked tags, notes and the room unlock panel. Encryption/unlock behavior is unchanged. Standardized control and form typography without changing note handwriting or titles.
- Existing controls receive a brief depth press/release; notes and room tags retain spatial opening. Centralized hover/focus feedback chooses paper, glass, metal, light, door or ink tones, slightly varied and throttled. Master sound remains off by default and stops feedback when muted; touch does not emit hover sounds. No added animation library.
- Existing sea layers gain broken reflections and restrained pointer parallax, with a static reduced-motion fallback. Visuals remain procedural; no claim of photographic or exact Pinterest matching.
- Removed app-imposed audio/photo/video byte, duration and photo pixel limits, the 8 MB archive budget, and conflicting backup/share/private-envelope caps. Retained three files per note, allowlisted formats and decode checks. File import metadata waits up to 60 seconds. Browser quota, memory and decoding support are still real constraints; heavy media remains base64 inside the encrypted snapshot, so practical capacity is device-dependent. Large snapshots use encrypted files rather than oversized URL fragments.

Validation: build/lint; physical-interactions verifies different scheduled hover pitches, master mute, click depth, three lamps, no unlit glow, sampled shade clearance, rapid toggles, visible bottom piles and reassembly, close preserves text, delayed deletion, reduced motion and mobile. Large-media verifies a 180-second WAV (2,880,044 bytes), PNG (8,833,327 bytes), WebM (4,194,715 bytes), aggregate above 8 MB, backup above 20 MB, encrypted restore, shared-file recipient playback and nested note lock/unlock. Main archive and media-sharing-locks suites pass. Reviewed word-pile, mobile editor, locked-note, room-lock and sea screenshots. All browser checks use isolated test archives.

Remaining: real-device/Safari/Firefox validation and independent security/accessibility review. No deployment or user archive access; shared localhost URLs still require hosting to work on another device. Large-file processing is not streaming and has not been tested at arbitrary gigabyte sizes.

## September 20 — individual-letter correction and reproduced lock fixes

User explicitly corrected the requested pile from whole words to individual letters and reported unspecified lock failures. `PileText` uses grapheme segmentation and stationary word wrappers: ordinary reading still wraps at word boundaries, but each grapheme has its own measured landing position, angle and delay. `useLetterPile` replaces the prior word measurement hook. Letters remain inside the paper; opening reassembles them. Removed inherited whole-wrapper falling so it cannot carry/fade the letters away. Accessible full text is unchanged.

Reproduced and fixed navigation selecting encrypted notes into a blank ordinary editor: previous/next now filters those entries and the editor excludes locked content. A note-lock operation closes its editor immediately before committing validated encrypted state, preventing a blank editor during persistence. The entire locked note, including its central heart seal, is now the existing unlock button's target. Added explicit 12–200-character guidance to lock/share forms. A clarification was requested about the remaining lock expectation (automatic relocking versus incorrect passphrase/button behavior); no answer received at handoff. Current unlock still removes the extra lock and the UI states that behavior. No automatic-relocking architecture was inferred.

Validation: build, lint (no warnings), whitespace check, physical-interactions, media-sharing-locks, private-archive pass. Tests verify single-letter fragments, stationary wrappers, visible settled pile bounds, reassembly, material-specific hover pitches/master mute, click depth, lamps, reduced motion, mobile, wrong item passphrases, nested room/note lock persistence, backups/shares and navigation skipping locked notes. Reviewed settled-letter and bound-room-tag screenshots. Fixed two test timing assumptions: await image decode before inspecting dimensions, and await editor closing before a second mobile tap. Larger-media backup/share tests passed in the preceding slice; no repeat was needed for the letter/UI-only correction. Remaining cross-browser and physical-device review is unchanged.

## September 20 — temporary unlock by default

Continued the unresolved lock behavior. “Unlock item” now opens a read-only private view held only in dialog memory; it never replaces the encrypted item in the store or saved archive. Closing, Escape, reload or panic hide preserves the item lock. The separate unchecked option “Remove this lock so I can edit” enables the explicit permanent-removal action. This supersedes the earlier unlock-removes-lock default. Existing encrypted archives need no migration. Room previews keep independently locked notes concealed; opening those separately currently requires removing the room lock first. Editing inside a temporary view is not implemented.

Added validated preview decryption with item/room identity checks and a post-decryption check that the target is still the same encrypted item. Preview render reuses safe rich text and existing media controls; passphrase input is cleared after opening. Keyboard focus moves to the labelled private view. Reviewed the 320px scrolling preview with photo/audio.

Validation: build, lint and whitespace check pass. Extended media-sharing-locks passes with temporary note and room views, closing retains locks, wrong passphrases, explicit removal, nested locks, encrypted backup/restore, sharing exclusions, focus, 320px layout and panic-hide/return keeping the room locked. Fixed a QA selector that targeted lobby controls before the room transition completed. One intermediate run's post-navigation locked-note assertion failed without captured state; added diagnostic context and the complete rerun passed. No claim that all intermittent issues or other-browser behavior are eliminated. Individual-letter piles and prior large-media behavior are unchanged.


## September 26 — help, usability, black atmosphere and hosting

Added a single-source 13-topic help guide with search and Markdown download, available before unlocking and from the archive, note editor, recovery and shared-snapshot screens. Native modal focus preserves writing context; close returns focus, and panic hide remains available. Corrected entry/restore explanations, busy-state controls, mobile toolbar spacing and room-name readability. Keyboard room entry is immediate and repeated click feedback cancels earlier animations.

The latest user direction replaces sea lines, waves and moon with broad animated charcoal folds on black. Background motion uses transformed layers, small pointer depth, hidden-tab pausing and a static reduced-motion state. Sound state now commits before playback; a master gain and tracked sources silence immediately on mute. Async generation checks prevent delayed playback from earlier toggles. The toggle has no foley of its own.

All nine current end-to-end suites pass, including measured Web Audio output rather than oscillator-count-only checks. Coverage includes archive persistence, failure recovery, rotation/reset, media/shares/locks, large files, physical interactions, entry/layout, help and actual sound states. TypeScript/Vite production build and lint pass. Screenshots inspected at desktop and mobile sizes. Impeccable launcher was not executable; direct review used its guidance and incumbent project documents. Physical devices, Safari/Firefox and independent accessibility/security review remain untested.

Prepared GitHub Actions Pages deployment with repository-path-aware routes/assets/share URLs and a separate live-origin smoke test. Dynamic room URLs use the app’s custom Pages 404 fallback. Existing local archives are not moved to the hosted origin: users export and restore encrypted backups. Deployment status is recorded after publishing.


## September 30 — Pinterest-led moonlit gallery and room motion choice

Latest user feedback supersedes the charcoal folds. Researched Pinterest night-sky references and inspected a pin through its oEmbed preview. Generated original cloud art with the built-in imagegen tool; saved it in `web/public/night-clouds.png`. Separate crescent and six stars provide responsive composition and soft motion; cloud drift, hidden-tab pause and reduced motion remain. Removed the superseded sea/fold CSS. Reference links and the generation prompt are in `DESIGN_REFERENCES.md`.

Added encrypted per-room `fallingLetters` preference, defaulting to on for older archives. Off disables dim/close piles and editor falling delay while retaining text, note deletion confirmation and other controls. The choice survives reload, restore and room locking. Help documents the setting.

All ten end-to-end suites pass locally, including the new preference/backup/independent-room checks and actual audio output. Desktop/390px/320px visuals inspected. Production build and lint pass. The earlier GitHub run found a QA race clicking the lobby unlock button before its room flight completed; the test now waits for the locked-room screen. Publishing continues through the existing Pages workflow and live-origin test.
