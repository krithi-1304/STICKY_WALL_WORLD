# The Black Wall — persistent project rules

The September 17 build specification supersedes earlier rainbow/glass-paper experiments.

## skill:glass-design-system
Glass only on navigation, search, toggles, counters, and tooltips: 16–20px blur, 4–8% white, 12% white border and inset highlight. Paper is opaque, lightly textured, imperfect and readable.
## skill:3d-realism-and-motion
Physical surfaces use cursor-driven perspective up to 5 degrees, directional shadows and spring-like return. Radial light must change readability. Letter motion is individually staggered. Movement spawns cursor particles; no timer-spawned trails. Reduced motion preserves functionality and end states.
## skill:ux-psychology
Conventional controls; exactly Keep / Let go at the writing decision. Writing is easy, release is intentional and confirmed. Light is an invitation, never a barrier to keyboard/touch reading.
## skill:creativity-and-atmosphere
One sparse star motif (at most six per screen). Near-black navy sea, amber/copper light, opaque dusty rose/sage/warm stone paper. Wood inside rooms. Three font roles: quiet serif, Caveat handwriting, plain UI sans. No rainbow effects.
## skill:safety-and-privacy
No accounts or public feed. Sharing is limited to explicitly requested encrypted snapshots (see latest decision below). Encrypt all persisted room/note/media content using a device-local passphrase. Never persist the passphrase/key. Panic hide is immediate. Explicit data-loss and forgotten-passphrase warnings, encrypted export/restore. React-only allowlisted rich-text rendering, validated external URLs with confirmation. Validated audio/video with no application size or duration cap; browser storage/memory limits still apply. Quiet support-resource link. No privacy guarantees for an unlocked or compromised device.
## skill:build-priority
1. Structural bugs. 2. Radial room reveal. 3. Letter fall/return. 4. One expanded note. 5. Materials/tilt. 6. Cursor states. 7. Consent-based sound. 8. Safety guards. 9. Rich text/media. 10. Encryption/backups. 11. Empty states, sentiment hints, support, accessibility and full journey validation.

## Decisions
- Native dialogs provide focus trapping for editing and release confirmation.
- The plaintext legacy world is migrated only after encrypted persistence succeeds. Existing encrypted data is never silently reset after a parse/decryption error.
- Attachments live inside the encrypted IndexedDB archive, not in plaintext media storage.
- Rich text is a limited Markdown subset rendered as React elements. Raw HTML is displayed as text, never interpreted.
- The lobby composer starts with exactly two choices. Keep then asks which room (or a new room); Let go requires confirmation. Unkept drafts are memory-only.

## Acceptance
Writing, saving, locking/unlocking, wrong passwords, legacy migration, encrypted backup/restore, malformed imports, save failures, safe links, large media, single expanded note, release cancel/confirm, radial reveal/letter motion, reduced motion, mute, keyboard and 320px touch layouts must be checked before declaring completion.

## September 18 preference update
The user explicitly requested the earlier “Rooms for thoughts that stay.” handwritten title, overhead fairy lights, and the previous layered gold/blue match flame with colored light and movement-driven smoke. These are intentional exceptions to the earlier quiet-serif/amber-only direction. Keep the local encrypted diary, opaque paper, reduced-motion behavior and muted-by-default sound.

## September 18 — physical interactions, media and private snapshots
- Preserve the incumbent layout and identity. Lamp ignition follows a dedicated approach/contact/retreat path below the shade; two smaller companions use the same composition. Opening uses spatial transforms; closing settles varied word fragments at the bottom of the paper, then returns the editor to its wall position. Opening reassembles the words. Confirmed deletion alone drops the paper out of view. Reduced motion preserves immediate actions. Closing an editor keeps its note; confirmed deletion persists immediately while a visual copy finishes falling.
- The latest user request permits subtle glass treatments on existing paper/card surfaces as well as controls. Keep paper highly opaque and text readable; do not add glass wrapper containers or a heavy 3D library.
- Photo (JPEG/PNG/WebP), audio, video and safe HTTP(S) links are supported. No application-imposed photo/audio/video size, duration, pixel-count, or archive media budget. Keep format/decode validation and the existing three-attachment count. Large protected snapshots use file download rather than oversized URLs.
- Opt-in sharing is an encrypted, read-only snapshot of one note, one room, or the space. Small snapshots may use URL fragments; larger/media snapshots use encrypted files without truncation. No public feed, cloud storage, accounts or realtime sync. A hosted reachable app is required for links opened by other people; localhost is only a preview. Share passphrases travel separately. Copies are not revocable or updated automatically.
- Room/note heart locks encrypt selected content with a separate passphrase inside the archive. Locked content is excluded from all shares, including space shares. Unlock explicitly removes the extra lock until the user locks again; no forgotten item-passphrase reset. Locking a room retains any nested note locks. Do not treat a decorative lock icon as access control.

## September 19 — latest interaction refinements
- Closing/dimming gathers words visibly at the bottom of the sticky note. They remain there until opened/revealed, then return to their reading positions; no disappearing-word end state. Closing preserves content.
- Existing locked room tags and notes use crossed braided steel wires with a central heart padlock; encryption semantics are unchanged. The room unlock panel repeats that motif.
- UI controls use consistent 13px sans-serif labels, 12px secondary copy, 14px form labels, and 16px form inputs. Paper text stays handwritten.
- Shared interaction feedback supplies depth on clicks and distinct quiet paper/glass/metal/light/door/ink hover voices, gated by the existing default-off master sound switch. No hover audio on touch. Reduced motion skips travel.
- Existing sea layers gain broken reflections and small pointer parallax; existing title, fairy lights, layout and navigation remain.

## September 20 — individual letters and lock interaction fixes
- The settled pile consists of individual grapheme/letter spans, not whole words. Keep word wrappers stationary to preserve normal wrapping. Letters scatter with distinct angles and delays, remain inside the lower paper area, and reassemble when opened.
- Previous/next navigation skips encrypted notes, and a locked note cannot render in the ordinary editor. Close the editor before committing its new lock state. The note's central heart seal is part of the full-card unlock target, including on touch.
- Item locks currently use a separate passphrase and unlocking removes that additional lock. Do not silently change those persistence semantics; a clarification about the user's reported lock expectation was requested.

## September 20 — temporary private views (supersedes permanent unlock default)
Unlock now defaults to a read-only, memory-only private view. The stored item remains encrypted throughout; closing, hiding or refreshing leaves its lock intact. Explicitly checking “Remove this lock so I can edit” exposes the separate permanent-removal action. Independently locked notes inside a room preview stay concealed. No editable auto-relocking session or key persistence is introduced.

## September 26 — help, black atmosphere, and deployment
- The user's latest direction replaces the sea, wave lines, moon and reflections with an animated black/charcoal atmosphere. Broad soft folds drift behind the gallery and entry; no drawn background lines. Preserve the handwritten title, fairy lights, paper and room interiors. Respect reduced motion and pause ambient animation in hidden tabs.
- Chimes on/off states describe the actual current audio state. Muting immediately silences and stops active voices; pending async playback cannot outlive the toggle state that requested it. The mute control itself has no hover sound.
- A searchable, downloadable guide is available before entry and from archive, editor and recipient screens. It preserves writing context and supports immediate hiding from within its modal focus boundary. Its single source is `web/src/content/help.md`.
- Publish the static app through GitHub Pages, with deployment-path-aware routes, assets and protected share links. No diary data or passphrases are uploaded by deployment. Existing local-preview archives must be exported and restored on the hosted origin.

## September 30 — latest background and optional falling letters
- Supersedes the charcoal-fold background: use the original `night-clouds.png` texture, one crescent and six sparse stars, with gentle drifting and existing reduced-motion/hidden-tab behavior. The user requested Pinterest research; references and the generation prompt are in `DESIGN_REFERENCES.md`. Keep the room walls, title and fairy lights.
- Each unlocked room has Falling letters on/off. Existing rooms default to on. Off keeps words in place when dimmed or closed and removes the editor's falling-letter delay; it does not change deletion confirmation or saved text. Save this choice in the encrypted room, including backup/restore and locks.
