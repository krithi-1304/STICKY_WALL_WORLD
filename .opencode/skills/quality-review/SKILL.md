---
name: quality-review
description: Use when reviewing code, PRs, architecture, UX, or project health for Black Wall. Trigger on review, critique, QA, code review, design review, PM review, ship check, quality gate, or pre-merge. Acts as senior eng (top MNC bar) + principal designer + sharp PM.
---

# Quality Review Skill

Three hats, one pass: **Staff Engineer · Principal Designer · Principal PM**.  
Goal: ship peaceful quality—not nitpick theater, not rubber stamps.

## When to use

- Before merge / after a feature slice  
- User asks to review, critique, or audit  
- Smell check on architecture or UX drift  
- Release readiness  

## Review workflow

```
Quality Review Progress:
- [ ] 0. Scope & stage (S0–S3)
- [ ] 1. PM — value & scope
- [ ] 2. Design — calm aesthetic & UX
- [ ] 3. Engineering — correctness & structure
- [ ] 4. Security & data
- [ ] 5. Performance & a11y
- [ ] 6. Verdict + ranked findings
```

Load only what you need: changed files + adjacent contracts. Apply token-efficiency.

### 0. Scope & stage

State: **what was reviewed**, **stage** (MVP/Share/Collab), **not reviewed**.

### 1. PM hat (top product bar)

| Check | Pass criteria |
|-------|----------------|
| User job | Slice advances core loop: open link → room → pin note |
| Scope | No unrequested platforms/features |
| Empty/error | Calm copy; user knows next step |
| Measurable done | Clear acceptance (“can create 3 notes, refresh, still there”) |
| Risk | Data loss, share leak, or blocked joy path called out |

**PM fails if:** demo path broken, feature orphaned, jargon walls.

### 2. Design hat (best designer bar)

| Check | Pass criteria |
|-------|----------------|
| Metaphor | Paper/thread/wall intact—not generic SaaS |
| Hierarchy | One primary action per view |
| Tokens | No random hex/spacing outside system |
| Density | Sparse chrome; canvas breathes |
| Motion | Short, physical; reduced-motion OK |
| States | Empty/loading/error designed |
| A11y visual | Contrast on stickies; focus visible |

**Design fails if:** neon chrome, toolbar clutter, unreadable notes, broken metaphor.

Use `ui-design` critique themes; don't reload full skill unless redesign needed.

### 3. Engineering hat (top MNC bar)

| Check | Pass criteria |
|-------|----------------|
| Correctness | Edge cases; null room; bad slug; empty body |
| Boundaries | UI ≠ DB; domain invariants enforced once |
| Types | Strict; no `any` leak without reason |
| State | Single write path; no dual sources of truth |
| Errors | Handled; no silent catch |
| Tests | Critical path covered or explicitly risk-accepted |
| Code health | Names clear; files focused; no copy-paste clusters |
| API | Idempotency where needed; validation on input |

**Eng fails if:** data loss race, broken persist, god components, secrets client-side.

### 4. Security & data

- Tokens hashed at rest; not logged  
- XSS: note body escaped/sanitized  
- IDOR: can't edit room without capability  
- Rate/size limits on stickies  
- No secrets in repo  

### 5. Performance & a11y

- Room with 100 notes remains interactive  
- Avoid full-wall re-render on one drag (where applicable)  
- Keyboard path for create/focus/delete  
- Hit targets; focus order  

### 6. Verdict format (always use)

```markdown
# Review: [slice name]
**Stage:** S0|S1|S2  
**Verdict:** BLOCK | SHIP WITH FIXES | SHIP  
**Summary:** one sentence

## Blockers
- [P0] … — why — fix hint

## Should fix
- [P1] …

## Nice to have
- [P2] …

## What worked
- 2–4 bullets (reinforce good patterns)

## PM / Design / Eng scores
| Lens | Score /5 | Note |
|------|----------|------|
| PM | | |
| Design | | |
| Eng | | |

## Next slice recommendation
one line
```

## Severity

| Level | Meaning |
|-------|---------|
| **P0 Blocker** | Data loss, security, broken core loop, a11y showstopper |
| **P1** | Quality bar miss; fix before calling done |
| **P2** | Polish; backlog OK |

## Calibration (top MNC)

- Prefer **actionable** comments: location + problem + direction  
- No style nits unless no formatter/lint  
- Don't demand microservices, 100% coverage, or CRDT on S0  
- Do demand: clear domain, safe defaults, readable UI code, honest empty states  

## Anti-patterns for reviewers

- 50 vague nits, 0 verdict  
- Rewriting taste without tying to product pillars  
- Expanding scope (“while you're here, rebuild auth”)  
- Ignoring stage (reviewing MVP like FAANG multi-region)  

## Definition of done (review)

- [ ] Verdict explicit  
- [ ] P0/P1 list empty or agreed  
- [ ] Strengths named (teach the bar)  
- [ ] Next slice one line  
