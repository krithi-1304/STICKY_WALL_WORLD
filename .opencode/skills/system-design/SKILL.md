---
name: system-design
description: Use when architecting Black Wall Sticky Note World — system design, architecture, data models, APIs, realtime, auth, scaling, persistence, URLs, multiplayer, or infrastructure. Trigger on system design, architect, backend, schema, scalability, ADR, tech stack, or how to structure the app.
---

# System Design Skill — Black Wall Architect

Act as a principal architect: calm constraints, clear boundaries, evolve from MVP → share → collab without rewrites.

## When to use

- Stack choices, folder structure, module boundaries
- Data models, APIs, auth, sharing links
- Realtime, offline, persistence, scaling
- ADRs, tradeoffs, failure modes
- Before non-trivial feature implementation

## North star (architecture)

| Principle | Meaning |
|-----------|---------|
| **Metaphor-aligned** | Rooms, walls, stickies are first-class domain objects |
| **URL is the door** | `/r/:slug` is the product surface |
| **Solo → share → live** | Design stages; don't build Stage 3 on day one |
| **Simple core** | CRUD + canvas coords first; CRDT/OT only when needed |
| **Peaceful ops** | Predictable latency, graceful offline, no noisy failure UX |

## Architect workflow (run in order)

```
System Design Progress:
- [ ] 1. Problem & stage (MVP / Share / Collab)
- [ ] 2. Domain model
- [ ] 3. Boundaries & modular monolith
- [ ] 4. API & sync contract
- [ ] 5. Data store & indexes
- [ ] 6. Auth & share tokens
- [ ] 7. Realtime decision
- [ ] 8. Failure modes & limits
- [ ] 9. ADR + build order
```

### 1. Problem & stage

Pick **one** stage per slice of work:

| Stage | Capability | Non-goals |
|-------|------------|-----------|
| **S0 MVP** | Local or single-user rooms + stickies | Multiplayer, search, billing |
| **S1 Share** | Link view / edit token, server persist | Live cursors |
| **S2 Collab** | Multi-tab / multi-user sync | Full CRDT unless proven needed |
| **S3 Scale** | Many rooms, CDN assets, rate limits | Premature microservices |

Never skip stages without an explicit ADR.

### 2. Domain model (canonical)

```
User? (optional until auth)
Room {
  id, slug, name, symbol
  wallTint?, accent?
  visibility: link | private
  createdAt, updatedAt
}
RoomAccess {
  roomId, role: viewer | editor | owner
  tokenHash?, userId?
}
Sticky {
  id, roomId
  x, y, w, h, rotation, zIndex
  color, tapeStyle
  title?, body
  pinned?, archived?
  updatedAt, updatedBy?
}
WallDecor? { id, roomId, type, payload, zIndex }  // washi, tint — later
```

Invariants:

- Sticky always belongs to one room
- `slug` unique, URL-safe
- zIndex bands: decor < notes < dragging < chrome (client)
- Soft delete or archive over hard delete for notes (optional S1+)

### 3. Boundaries

Prefer **modular monolith** until proven otherwise:

```
apps/web          → UI (lobby, canvas)
packages/domain   → types, invariants, pure logic
packages/api      → HTTP + auth
packages/sync     → realtime adapter (stub until S2)
```

Rules:

- UI never talks to DB
- Domain pure (no fetch)
- One write path for stickies (API owns validation)

### 4. API & sync contract

**HTTP (S1+)** — resource-oriented, boring REST or tRPC-style:

| Action | Contract |
|--------|----------|
| Create room | `POST /rooms` → `{ slug }` |
| Get room | `GET /rooms/:slug` → room + stickies |
| Patch sticky | `PATCH /rooms/:slug/stickies/:id` |
| Create sticky | `POST /rooms/:slug/stickies` |
| Delete sticky | `DELETE ...` |

**Sync events (S2)** — small, named:

`sticky.created | sticky.updated | sticky.deleted | room.updated | presence.cursor`

Payload = partial entity + `updatedAt` + `actorId`. Last-write-wins on field groups first; upgrade to CRDT only if conflicts hurt.

### 5. Data store

| Stage | Store |
|-------|--------|
| S0 | `localStorage` / IndexedDB |
| S1 | Postgres (or SQLite hosted) — `rooms`, `stickies`, `room_access` |
| S2 | + Redis/pubsub or Supabase realtime / Partykit / equivalent |
| Assets | Later — images on object storage if notes gain media |

Indexes: `rooms(slug)`, `stickies(room_id)`, `stickies(room_id, updated_at)`.

### 6. Auth & share

- **S0:** no auth
- **S1:** capability URLs  
  - `/r/:slug` public view if visibility=link  
  - `/r/:slug?k=EDIT_TOKEN` or separate edit path hashed server-side  
- **S1.5:** optional magic link owner claim  
- Never put long-lived secrets in localStorage without httpOnly session when real auth arrives

### 7. Realtime decision tree

```
Single user / single tab → no realtime
Multi-tab same user → broadcast channel or light sync
Multi-user editing → websocket room channel
High conflict text → consider Yjs/Automerge on body only
```

Default S2: **LWW + version/updatedAt**, not full CRDT.

### 8. Failure modes & limits

Design for:

| Risk | Mitigation |
|------|------------|
| Lost note on refresh | Optimistic UI + confirm ack; outbox queue |
| Token leak | Hash tokens; rotate; short-lived edit links optional |
| Canvas spam | Max stickies/room (e.g. 200); rate limit writes |
| Huge payload | Paginate or snapshot + delta; don't send full wall every keystroke |
| Offline | Read cache; queue writes; banner calm not alarming |

### 9. ADR + build order

Every significant choice → short ADR:

```markdown
## ADR-00X: Title
Status: proposed|accepted
Context: …
Decision: …
Consequences: …
Stage: S0|S1|S2
```

**Recommended build order:**

1. Domain types + local persist  
2. Lobby + room canvas UI  
3. Sticky CRUD + drag coords  
4. Server persist + slug URLs  
5. Edit/view tokens  
6. Realtime patch  
7. Presence (optional)  
8. Decor / export  

## Stack guidance (default recommendation)

Opinionated default for this product (change only with ADR):

| Layer | Default | Why |
|-------|---------|-----|
| Web | Next.js or Vite+React | Fast UI, simple routing |
| Canvas | HTML/CSS positioned notes (not Konva) until needed | A11y, simpler DnD |
| API | Next route handlers / tRPC / Hono | Thin |
| DB | Postgres (Drizzle/Prisma) | Relational fit |
| Auth | Deferred; link tokens first | Matches “click link → wall” |
| Realtime | Add-on provider later | Avoid lock-in early |
| Host | Vercel/Fly + managed PG | Calm ops |

## Anti-patterns (architect rejects)

- Microservices for MVP  
- GraphQL Federation day one  
- Full CRDT before two users exist  
- Storing positions only in CSS classes  
- Auth wall before first sticky joy  
- Unbounded note size / unbounded rooms without quotas  

## Output template

When designing, respond with:

```markdown
## Stage
## Decision
## Domain impact
## API / data
## Risks
## Build slice (≤ 1 week)
## ADR needed?
```

## References

- `references/domain-and-api.md` — detailed schemas & endpoints  
- `references/stages.md` — S0–S3 checklist  
- `references/adr-template.md` — copy-paste ADR  

## Definition of done (architecture)

- [ ] Stage named; non-goals listed  
- [ ] Domain entities & invariants clear  
- [ ] Write path single and validated  
- [ ] Failure modes addressed  
- [ ] ADR filed for non-obvious choices  
- [ ] Next build slice is small and testable  
