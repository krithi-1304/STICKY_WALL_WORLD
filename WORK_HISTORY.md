# Black Wall work history

This file records the work completed in the repository and the current rollback map. The product remains a local, browser-saved “night archive” where rooms hang like keepsakes and notes live on a matte black wall.

## Current state

The committed product baseline is `627cdcd` (`docs: record room controls refinement`). The lobby and room experience at that commit are the preserved design: hanging room tags, a quiet dark gallery, search, room symbols, torchlight, sticky notes, and room controls.

The current uncommitted slice adds a glass 3D hover treatment to the existing lobby title, “Rooms for thoughts that stay.” It keeps the title text and layout, but wraps each word so the words can lift independently. The effect includes frosted translucent panels, milky pastel lettering, layered depth shadows, a highlight streak, and a small sparkle. It is CSS-only and has a reduced-motion fallback.

## Work completed in the project

The Git history contains the earlier product slices, in order:

- Foundations for room and sticky-note state, storage, symbols, slugs, search, and the app shell.
- Lobby and room tags with threads, pins, room symbols, and local room creation.
- Sticky-note placement, overlap protection, deterministic wall slots, tidy/sort behavior, and compacting after deletion.
- Torch cursor, ink-lantern cursor, sparkle trail, sparkle wake, and reduced-motion handling.
- Room light controls, dark beam reveal, word constellation mode, and room state refinements.
- Lobby search creation and archive thread/icon refinements.
- Room controls and light-burst refinements.

Some experimental lobby redesign work was intentionally rolled back before this title slice. The preserved lobby is the prior hanging-tag design.

## Files changed by the current slice

- `web/src/pages/Lobby.tsx` — wraps the existing title words in spans and adds an accessible `aria-label`.
- `web/src/index.css` — adds the title’s 3D perspective, glass panels, hover transitions, shadows, highlight, sparkle, and reduced-motion rules.
- `AGENTS.md` — records the installed skill routing and token-efficient working habits.

## Commit and rollback map

The changes are split into small commits:

1. `docs: record project work history and workflow` — this file and the durable `AGENTS.md` guidance.
2. `feat: add glass 3d hover title to lobby` — the lobby title markup and CSS only.

To remove only the title treatment while keeping the documentation:

```sh
git revert <title-commit>
```

To remove the documentation/workflow commit as well:

```sh
git revert <workflow-commit>
```

To return to the preserved product baseline before both commits:

```sh
git revert <title-commit> <workflow-commit>
```

Use `git log --oneline -5` to see the exact commit IDs after the commits are created. `git revert` makes a new inverse commit, so the history stays recoverable.

## Validation

The current slice passes:

- `npm run build` in `web/`
- `npm run lint` in `web/`
- `git diff --check`

