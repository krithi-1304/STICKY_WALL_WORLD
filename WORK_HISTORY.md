# Black Wall work history

This file records the work completed in the repository and the current rollback map. The product remains a local, browser-saved “night archive” where rooms hang like keepsakes and notes live on a matte black wall.

## Current state

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
