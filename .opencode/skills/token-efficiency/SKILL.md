---
name: token-efficiency
description: Use on every non-trivial task to minimize context and output tokens. Trigger when starting work, exploring codebase, long sessions, planning multi-file changes, or when user mentions tokens, context limits, concise, or efficiency. Ensures the model does not burn maximum tokens.
---

# Token Efficiency Skill

Goal: finish correctly with **minimum** context loaded and **minimum** prose emitted. Quality stays; verbosity dies.

## Hard rules

1. **Load this mindset first** on multi-step work — before broad exploration  
2. **Search before read; narrow before wide**  
3. **No essays** unless user asks for detail  
4. **Don't dump full files** into reasoning when a slice suffices  
5. **Don't repeat** tool output back to the user  
6. **One job per turn** when possible; batch only independent tool calls  
7. **Prefer edit patches** over rewriting entire files  
8. **Stop when done** — no summary of what you did unless asked  

## Budget tiers

| Tier | When | Max exploration | User-facing length |
|------|------|-----------------|--------------------|
| **T0** | Single fact / 1-line answer | 0–1 tool | ≤ 3 lines |
| **T1** | Small edit, known file | 1–3 targeted reads | ≤ 5 lines + code |
| **T2** | Feature slice | skill + focused greps | short status + code |
| **T3** | Architecture / design | one skill + refs as needed | structured brief, not novel |

If work escalates tier, say nothing—just tighten scope.

## Exploration protocol (cheap → expensive)

```
1. Glob / Grep with tight pattern
2. Read only matching line ranges
3. Task/explore subagent ONLY if ≥ 4 files unknown
4. Never recursive full-repo read
5. Never re-read unchanged files in the same session
```

**Anti-pattern:** “Read all of src/ to understand”  
**Pattern:** “Grep StickyNote → read component + types only”

## Skill loading

- Load **one** domain skill relevant to the task (`system-design` OR `ui-design` OR `quality-review`)  
- Do **not** load all skills “just in case”  
- `token-efficiency` is behavioral — apply always; don't narrate that you applied it  

## Context hygiene

| Do | Don't |
|----|--------|
| Quote 5–20 line slices | Paste 400-line files into chat |
| Name paths + line anchors | Re-print entire tool logs |
| Keep todos short | Multi-paragraph plan for 1-file fix |
| Resume known paths from memory this session | Re-explore from zero every turn |
| Use parallel tools for independent facts | Serial reads of the same tree |

## Output discipline

- Default: **diff-level communication** — what changed, where, what's next (1–3 lines)  
- Design/architecture: use templates from those skills (compact sections)  
- Code: ship the code; skip line-by-line narration  
- Errors: root cause + fix; no stack-trace novels in chat  
- Questions to user: one question, max 3 options  

## Implementation habits that save tokens later

- Small files, clear names → less hunting  
- Domain types in one place → fewer multi-file reads  
- ADRs one screen max  
- Avoid generating large markdown docs user didn't ask for  

## Session survival (don't run out of tokens)

1. Prefer **vertical slices** (one feature path) over horizontal refactors  
2. After large tool output, **continue from conclusions**, not by restating data  
3. If context feels heavy: finish current slice, checkpoint in a short todo, stop expansion  
4. Refuse scope creep: park “nice ideas” in one-line backlog, don't design them now  
5. For reviews: sample critical paths; don't review every file unless asked  

## Self-check before each response

```
[ ] Did I use the narrowest tool path?
[ ] Am I about to explain something the user didn't ask?
[ ] Can this be half the words?
[ ] Am I loading an extra skill/file “for completeness”?
```

If any fail → cut.

## Exceptions (spend tokens)

- User explicitly asks for deep detail, tutorial, or full review  
- Security-sensitive auth/token design  
- Data-loss risk migrations  

Then be thorough—but still structured, not rambling.

## Definition of done

- Task complete  
- No unsolicited essay  
- No redundant file loads  
- User can see result without scrolling a manifesto  
