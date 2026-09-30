# September 30 feature and usability review

All ten current Chromium end-to-end suites pass through `qa/end-to-end.cjs`. TypeScript/Vite production build and lint pass. Tests use isolated synthetic archives, never an existing personal archive.

| Suite | Coverage |
| --- | --- |
| private-archive | Create, write, encrypted persistence, wrong password, rich text, unsafe links, attachments, one editor, lights, delete/cancel, backup/restore, hide, mobile and keyboard |
| privacy-failures | Legacy migration, conflicting tabs, storage failure, recovery export, retry, malformed imports and corrupt data preservation |
| passphrase-recovery | Rotation, failure preservation, queued edits, old-password rejection, confirmed start-fresh and restoring old backups |
| media-sharing-locks | Photo/audio, safe links, temporary private views, explicit lock removal, nested locks, sharing exclusions and read-only recipients |
| large-media | Three-minute audio, 8.8 MB photo, 4.2 MB video, encrypted backup above 20 MB, restore, file sharing and locks |
| physical-interactions | Material sounds, click depth, lamps, rapid interaction, letter piles, close preserves writing, confirmed deletion and reduced motion |
| ui-polish | Entry forms at 320/390/1440px, password visibility, errors, room chimes, mute, pointer depth, ambient animation and reduced motion |
| help-guide | 13 topics, search, download, responsive fit, focus return, preserved drafts, nested modal hide, room rename/search, keyboard positioning and touch |
| room-motion | Per-room on/off, still words when dimmed/closed, independent defaults, reload, encrypted backup/restore, re-enable, moon/stars and responsive cloud image |
| sound-state | Measured audio output agrees with labels; off silences tails; rapid toggles, re-enable and persisted mute |

## Focused visual and UX review

- Entry uses readable field sizes, password guidance, a show-password target, clear restore instructions and disabled file selection while busy.
- Gallery controls align on mobile. Room names remain readable before hover; keyboard navigation does not wait for an animation.
- Help preserves drafts inside a native modal, with a persistent close control, search, download and immediate hide. This contextual modal intentionally keeps the current writing session in place.
- Original night clouds, a crescent moon and six sparse stars replace the rejected sea lines and charcoal folds. Motion progresses without pointer input, pauses in hidden tabs and becomes static with reduced motion. Repeated button clicks cancel preceding feedback animations. Falling letters can be switched off separately in each room.
- Sound commits the current state before its enable preview. Muting zeroes the shared output and stops voices. Pending asynchronous playback cannot outlive its originating toggle state.
- The handwritten title, fairy lights, paper, wooden walls and default-off sound remain intentional parts of the product.

The Impeccable launcher was not executable; its guidance and the existing product/design documents were reviewed directly. This is not an automated accessibility-conformance certification.

## Deployment and limits

Pages uses the repository base path and real `/shared/` and `/new/` entry pages. Dynamic room refreshes use a custom app fallback with HTTP 404 status. `qa/deployment.cjs` separately checks the hosted origin, assets, encryption, reload and recipient sharing.

Coverage is Chromium desktop and emulated touch with synthetic taps. Physical devices, Safari/Firefox, assistive technology and independent security review remain untested. Large media is processed in memory; tests do not establish arbitrary gigabyte-file support. Hosting does not transfer local-preview notes: use encrypted export/restore.
