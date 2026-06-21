# Co-op Phase 1A — Networking Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the DOM-free networking foundation for online co-op — a transport abstraction, an in-memory mock transport, and the message protocol — all behind a zero-dependency Node test harness.

**Architecture:** A `BaseTransport` provides listener plumbing (`onMessage`/`onClose`/emit). Concrete transports extend it; `MockTransport` is an in-memory loopback pair used for tests and local development. A pure `protocol.js` defines message types and builders/validators. None of these modules touch the DOM, so they run under Node's built-in test runner.

**Tech Stack:** Vanilla JavaScript ES modules (no bundler), Node.js `node:test` + `node:assert` (built-in, zero dependencies), browser-loaded via `<script type="module">`.

## Global Constraints

- Language: vanilla JS ES modules only. No bundler, no transpiler, no TypeScript.
- **Zero runtime dependencies.** Tests use only Node built-ins (`node:test`, `node:assert/strict`). No npm packages get installed.
- All Phase 1A modules MUST be **DOM-free** (no `document`, `window`, `canvas`, Firebase) so they run under `node --test`.
- Transport interface (verbatim from spec): `connect(): Promise<void>`, `send(msg): void`, `onMessage(cb): void`, `onClose(cb): void`, `close(): void`.
- Message types (verbatim from spec): `hello`, `start`, `state`, `input`, `ping`, `pong`, `bye`. Every message is a JSON-able object with a string `t` field.
- Host→guest `state` carries a monotonically increasing `seq`; the guest drops stale (lower-or-equal `seq`) snapshots.
- New code lives under `src/coop/` (one responsibility per file). Tests mirror under `tests/coop/`.
- Frequent commits: one per task.

---

### Task 1: Zero-dependency Node test harness

**Files:**
- Create: `package.json`
- Create: `tests/coop/smoke.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: an `npm test` command that runs `node --test` over `tests/`, and confirms ES-module test files execute.

- [ ] **Step 1: Write the failing test**

Create `tests/coop/smoke.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('test harness runs ES module tests', () => {
  assert.equal(1 + 1, 2);
});
```

- [ ] **Step 2: Run it to verify it fails (no runner configured yet)**

Run: `npm test`
Expected: FAIL — `npm error Missing script: "test"` (no `package.json` yet).

- [ ] **Step 3: Create the package.json**

Create `package.json`:

```json
{
  "name": "alien-invaders",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — output shows `tests 1`, `pass 1`, `fail 0`.

- [ ] **Step 5: Commit**

```bash
git add package.json tests/coop/smoke.test.js
git commit -m "test: add zero-dependency node:test harness"
```

---

### Task 2: Message protocol module

**Files:**
- Create: `src/coop/protocol.js`
- Test: `tests/coop/protocol.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `MSG` — frozen object: `{ HELLO:'hello', START:'start', STATE:'state', INPUT:'input', PING:'ping', PONG:'pong', BYE:'bye' }`
  - `buildHello(name) -> { t:'hello', name:string }`
  - `buildStart(difficulty) -> { t:'start', difficulty:string }`
  - `buildInput(ship) -> { t:'input', x:number, y:number, firing:boolean, alive:boolean }`
  - `buildState(seq, world) -> { t:'state', seq:number, ships, enemies, bullets, homing, boss, pickups, hud, events }`
  - `isValidMessage(msg) -> boolean`

- [ ] **Step 1: Write the failing tests**

Create `tests/coop/protocol.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MSG, buildHello, buildStart, buildInput, buildState, isValidMessage } from '../../src/coop/protocol.js';

test('MSG has the spec message types', () => {
  assert.deepEqual(
    { ...MSG },
    { HELLO:'hello', START:'start', STATE:'state', INPUT:'input', PING:'ping', PONG:'pong', BYE:'bye' }
  );
});

test('buildInput shapes a ship input message', () => {
  const msg = buildInput({ x: 12.5, y: 30, firing: 1, alive: true, extra: 'ignored' });
  assert.deepEqual(msg, { t: 'input', x: 12.5, y: 30, firing: true, alive: true });
});

test('buildState includes seq and all world fields', () => {
  const world = {
    ships: [{ id: 'h', x: 1, y: 2, health: 2, alive: true }],
    enemies: [{ id: 'e1', type: 'scout_drone', x: 5, y: 6, hp: 3 }],
    bullets: [{ id: 'b1', x: 1, y: 1, vx: 0, vy: -5, kind: 'player' }],
    homing: [],
    boss: null,
    pickups: [],
    hud: { score: 100, level: 1, wave: 1, combo: 0, kills: 0 },
    events: [{ e: 'explosion', x: 5, y: 6, size: 1 }]
  };
  const msg = buildState(7, world);
  assert.equal(msg.t, 'state');
  assert.equal(msg.seq, 7);
  assert.equal(msg.boss, null);
  assert.deepEqual(msg.enemies, world.enemies);
  assert.deepEqual(msg.events, world.events);
});

test('buildState defaults boss to null and events to []', () => {
  const msg = buildState(1, { ships: [], enemies: [], bullets: [], homing: [], pickups: [], hud: {} });
  assert.equal(msg.boss, null);
  assert.deepEqual(msg.events, []);
});

test('isValidMessage rejects junk and accepts typed objects', () => {
  assert.equal(isValidMessage(null), false);
  assert.equal(isValidMessage(42), false);
  assert.equal(isValidMessage({}), false);
  assert.equal(isValidMessage({ t: 123 }), false);
  assert.equal(isValidMessage({ t: 'state' }), true);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../src/coop/protocol.js'`.

- [ ] **Step 3: Implement the module**

Create `src/coop/protocol.js`:

```js
// Co-op wire protocol — pure, DOM-free. Every message is a JSON-able object
// with a string `t` (type) field.
export const MSG = Object.freeze({
  HELLO: 'hello',
  START: 'start',
  STATE: 'state',
  INPUT: 'input',
  PING:  'ping',
  PONG:  'pong',
  BYE:   'bye'
});

export function buildHello(name) {
  return { t: MSG.HELLO, name: String(name ?? '').slice(0, 20) };
}

export function buildStart(difficulty) {
  return { t: MSG.START, difficulty: String(difficulty) };
}

export function buildInput(ship) {
  return {
    t: MSG.INPUT,
    x: ship.x,
    y: ship.y,
    firing: !!ship.firing,
    alive: !!ship.alive
  };
}

export function buildState(seq, world) {
  return {
    t: MSG.STATE,
    seq,
    ships:   world.ships,
    enemies: world.enemies,
    bullets: world.bullets,
    homing:  world.homing,
    boss:    world.boss ?? null,
    pickups: world.pickups,
    hud:     world.hud,
    events:  world.events ?? []
  };
}

export function isValidMessage(msg) {
  return !!msg && typeof msg === 'object' && typeof msg.t === 'string';
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS — protocol tests green, smoke test still green.

- [ ] **Step 5: Commit**

```bash
git add src/coop/protocol.js tests/coop/protocol.test.js
git commit -m "feat(coop): message protocol builders + validator"
```

---

### Task 3: BaseTransport (listener plumbing)

**Files:**
- Create: `src/coop/BaseTransport.js`
- Test: `tests/coop/baseTransport.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `class BaseTransport` with:
  - `onMessage(cb)` / `onClose(cb)` — register listeners
  - `_emitMessage(msg)` — invoke every message listener
  - `_emitClose()` — invoke every close listener exactly once (idempotent); sets `this._closed = true`
  - `async connect()` — no-op default (overridden by subclasses)
  - `send(msg)` — throws `'send() not implemented'` by default
  - `close()` — calls `_emitClose()`
  - field `this._closed` (boolean)

- [ ] **Step 1: Write the failing tests**

Create `tests/coop/baseTransport.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BaseTransport } from '../../src/coop/BaseTransport.js';

test('onMessage listeners receive emitted messages', () => {
  const t = new BaseTransport();
  const got = [];
  t.onMessage(m => got.push(m));
  t.onMessage(m => got.push(m));
  t._emitMessage({ t: 'ping' });
  assert.deepEqual(got, [{ t: 'ping' }, { t: 'ping' }]);
});

test('_emitClose fires onClose listeners exactly once', () => {
  const t = new BaseTransport();
  let count = 0;
  t.onClose(() => count++);
  t._emitClose();
  t._emitClose();
  assert.equal(count, 1);
  assert.equal(t._closed, true);
});

test('close() triggers onClose', () => {
  const t = new BaseTransport();
  let closed = false;
  t.onClose(() => { closed = true; });
  t.close();
  assert.equal(closed, true);
});

test('send() throws by default', () => {
  const t = new BaseTransport();
  assert.throws(() => t.send({ t: 'ping' }), /not implemented/);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../src/coop/BaseTransport.js'`.

- [ ] **Step 3: Implement the module**

Create `src/coop/BaseTransport.js`:

```js
// Shared listener plumbing for all transports. DOM-free.
export class BaseTransport {
  constructor() {
    this._msgCbs = [];
    this._closeCbs = [];
    this._closed = false;
  }

  onMessage(cb) { this._msgCbs.push(cb); }
  onClose(cb) { this._closeCbs.push(cb); }

  _emitMessage(msg) {
    for (const cb of this._msgCbs) cb(msg);
  }

  _emitClose() {
    if (this._closed) return;
    this._closed = true;
    for (const cb of this._closeCbs) cb();
  }

  // Overridden by concrete transports.
  async connect() { /* no-op default */ }

  send(_msg) {
    throw new Error('send() not implemented');
  }

  close() {
    this._emitClose();
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS — all baseTransport tests green; previous tests still green.

- [ ] **Step 5: Commit**

```bash
git add src/coop/BaseTransport.js tests/coop/baseTransport.test.js
git commit -m "feat(coop): BaseTransport listener plumbing"
```

---

### Task 4: MockTransport (in-memory loopback pair)

**Files:**
- Create: `src/coop/MockTransport.js`
- Test: `tests/coop/mockTransport.test.js`

**Interfaces:**
- Consumes: `BaseTransport` (Task 3) — extends it; `isValidMessage` is NOT used here.
- Produces: `class MockTransport extends BaseTransport` with:
  - static `MockTransport.pair() -> [a, b]` — two linked transports (`a.peer === b`, `b.peer === a`)
  - `send(msg)` — pushes a deep copy to `this.sent`, and delivers a deep copy to the peer's message listeners (unless peer is closed)
  - `close()` — closes self and the peer
  - field `this.sent` (array of messages this transport sent)

- [ ] **Step 1: Write the failing tests**

Create `tests/coop/mockTransport.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockTransport } from '../../src/coop/MockTransport.js';

test('pair() links two transports', () => {
  const [a, b] = MockTransport.pair();
  assert.equal(a.peer, b);
  assert.equal(b.peer, a);
});

test('send delivers a deep copy to the peer', () => {
  const [a, b] = MockTransport.pair();
  const got = [];
  b.onMessage(m => got.push(m));
  const payload = { t: 'state', seq: 1, nested: { hp: 3 } };
  a.send(payload);
  assert.deepEqual(got, [{ t: 'state', seq: 1, nested: { hp: 3 } }]);
  // mutating the original must not affect what the peer received (deep copy)
  payload.nested.hp = 99;
  assert.equal(got[0].nested.hp, 3);
  // sender records what it sent
  assert.equal(a.sent.length, 1);
});

test('closing one side fires onClose on both', () => {
  const [a, b] = MockTransport.pair();
  let aClosed = false, bClosed = false;
  a.onClose(() => { aClosed = true; });
  b.onClose(() => { bClosed = true; });
  a.close();
  assert.equal(aClosed, true);
  assert.equal(bClosed, true);
});

test('send after peer closed does not deliver', () => {
  const [a, b] = MockTransport.pair();
  const got = [];
  b.onMessage(m => got.push(m));
  b.close();
  a.send({ t: 'ping' });
  assert.equal(got.length, 0);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../src/coop/MockTransport.js'`.

- [ ] **Step 3: Implement the module**

Create `src/coop/MockTransport.js`:

```js
import { BaseTransport } from './BaseTransport.js';

// In-memory loopback transport for tests and local development. DOM-free.
export class MockTransport extends BaseTransport {
  constructor() {
    super();
    this.peer = null;
    this.sent = [];
  }

  static pair() {
    const a = new MockTransport();
    const b = new MockTransport();
    a.peer = b;
    b.peer = a;
    return [a, b];
  }

  async connect() { /* already "connected" */ }

  send(msg) {
    const copy = JSON.parse(JSON.stringify(msg));
    this.sent.push(copy);
    if (this.peer && !this.peer._closed) {
      this.peer._emitMessage(JSON.parse(JSON.stringify(msg)));
    }
  }

  close() {
    super.close();
    if (this.peer && !this.peer._closed) this.peer._emitClose();
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS — all mockTransport tests green; full suite green.

- [ ] **Step 5: Commit**

```bash
git add src/coop/MockTransport.js tests/coop/mockTransport.test.js
git commit -m "feat(coop): in-memory MockTransport loopback pair"
```

---

## Self-Review

**1. Spec coverage (Phase 1A scope only):**
- `NetTransport` interface (connect/send/onMessage/onClose/close) → Task 3 (`BaseTransport`) defines it; concrete `RtdbTransport`/`WebRtcTransport` are out of scope for 1A (1C / Phase 2). ✓
- `MockTransport` (in-memory loopback) for tests → Task 4. ✓
- Protocol messages (`hello/start/state/input/ping/pong/bye`, `seq`) → Task 2. ✓
- DOM-free + Node test harness → Task 1 + Global Constraints. ✓
- Out of 1A (deferred to later sub-plans): engine `players[]` refactor (1B), RtdbTransport + netcode session + lobby (1C), co-op leaderboard + rules (1D), disconnect handling (1E). Stated in the rollout note below.

**2. Placeholder scan:** No TBD/TODO; every code step has complete code; every test step has complete assertions. ✓

**3. Type consistency:** `BaseTransport._emitMessage/_emitClose/_closed` are produced in Task 3 and consumed by `MockTransport` in Task 4 with identical names. `MSG`/`buildState` shapes in Task 2 match the spec's protocol section. ✓

## Rollout note (subsequent sub-plans)

Phase 1A is the foundation. After it is implemented and reviewed, the remaining
Phase 1 sub-plans are written one at a time (each its own spec-derived plan):
**1B** engine refactor (`players[]`/modes, solo unchanged), **1C** netcode
session + `RtdbTransport` + room-code lobby, **1D** co-op leaderboard +
security-rules update, **1E** disconnect handling. Each builds on the tested
primitives delivered here.
