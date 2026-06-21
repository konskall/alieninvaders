# Online 2-Player Co-op Multiplayer — Design Spec

**Date:** 2026-06-21
**Status:** Approved (brainstorming) — pending implementation plan
**Game:** Alien Invaders (vanilla JS, HTML5 Canvas, Firebase Realtime DB, GitHub Pages)

## Summary

Add an **online 2-player co-operative** mode: two players on two separate
devices fight the **same** wave of enemies together in one shared arena. One
player **hosts** (runs the authoritative simulation), the other **joins** with a
short room code. The connection is **hybrid** — it attempts a low-latency
WebRTC peer connection and automatically falls back to Firebase Realtime DB if
WebRTC cannot establish — behind a single transport abstraction so the game
logic is unaware of which "wire" is active.

The feature ships in two phases: **Phase 1** delivers fully working co-op over
the RTDB transport; **Phase 2** adds the WebRTC transport and auto-fallback
behind the same interface (no game-logic changes).

## Goals

- Two players, two devices, shared synchronized arena, fighting the same enemies.
- Responsive control of your *own* ship (no input lag on yourself).
- Connect via a short, human-shareable room code.
- Host selects the difficulty before starting.
- Individual lives per player; combined team score.
- Separate co-op leaderboard.
- Reuse the existing engine and Firebase project — no new server/backend.

## Non-Goals (YAGNI)

- More than 2 players.
- Competitive / versus modes.
- Anti-cheat (co-op is cooperative; the guest's reported ship position is trusted).
- Matchmaking / public room browser (private code only).
- Spectator-only / replay features.
- Co-op-specific enemy balancing (host's chosen difficulty governs the session).
- Voice/text chat.

## Locked Decisions

| Decision | Choice |
|---|---|
| Co-op model | Shared arena, **host-authoritative** |
| Lives | **Individual** per player; on death → spectate; game over when **both** dead |
| Score | **Combined team score** (host-authoritative) |
| Leaderboard | **Separate** co-op leaderboard (team score + both names) |
| Difficulty | **Host selects** in lobby (reuses existing difficulty config) |
| Transport | **Hybrid** WebRTC (P2P) + RTDB fallback, behind a `NetTransport` abstraction |
| Phasing | Phase 1 = RTDB transport (working co-op); Phase 2 = WebRTC + fallback |

## Architecture

### Game modes

`Game` gains a `mode`: `'solo' | 'coopHost' | 'coopGuest'`. The single
`this.player` becomes `this.players[]` (solo = one element, preserving current
behavior exactly).

- **Host** runs the full simulation: enemy spawning, all `Math.random` / RNG,
  enemy AI, collisions, scoring, waves, boss — for **both** ships.
- **Guest** does **not** run spawning/AI/RNG. Its update loop applies the host's
  snapshot, moves its own local ship, and renders. Host-only blocks of
  `updateGame()` are gated by `mode`.

Because **all RNG runs only on the host**, there is **no determinism
requirement** across devices — this is the key simplification that makes the
shared-arena model tractable despite 42 `Math.random` call sites.

### The "own ship is always local" rule

- **Local ship:** position is driven by **local input** (immediate). `health` /
  `alive` come from the host (authoritative). The local ship is **never**
  snapped to the network position (prevents rubber-banding on yourself).
- **Remote ship:** position, `health`, `alive` come from the network, with
  position **interpolation** for smoothness.
- On the host, the guest's ship position is taken from the guest's messages and
  used for collision resolution; the host sends back the resulting `health`/`alive`.

### Transport abstraction

```
interface NetTransport {
  connect(): Promise<void>   // resolves when a channel to the peer is open
  send(msg): void            // fire-and-forget delivery of a JSON-able message
  onMessage(cb): void        // cb(msg) for inbound messages
  onClose(cb): void          // cb() when the peer/channel drops
  close(): void
}
```

Implementations:
- `RtdbTransport` — uses Firebase Realtime DB paths under `rooms/<code>`.
- `WebRtcTransport` — RTCPeerConnection + DataChannel; uses RTDB **only for
  signaling** (offer/answer/ICE under `rooms/<code>/signaling`).
- `MockTransport` — in-memory loopback for tests (two `Game` instances, one process).

A `connectCoop(code, role)` connector attempts `WebRtcTransport` first; if it
does not reach the open state within a timeout (~5s), it tears it down and
returns an `RtdbTransport`. The netcode and `Game` consume only the
`NetTransport` interface and are agnostic to which is active.

## Network Protocol

All messages are small JSON objects with a `t` (type) field. The netcode layer
serializes/sends via `NetTransport.send` and dispatches inbound via `onMessage`.

### Host → Guest: world snapshot (~15 Hz)

```
{
  t: 'state',
  seq: <int>,                       // monotonically increasing; guest drops stale
  ships:   [{ id, x, y, health, alive }],   // both ships (authoritative)
  enemies: [{ id, type, x, y, hp }],
  bullets: [{ id, x, y, vx, vy, kind }],    // kind: player | enemy
  homing:  [{ id, x, y }],
  boss:    { x, y, hp, maxHp, phase } | null,
  pickups: [{ id, type, x, y }],
  hud:     { score, level, wave, combo, kills },
  events:  [{ e: 'explosion'|'sound'|..., x, y, size, name }]  // for local FX/audio
}
```

The guest renders `enemies`/`bullets`/`homing`/`boss`/`pickups`/remote-ship using
**interpolation** between the last two snapshots. `events` drive purely local
particles and audio (these are never simulated on the guest).

### Guest → Host: input/ship (~15–30 Hz)

```
{ t: 'input', x, y, firing, alive }
```

The host accepts `x, y` as the guest ship's authoritative position for collision
purposes. `firing` is informational (auto-fire is the default; the host spawns
the guest ship's bullets).

### Control messages (both directions)

```
{ t: 'hello', name }            // sent on connect (exchange names)
{ t: 'start', difficulty }      // host → guest: begin the session
{ t: 'ping', ts } / { t: 'pong', ts }   // heartbeat / RTT estimate
{ t: 'bye' }                    // graceful leave
```

### Bandwidth note

The full snapshot including all bullets is the heaviest payload. Phase 1 sends
it whole over RTDB for simplicity. If RTDB bandwidth/cost is a problem, the
snapshot rate for bullets can be reduced or bullets made client-local; the
WebRTC transport (Phase 2) comfortably carries the full snapshot. **No silent
cap** — if a rate limit is applied, it is logged/commented.

## RTDB Data Model

```
rooms/<CODE>:
  status:     'waiting' | 'playing' | 'ended'
  difficulty: 'very_easy' | 'easy' | 'normal' | ...   // existing keys
  host:   { name, lastSeen }
  guest:  { name, lastSeen } | null
  state:      { ...latest host snapshot }     // RTDB transport only
  guestInput: { ...latest guest input }       // RTDB transport only
  signaling:  { offer, answer, hostIce[], guestIce[] }   // WebRTC (Phase 2)
  createdAt:  <timestamp>

leaderboardCoop/<pushId>:
  names:     "Alice & Bob"      // or { p1, p2 } — see open considerations
  score:     <number>
  level:     <number>
  date:      <string>
  timestamp: <number>
  id:        <pushId>
```

### Security rules changes

`database.rules.json` gains two new top-level nodes alongside the existing
`leaderboard` block:

- `rooms/<code>` — readable/writable for room participants. Validate `status`
  enum, `difficulty` enum, name string length ≤ 20; bound `state`/`guestInput`
  sizes. (Co-op rooms are ephemeral; rules favor liveness over strictness.)
- `leaderboardCoop/<pushId>` — **create-only** (`!data.exists()`), validated the
  same way as the solo `leaderboard`: `names` string ≤ 41, `score` number
  0–100,000,000, `level` number, reject extra fields (`$other` → false).

`FIREBASE_SECURITY.md` is updated, and the user must **re-publish** the rules in
the Firebase console (a reminder is surfaced at hand-off, as before).

## Lobby & Room Flow

1. Main menu gains a **"2 Παίκτες"** entry → choice of **Δημιουργία δωματίου**
   (host) or **Σύνδεση** (join).
2. **Host:** enters name, selects difficulty, creates a room. A **4-character
   code** is generated (uppercase A–Z + 2–9, excluding ambiguous `0/O/1/I`),
   checked for collision, and written to `rooms/<code>` with `status:'waiting'`.
   Host sees "Περιμένω συμπαίκτη… Κωδικός: XXXX". When a guest joins, host taps
   **Έναρξη** → `status:'playing'`, `{t:'start', difficulty}` is sent, both begin.
3. **Guest:** enters name, types the code, joins `rooms/<code>`. Sees a waiting
   lobby until the host starts.
4. Names reuse the existing name-entry pattern (trim, ≤ 20 chars).

## In-Game Co-op Rules

- Both ships spawn at the bottom, offset left/right.
- Start is synchronized by the host.
- A player at 0 health **explodes and becomes a spectator** (ship removed, no
  firing); the session continues for the other. The HUD shows **two** life sets.
- **Game over when both players are dead** → team-score screen → submit to the
  co-op leaderboard with both names.
- Score is the host-authoritative team total (host counts kills from both ships).
- The host-selected difficulty drives the host simulation.

## Disconnect & Error Handling

- **Guest disconnects:** the host **continues solo** automatically and shows
  "ο συμπαίκτης αποσυνδέθηκε".
- **Host disconnects:** the guest cannot continue (host owned the simulation) →
  "Ο host αποσυνδέθηκε — τέλος" → return to menu (team score so far may be
  submitted).
- **Detection:** RTDB `onDisconnect()` to mark/clean the room, plus a heartbeat
  (`ping/pong` or `lastSeen`); no snapshot/heartbeat for ~4s ⇒ treat as
  disconnected.
- **Room cleanup:** the host's `onDisconnect()` removes or marks `rooms/<code>`.
- Joining a non-existent / full / already-playing code shows a clear error and
  returns to the join screen.

## Testing Strategy

The `NetTransport` abstraction makes networked logic testable without Firebase:

- **`MockTransport`** (in-memory loopback) wires a host `Game` and a guest
  `Game` in a single test process. Tests cover:
  - `players[]` handling and that solo mode is behaviorally unchanged.
  - Death → spectate; game over only when **both** ships are dead.
  - Team score accrues from both ships' kills.
  - Host→guest snapshot apply + guest→host input apply.
  - Lobby state transitions (`waiting → playing → ended`).
  - Disconnect handling (guest-leaves → host solo; host-leaves → guest ended).
- **Manual playtest** with two browser tabs / two devices over the real RTDB and
  (Phase 2) WebRTC transports.

## Implementation Phasing

Each phase is a separate spec→plan→implementation cycle. This document is the
umbrella design; the plan(s) are written per phase.

- **Phase 1 — Multiplayer engine + RTDB transport (delivers working co-op):**
  engine refactor (`players[]`, mode-gated loop, own-ship-local rule),
  `NetTransport` + `RtdbTransport` + `MockTransport`, netcode (snapshot/input
  protocol + interpolation), lobby/room-code UI, co-op rules (lives/spectate/
  game-over/team-score), co-op leaderboard + rules, disconnect handling.
- **Phase 2 — WebRTC enhancement:** `WebRtcTransport` (RTCPeerConnection +
  DataChannel, RTDB signaling) and the `connectCoop` auto-fallback, behind the
  same interface. No game-logic changes.

## Open Considerations (resolve during planning, not blockers)

- **Co-op leaderboard `names` shape:** single `"A & B"` string (simplest) vs
  `{ p1, p2 }` object. Lean: single string, ≤ 41 chars, escaped on render
  (same XSS-safe rendering as solo).
- **Snapshot rate / interpolation buffer** exact values (start ~15 Hz, ~2-frame
  interpolation buffer) — tune during Phase 1 playtest.
- **Camera/scroll:** the current game has a fixed vertical field (no scrolling
  camera), so both ships share the same static viewport — no camera sync needed.
  Confirm during the engine refactor.
- **Mobile lobby UX** (entering a 4-char code on a phone keyboard) — keep the
  input simple and large.
