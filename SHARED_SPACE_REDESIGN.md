# Shared space — Wick's little room

## Before changes (October 2)
The recipient route decrypts a URL-fragment or JSON-file snapshot in memory, clears the fragment, and renders read-only notes. Existing uncommitted work already adds an invitation, room tabs, and a tentative falling-letter toggle fix. Preserve it and the unrelated ItemPrivacy/QA changes. No direct reply service exists: Leave one back leads to the existing archive composer, where the visitor can create and explicitly share a reply.

## Design concept
One continuous night room: existing fairy lights, an original CSS arched moon-over-water window, a wooden desk, cream stationery and rose wax. Existing Caveat and UI fonts remain. Glass is the invitation/controls; actual letters remain opaque. Variance 6 / motion 4 / density 3. The latest request explicitly authorizes the window, glass invitation, original SVG mascot and heart-flame mark. No external illustration or new runtime dependency. Pinterest URLs were inaccessible; 21st search found text effects but no suitable reusable room component.

## Entry
Wick, a little cream candle spirit, grips the invitation and whispers “psst… someone thought of you”. A labeled underlined secret-phrase field and Open button sit in warm glass. Wrong phrases clear the input, show a clear gentle error, and trigger one restrained reaction. File-based shares remain supported.

## Transition
Successful decryption starts a short ~1.1s envelope/room transition (650ms departure, 450ms arrival). Operation generation guards prevent delayed decrypt/animation from reopening hidden or closed content. Reduced motion uses a brief dissolve. All timers clean up. Plaintext and keys stay memory-only.

## Room
A central sealed main letter opens on click, then reveals the real note. Subsequent opens of the same note in this mounted session skip the full reveal; a changed note timestamp gets a fresh reveal. Other notes are pinned at varying heights, photos are taped prints, audio resembles a cassette, video a dark frame, links retain safe confirmation. Room tabs preserve multi-room shares. Close clears decrypted content and requires the phrase again. Refresh intentionally relocks; reopen the original link or encrypted file (the URL fragment is cleared for privacy).

## Mascot and icon
Wick: cream candle body, amber flame, blushing cheeks, blinking eyes, gripping hands; happy, shy and waiting poses. Brand symbol: amber flame in a rose heart wax seal on a navy rounded square. SVG favicon plus generated 192/512 PNG and 180 apple icon; reused as shared seal and lobby mark.

## Motion rules
Transform/opacity only for new animation; short paper lift/unfold, gentle bob and blink. No heavy scene library. Shared falling letters use a bounded independent layer, clean frame ownership, hidden-tab suspension and reduced-motion disable. Entry ambient motion pauses in hidden tabs. Keyboard can open every letter and focus follows scene changes. Minimum 44px controls, safe-area padding, 360px+ layouts.

## Falling-letter root cause
The existing room uses CSS letter transforms, not a continuous RAF particle simulation. The toggle previously cleared the piled-note set in both directions, so re-enabling while the room was lit left notes in the reading state. Restore eligible closed-note IDs when enabling; remeasure on enable and cancel pending measurement on cleanup/hidden tabs. The new shared ambient layer has its own bounded lifecycle and explicitly resets its RAF handle on stop.

## Affected files
Shared.tsx; shared.css; Wick, SharedBackdrop, SharedLetter, FallingLetters and LetterSeal components; useLetterPile; Room.tsx toggle; Lobby.tsx mark; favicon/manifest/PNG assets and index.html; qa/shared-space.cjs; project memory documents.

## Acceptance / validation
Wrong/right phrase and file import; cancel during decrypt/transition; main-letter reveal and reopening; room navigation; Close/reopen; safe rich text/media; light and match cursor; three OFF/ON cycles in recipient and local room; hidden-tab pause; refresh relock; desktop/360px and reduced motion; console clean; build/lint and existing relevant privacy/room checks. Results recorded in PROGRESS.md and COMMIT_LOG.md.

## October 3 refinement (supersedes icon concept above)
Identity is now a cream folded note with a navy moon; no icon beside The Night Archive. Share actions use a distinct outline envelope. An offset paper backing frames the invitation. Envelope flap and insert move for 440ms before the message appears; folding takes 180ms. Both cancel safely on unmount and skip travel for reduced motion. Master audio wording is Sound. Local preview share links now open the public recipient site; encryption and memory-only decryption are unchanged.

## Current refinement plan
Keep the working encrypted invitation and room flow. Make entry a shorter, letter-shaped glass invitation with an integrated stationery seal and a peeking Wick; add a small shelf/candle vignette to give the empty side of the room physical scale. Keep The Night Archive wording unadorned; put the new mark separately above it. Restore the requested rose heart wax / amber flame identity and use a matching sealed-envelope share icon. Add the existing master Sound control to recipient rooms. Tighten ambient lifecycle tests to cover hidden tabs while OFF and emission rate after repeated toggling.

The previous toggle repair is already committed here; do not claim a newly discovered RAF bug. Preserve memory-only reveal history and refresh relocking. Acceptance: existing full shared-space flow, sound, local room controls, build/lint, desktop/tablet/mobile screenshot inspection.

## Refinement result
Implemented the current plan. Build/lint, shared-space, room-controls and sound-state pass. Manual desktop/mobile review corrected greeting/navigation overlap; regression now checks their bounds. No new falling-letter runtime fix was needed: the existing fix passes, and tests now enforce one emission stream and no restart while OFF after tab visibility changes.

## October 4 — moonlit journal identity
Latest user direction supersedes the candle-heart brand: a silver crescent shelters a warm folded page on near-black navy. Reuse the original SVG in lobby, recipient navigation and dark stationery seals; Share uses a moon-sealed envelope. Regenerate favicon/192/512/Apple assets. Wick remains the candle messenger within the scene. The tested same-page protected-link fix is included in this deployment.
