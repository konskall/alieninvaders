# Co-op Phase 1C-1 — Netcode Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the host-authoritative netcode core — `NetcodeHost` (broadcasts world snapshots, applies remote input) and `NetcodeGuest` (applies snapshots with stale-seq dropping, sends input) — plus a pure interpolation helper, all transport-agnostic and DOM-free, fully testable over `MockTransport`.

**Architecture:** `NetcodeHost` and `NetcodeGuest` take a `NetTransport` (the Phase-1A abstraction) and a **world adapter** — an object the `Game` will implement in a later sub-plan. The world adapter is the seam between the netcode (pure, tested) and the engine (DOM/canvas, browser-verified). The netcode never touches the DOM; it only calls adapter methods and the protocol builders from Phase 1A.

**World adapter interface (implemented later by `Game`; the netcode only calls these):**
- `getSnapshot()` → a world object `{ ships, enemies, bullets, homing, boss, pickups, hud, events }` (the shape `buildState` consumes) — host side.
- `applySnapshot(stateMsg)` → apply a received `state` message to local render entities — guest side.
- `getLocalInput()` → `{ x, y, firing, alive }` (the shape `buildInput` consumes) — guest side.
- `applyRemoteInput(inputMsg)` → update the remote ship from a received `input` message — host side.

**Tech Stack:** Vanilla JS ES modules; Node `node:test` (built-in); zero runtime dependencies.

## Global Constraints

- Vanilla JS ES modules only. No bundler/transpiler/TypeScript. Zero runtime dependencies.
- All modules here MUST be DOM-free and transport-agnostic (testable under `node --test` via `MockTransport`).
- Host-authoritative: only the host builds snapshots and owns `seq`; the guest applies them and must **drop any snapshot whose `seq` is ≤ the last applied `seq`** (stale / out-of-order).
- Reuse Phase-1A modules verbatim: `buildState`, `buildInput`, `MSG` from `src/coop/protocol.js`; `MockTransport` from `src/coop/MockTransport.js`. Do not modify them.
- Work on the `coop` branch. Commit once per task.

---

### Task 1: NetcodeHost

**Files:**
- Create: `src/coop/NetcodeHost.js`
- Test: `tests/coop/netcodeHost.test.js`

**Interfaces:**
- Consumes: `buildState(seq, world)` and `MSG` from `./protocol.js`; `MockTransport` (test only) from `./MockTransport.js`.
- Produces: `class NetcodeHost` with `constructor(transport, world)`, field `seq` (starts 0), and `tick()` that sends one `state` message. On receiving an `input` message it calls `world.applyRemoteInput(msg)`.

- [ ] **Step 1: Write the failing tests**

Create `tests/coop/netcodeHost.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NetcodeHost } from '../../src/coop/NetcodeHost.js';
import { MockTransport } from '../../src/coop/MockTransport.js';

function fakeWorld() {
  return {
    snapshot: { ships: [{ id: 'h', x: 1, y: 2, health: 3, alive: true }], enemies: [], bullets: [], homing: [], boss: null, pickups: [], hud: { score: 0 }, events: [] },
    remoteInputs: [],
    getSnapshot() { return this.snapshot; },
    applyRemoteInput(m) { this.remoteInputs.push(m); }
  };
}

test('tick sends a state message with incrementing seq and the world snapshot', () => {
  const [a, b] = MockTransport.pair();
  const world = fakeWorld();
  const host = new NetcodeHost(a, world);
  const got = [];
  b.onMessage(m => got.push(m));

  host.tick();
  host.tick();

  assert.equal(got.length, 2);
  assert.equal(got[0].t, 'state');
  assert.equal(got[0].seq, 0);
  assert.equal(got[1].seq, 1);
  assert.deepEqual(got[0].ships, world.snapshot.ships);
});

test('an inbound input message is routed to world.applyRemoteInput', () => {
  const [a, b] = MockTransport.pair();
  const world = fakeWorld();
  new NetcodeHost(a, world);

  b.send({ t: 'input', x: 9, y: 8, firing: true, alive: true });

  assert.equal(world.remoteInputs.length, 1);
  assert.equal(world.remoteInputs[0].x, 9);
});

test('non-input inbound messages are ignored by the host', () => {
  const [a, b] = MockTransport.pair();
  const world = fakeWorld();
  new NetcodeHost(a, world);

  b.send({ t: 'state', seq: 5, ships: [] });
  b.send({ t: 'ping' });

  assert.equal(world.remoteInputs.length, 0);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../src/coop/NetcodeHost.js'`.

- [ ] **Step 3: Implement the module**

Create `src/coop/NetcodeHost.js`:

```js
import { buildState, MSG } from './protocol.js';

// Host-authoritative side: broadcasts the world snapshot each tick and applies
// the guest's input to the world. Transport-agnostic and DOM-free.
export class NetcodeHost {
  constructor(transport, world) {
    this.transport = transport;
    this.world = world;
    this.seq = 0;
    transport.onMessage((m) => {
      if (m && m.t === MSG.INPUT) this.world.applyRemoteInput(m);
    });
  }

  tick() {
    this.transport.send(buildState(this.seq++, this.world.getSnapshot()));
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS — netcodeHost tests green; all prior tests still green.

- [ ] **Step 5: Commit**

```bash
git add src/coop/NetcodeHost.js tests/coop/netcodeHost.test.js
git commit -m "feat(coop): NetcodeHost snapshot broadcast + remote-input apply"
```

---

### Task 2: NetcodeGuest (with stale-seq dropping)

**Files:**
- Create: `src/coop/NetcodeGuest.js`
- Test: `tests/coop/netcodeGuest.test.js`

**Interfaces:**
- Consumes: `buildInput(ship)` and `MSG` from `./protocol.js`; `MockTransport` (test only); `NetcodeHost` (test only, for the end-to-end test) from `./NetcodeHost.js`.
- Produces: `class NetcodeGuest` with `constructor(transport, world)`, field `lastSeq` (starts -1), and `tick()` that sends one `input` message. On receiving a `state` message with `seq > lastSeq` it sets `lastSeq` and calls `world.applySnapshot(msg)`; stale/equal `seq` is dropped.

- [ ] **Step 1: Write the failing tests**

Create `tests/coop/netcodeGuest.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NetcodeGuest } from '../../src/coop/NetcodeGuest.js';
import { NetcodeHost } from '../../src/coop/NetcodeHost.js';
import { MockTransport } from '../../src/coop/MockTransport.js';

function fakeGuestWorld() {
  return {
    applied: [],
    input: { x: 5, y: 6, firing: false, alive: true },
    getLocalInput() { return this.input; },
    applySnapshot(m) { this.applied.push(m); }
  };
}

test('tick sends an input message built from the local input', () => {
  const [a, b] = MockTransport.pair();
  const world = fakeGuestWorld();
  const guest = new NetcodeGuest(a, world);
  const got = [];
  b.onMessage(m => got.push(m));

  guest.tick();

  assert.equal(got.length, 1);
  assert.deepEqual(got[0], { t: 'input', x: 5, y: 6, firing: false, alive: true });
});

test('applies a state message with a newer seq', () => {
  const [a, b] = MockTransport.pair();
  const world = fakeGuestWorld();
  new NetcodeGuest(a, world);

  b.send({ t: 'state', seq: 0, ships: [] });
  b.send({ t: 'state', seq: 1, ships: [] });

  assert.equal(world.applied.length, 2);
});

test('drops a stale or equal seq (out-of-order delivery)', () => {
  const [a, b] = MockTransport.pair();
  const world = fakeGuestWorld();
  new NetcodeGuest(a, world);

  b.send({ t: 'state', seq: 5, ships: [] });
  b.send({ t: 'state', seq: 5, ships: [] });  // equal -> dropped
  b.send({ t: 'state', seq: 3, ships: [] });  // older -> dropped
  b.send({ t: 'state', seq: 6, ships: [] });  // newer -> applied

  assert.equal(world.applied.length, 2);
  assert.equal(world.applied[0].seq, 5);
  assert.equal(world.applied[1].seq, 6);
});

test('end-to-end over MockTransport: host snapshot reaches guest, guest input reaches host', () => {
  const [hostT, guestT] = MockTransport.pair();
  const hostWorld = {
    snapshot: { ships: [{ id: 'h', x: 1, y: 2 }], enemies: [], bullets: [], homing: [], boss: null, pickups: [], hud: {}, events: [] },
    remoteInputs: [],
    getSnapshot() { return this.snapshot; },
    applyRemoteInput(m) { this.remoteInputs.push(m); }
  };
  const guestWorld = fakeGuestWorld();
  const host = new NetcodeHost(hostT, hostWorld);
  const guest = new NetcodeGuest(guestT, guestWorld);

  host.tick();   // host -> guest snapshot
  guest.tick();  // guest -> host input

  assert.equal(guestWorld.applied.length, 1);
  assert.deepEqual(guestWorld.applied[0].ships, hostWorld.snapshot.ships);
  assert.equal(hostWorld.remoteInputs.length, 1);
  assert.equal(hostWorld.remoteInputs[0].x, 5);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../src/coop/NetcodeGuest.js'`.

- [ ] **Step 3: Implement the module**

Create `src/coop/NetcodeGuest.js`:

```js
import { buildInput, MSG } from './protocol.js';

// Guest side: applies host snapshots (dropping stale/out-of-order seq) and sends
// the local ship's input each tick. Transport-agnostic and DOM-free.
export class NetcodeGuest {
  constructor(transport, world) {
    this.transport = transport;
    this.world = world;
    this.lastSeq = -1;
    transport.onMessage((m) => {
      if (!m || m.t !== MSG.STATE) return;
      if (m.seq <= this.lastSeq) return;   // stale or out-of-order
      this.lastSeq = m.seq;
      this.world.applySnapshot(m);
    });
  }

  tick() {
    this.transport.send(buildInput(this.world.getLocalInput()));
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS — netcodeGuest tests (incl. end-to-end) green; all prior tests still green.

- [ ] **Step 5: Commit**

```bash
git add src/coop/NetcodeGuest.js tests/coop/netcodeGuest.test.js
git commit -m "feat(coop): NetcodeGuest snapshot apply (stale-seq drop) + input send"
```

---

### Task 3: Interpolation helper

**Files:**
- Create: `src/coop/interpolate.js`
- Test: `tests/coop/interpolate.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `lerp(a, b, t) -> number` — linear interpolation `a + (b - a) * t`.
  - `interpolateEntities(prev, next, alpha) -> Array` — for each entity in `next`, if an entity with the same `id` exists in `prev`, return a copy with `x`/`y` lerped from prev→next by `alpha`; otherwise return a shallow copy of the `next` entity unchanged. Tolerates `prev`/`next` being `null`/`undefined` (treated as `[]`).

- [ ] **Step 1: Write the failing tests**

Create `tests/coop/interpolate.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lerp, interpolateEntities } from '../../src/coop/interpolate.js';

test('lerp interpolates linearly', () => {
  assert.equal(lerp(0, 10, 0), 0);
  assert.equal(lerp(0, 10, 1), 10);
  assert.equal(lerp(0, 10, 0.5), 5);
});

test('interpolateEntities lerps x/y of matching ids at the midpoint', () => {
  const prev = [{ id: 'a', x: 0, y: 0, hp: 3 }];
  const next = [{ id: 'a', x: 10, y: 20, hp: 2 }];
  const out = interpolateEntities(prev, next, 0.5);
  assert.equal(out.length, 1);
  assert.equal(out[0].x, 5);
  assert.equal(out[0].y, 10);
  assert.equal(out[0].hp, 2);  // non-positional fields come from next
});

test('entities new in next (no prev match) are returned unchanged', () => {
  const out = interpolateEntities([], [{ id: 'b', x: 7, y: 8 }], 0.5);
  assert.deepEqual(out, [{ id: 'b', x: 7, y: 8 }]);
});

test('tolerates null prev and null next', () => {
  assert.deepEqual(interpolateEntities(null, [{ id: 'c', x: 1, y: 1 }], 0.5), [{ id: 'c', x: 1, y: 1 }]);
  assert.deepEqual(interpolateEntities([{ id: 'c', x: 1, y: 1 }], null, 0.5), []);
});

test('does not mutate the input entities', () => {
  const prev = [{ id: 'a', x: 0, y: 0 }];
  const next = [{ id: 'a', x: 10, y: 10 }];
  interpolateEntities(prev, next, 0.5);
  assert.equal(next[0].x, 10);
  assert.equal(prev[0].x, 0);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../src/coop/interpolate.js'`.

- [ ] **Step 3: Implement the module**

Create `src/coop/interpolate.js`:

```js
// Pure interpolation helpers for smoothing remote entities between snapshots.
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

// For each entity in `next`, lerp x/y from the same-id entity in `prev` by alpha.
// Entities with no prev match are returned as a shallow copy of next. Inputs may
// be null/undefined (treated as empty). Never mutates the inputs.
export function interpolateEntities(prev, next, alpha) {
  const prevById = new Map((prev || []).map(e => [e.id, e]));
  return (next || []).map(n => {
    const p = prevById.get(n.id);
    if (!p) return { ...n };
    return { ...n, x: lerp(p.x, n.x, alpha), y: lerp(p.y, n.y, alpha) };
  });
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS — interpolate tests green; all prior tests still green.

- [ ] **Step 5: Commit**

```bash
git add src/coop/interpolate.js tests/coop/interpolate.test.js
git commit -m "feat(coop): pure interpolation helpers for remote entities"
```

---

## Self-Review

**1. Spec coverage (1C-1 scope):** host-authoritative snapshot broadcast + remote-input apply → Task 1. Guest snapshot apply with stale-seq drop + input send → Task 2 (end-to-end loopback test included). Interpolation for smoothness → Task 3. The world-adapter interface is documented in Architecture and consumed (not implemented) here — the `Game` implements it in a later 1C sub-plan, along with `RtdbTransport`, lobby UI, and the death-site change (all explicitly OUT of scope here). ✓

**2. Placeholder scan:** No TBD/TODO; every code step has complete code; every test asserts real behavior. ✓

**3. Type consistency:** `NetcodeHost(transport, world)` / `.tick()` / `.seq` and `NetcodeGuest(transport, world)` / `.tick()` / `.lastSeq` are used identically across tasks and tests. `buildState`/`buildInput`/`MSG` match the Phase-1A signatures. The world-adapter method names (`getSnapshot`/`applySnapshot`/`getLocalInput`/`applyRemoteInput`) are consistent between the Architecture block and Tasks 1–2. ✓

## Rollout note

Next 1C sub-plans (separate plans): **1C-2** `RtdbTransport` (Firebase room read/write) + room/lobby manager; **1C-3** room-code lobby UI; **1C-4** `Game` implements the world adapter and runs `NetcodeHost`/`NetcodeGuest`, adds the second (remote) player, and changes the four death-collision sites from "local dead → game over" to `this.roster.isGameOver()`. Those touch DOM/Firebase and are browser/2-tab verified.
