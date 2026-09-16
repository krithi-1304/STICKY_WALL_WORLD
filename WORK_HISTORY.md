# Black Wall work history

This file records the work completed in the repository and the current rollback map. The product remains a local, browser-saved “night archive” where rooms hang like keepsakes and notes live on a matte black wall.

## Current state

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
