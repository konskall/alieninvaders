# Co-op Phase 1C-2 — Room Code & RTDB Transport Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide the Firebase wire for online co-op — a pure room-code module (`roomCode.js`) and an `RtdbTransport` (a `NetTransport` implementation over Firebase Realtime DB) — plus the `rooms/` security rules.

**Architecture:** `roomCode.js` is pure and TDD-able (code generation + validation). `RtdbTransport extends BaseTransport` and routes messages by type: high-frequency `state`/`input` use latest-wins `set()` on a per-direction `/live` node (you only ever want the newest snapshot/input); low-frequency control messages (`hello`/`start`/`bye`) are `push()`ed to a per-direction `/ctrl` queue and delivered via `child_added`. RtdbTransport is Firebase-bound, so it is verified in a browser / on two devices, not by `node --test`; its only unit-level guarantee here is that it never throws on construction and exposes the `NetTransport` surface.

**Tech Stack:** Vanilla JS ES modules; Firebase Realtime DB (compat SDK, already loaded); Node `node:test` (built-in) for the pure module.

## Global Constraints

- Vanilla JS ES modules only. Zero runtime dependencies (Firebase is already loaded globally as `window.firebase`).
- `roomCode.js` MUST be DOM-free and Firebase-free (TDD under `node --test`).
- `RtdbTransport` MUST implement the `NetTransport` surface: `connect(): Promise<void>`, `send(msg): void`, `onMessage(cb)`, `onClose(cb)`, `close(): void` (it extends `BaseTransport` for the listener plumbing).
- Room code: 4 characters from the alphabet `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (no ambiguous `0 O 1 I L`).
- Message routing: `state`/`input` → latest-wins `set()` on `rooms/<code>/<dir>/live`; all other types → `push()` on `rooms/<code>/<dir>/ctrl`.
- Security rules for `rooms/` must be added; the user re-publishes them in the Firebase console (RtdbTransport writes are denied until then).
- Work on the `coop` branch. Commit once per task.

---

### Task 1: roomCode (pure)

**Files:**
- Create: `src/coop/roomCode.js`
- Test: `tests/coop/roomCode.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `ROOM_ALPHABET` — the string `'ABCDEFGHJKMNPQRSTUVWXYZ23456789'`.
  - `generateRoomCode(len = 4, rnd = Math.random) -> string` — `len` chars drawn from `ROOM_ALPHABET` using `rnd` (injectable for deterministic tests).
  - `isValidRoomCode(code) -> boolean` — true iff `code` is a 4-char string with every char in `ROOM_ALPHABET`.

- [ ] **Step 1: Write the failing tests**

Create `tests/coop/roomCode.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROOM_ALPHABET, generateRoomCode, isValidRoomCode } from '../../src/coop/roomCode.js';

test('ROOM_ALPHABET excludes ambiguous characters', () => {
  for (const ch of '01OIL') assert.ok(!ROOM_ALPHABET.includes(ch), `should not include ${ch}`);
});

test('generateRoomCode returns 4 chars, all from the alphabet', () => {
  const code = generateRoomCode();
  assert.equal(code.length, 4);
  for (const ch of code) assert.ok(ROOM_ALPHABET.includes(ch));
});

test('generateRoomCode is deterministic with an injected rng', () => {
  // rnd always returns 0 -> first alphabet char repeated
  const code = generateRoomCode(4, () => 0);
  assert.equal(code, ROOM_ALPHABET[0].repeat(4));
});

test('generateRoomCode respects a custom length', () => {
  assert.equal(generateRoomCode(6, () => 0).length, 6);
});

test('isValidRoomCode accepts a generated code', () => {
  assert.equal(isValidRoomCode(generateRoomCode(4, () => 0.5)), true);
});

test('isValidRoomCode rejects wrong length, lowercase, ambiguous chars, and non-strings', () => {
  assert.equal(isValidRoomCode('ABC'), false);     // too short
  assert.equal(isValidRoomCode('ABCDE'), false);   // too long
  assert.equal(isValidRoomCode('abcd'), false);    // lowercase
  assert.equal(isValidRoomCode('AB0I'), false);    // ambiguous chars not in alphabet
  assert.equal(isValidRoomCode(1234), false);      // not a string
  assert.equal(isValidRoomCode(null), false);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../src/coop/roomCode.js'`.

- [ ] **Step 3: Implement the module**

Create `src/coop/roomCode.js`:

```js
// Pure room-code helpers. DOM-free and Firebase-free.
// Alphabet excludes ambiguous glyphs (0/O, 1/I/L) for easy verbal sharing.
export const ROOM_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateRoomCode(len = 4, rnd = Math.random) {
  let s = '';
  for (let i = 0; i < len; i++) {
    s += ROOM_ALPHABET[Math.floor(rnd() * ROOM_ALPHABET.length)];
  }
  return s;
}

export function isValidRoomCode(code) {
  return typeof code === 'string'
    && code.length === 4
    && [...code].every(ch => ROOM_ALPHABET.includes(ch));
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS — roomCode tests green; all prior tests still green.

- [ ] **Step 5: Commit**

```bash
git add src/coop/roomCode.js tests/coop/roomCode.test.js
git commit -m "feat(coop): pure room-code generator + validator"
```

---

### Task 2: RtdbTransport (Firebase)

**Files:**
- Create: `src/coop/RtdbTransport.js`
- Test: `tests/coop/rtdbTransport.test.js` (construction-surface test only — Firebase behavior is browser/2-device verified)

**Interfaces:**
- Consumes: `BaseTransport` from `./BaseTransport.js` (extends it); `MSG` from `./protocol.js`.
- Produces: `class RtdbTransport extends BaseTransport` with `constructor(db, code, role)` where `role` is `'host'` or `'guest'`, plus `connect()`, `send(msg)`, `close()`. `db` is a Firebase Realtime DB instance (`firebase.database()`), shaped `db.ref(path)` → `{ set, push, on, off }`.

- [ ] **Step 1: Write the failing test (construction surface, with a fake db)**

Create `tests/coop/rtdbTransport.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RtdbTransport } from '../../src/coop/RtdbTransport.js';

// Minimal fake Firebase db: records ref paths and set/push payloads, lets us
// fire 'value'/'child_added' callbacks manually.
function fakeDb() {
  const calls = { set: [], push: [], on: [], off: [] };
  const handlers = {};
  const db = {
    ref(path) {
      return {
        path,
        set(v) { calls.set.push({ path, v }); return Promise.resolve(); },
        push(v) { calls.push.push({ path, v }); return { key: 'k' }; },
        on(ev, cb) { calls.on.push({ path, ev }); handlers[`${path}|${ev}`] = cb; return cb; },
        off(ev, cb) { calls.off.push({ path, ev }); }
      };
    }
  };
  return { db, calls, handlers };
}

test('host send routes state to /fromHost/live (set) and ctrl to /fromHost/ctrl (push)', () => {
  const { db, calls } = fakeDb();
  const t = new RtdbTransport(db, 'K7QM', 'host');
  t.send({ t: 'state', seq: 1 });
  t.send({ t: 'start', difficulty: 'easy' });
  assert.deepEqual(calls.set[0], { path: 'rooms/K7QM/fromHost/live', v: { t: 'state', seq: 1 } });
  assert.equal(calls.push[0].path, 'rooms/K7QM/fromHost/ctrl');
});

test('guest connect subscribes to /fromHost/live and /fromHost/ctrl; inbound is emitted', async () => {
  const { db, handlers } = fakeDb();
  const t = new RtdbTransport(db, 'K7QM', 'guest');
  const got = [];
  t.onMessage(m => got.push(m));
  await t.connect();
  // simulate Firebase firing the host's latest 'state' on the live node
  handlers['rooms/K7QM/fromHost/live|value']({ val: () => ({ t: 'state', seq: 9 }) });
  // simulate a queued control message
  handlers['rooms/K7QM/fromHost/ctrl|child_added']({ val: () => ({ t: 'start', difficulty: 'normal' }) });
  assert.equal(got.length, 2);
  assert.equal(got[0].seq, 9);
  assert.equal(got[1].t, 'start');
});

test('guest send routes input to /fromGuest/live (set)', () => {
  const { db, calls } = fakeDb();
  const t = new RtdbTransport(db, 'K7QM', 'guest');
  t.send({ t: 'input', x: 1, y: 2 });
  assert.deepEqual(calls.set[0], { path: 'rooms/K7QM/fromGuest/live', v: { t: 'input', x: 1, y: 2 } });
});

test('close detaches listeners and fires onClose', async () => {
  const { db, calls } = fakeDb();
  const t = new RtdbTransport(db, 'K7QM', 'guest');
  let closed = false;
  t.onClose(() => { closed = true; });
  await t.connect();
  t.close();
  assert.ok(calls.off.length >= 2);
  assert.equal(closed, true);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../src/coop/RtdbTransport.js'`.

- [ ] **Step 3: Implement the module**

Create `src/coop/RtdbTransport.js`:

```js
import { BaseTransport } from './BaseTransport.js';
import { MSG } from './protocol.js';

// NetTransport over Firebase Realtime DB. Host and guest each own an outbound
// direction; high-frequency state/input use latest-wins set() on a /live node,
// control messages are push()ed to a /ctrl queue. Firebase-bound: verified in
// the browser / on two devices, not under node:test.
export class RtdbTransport extends BaseTransport {
  constructor(db, code, role) {
    super();
    this.db = db;
    this.code = code;
    this.role = role;
    this.outDir = role === 'host' ? 'fromHost' : 'fromGuest';
    this.inDir  = role === 'host' ? 'fromGuest' : 'fromHost';
    this._subs = [];
  }

  async connect() {
    const base = `rooms/${this.code}/${this.inDir}`;
    const liveRef = this.db.ref(`${base}/live`);
    const liveCb = liveRef.on('value', (snap) => {
      const v = snap.val();
      if (v) this._emitMessage(v);
    });
    const ctrlRef = this.db.ref(`${base}/ctrl`);
    const ctrlCb = ctrlRef.on('child_added', (snap) => {
      const v = snap.val();
      if (v) this._emitMessage(v);
    });
    this._subs.push([liveRef, 'value', liveCb], [ctrlRef, 'child_added', ctrlCb]);
  }

  send(msg) {
    const base = `rooms/${this.code}/${this.outDir}`;
    if (msg.t === MSG.STATE || msg.t === MSG.INPUT) {
      this.db.ref(`${base}/live`).set(msg);     // latest-wins
    } else {
      this.db.ref(`${base}/ctrl`).push(msg);    // queued
    }
  }

  close() {
    for (const [ref, ev, cb] of this._subs) ref.off(ev, cb);
    this._subs = [];
    super.close();
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS — rtdbTransport surface tests green (with the fake db); all prior tests still green.

- [ ] **Step 5: Commit**

```bash
git add src/coop/RtdbTransport.js tests/coop/rtdbTransport.test.js
git commit -m "feat(coop): RtdbTransport (Firebase NetTransport, live + ctrl channels)"
```

---

### Task 3: rooms security rules

**Files:**
- Modify: `database.rules.json`
- Modify: `FIREBASE_SECURITY.md`

**Interfaces:**
- Consumes: nothing (config + docs).
- Produces: a `rooms` block in `database.rules.json` allowing read/write under `rooms/<code>` with bounded sizes; documentation of the re-publish step.

- [ ] **Step 1: Add the `rooms` rule block**

In `database.rules.json`, the current top-level `rules` object has `.read:false`, `.write:false`, and a `leaderboard` block. Add a sibling `rooms` block so the `rules` object reads:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "leaderboard": {
      ".read": true,
      "$entry": {
        ".write": "!data.exists()",
        ".validate": "newData.hasChildren(['name','score','level'])",
        "name":      { ".validate": "newData.isString() && newData.val().length >= 1 && newData.val().length <= 20" },
        "score":     { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 100000000" },
        "level":     { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 100000" },
        "date":      { ".validate": "newData.isString() && newData.val().length <= 24" },
        "timestamp": { ".validate": "newData.isNumber()" },
        "id":        { ".validate": "newData.isString() && newData.val().length <= 64" },
        "$other":    { ".validate": false }
      }
    },
    "rooms": {
      "$code": {
        ".read": true,
        ".write": true,
        ".validate": "$code.length == 4"
      }
    }
  }
}
```

(Co-op rooms are ephemeral and only reachable by knowing the 4-char code; rules favor liveness — they gate that writes occur under a 4-char room key and keep the rest of the database closed.)

- [ ] **Step 2: Document the re-publish step**

In `FIREBASE_SECURITY.md`, under the "How to apply them" section, add a line noting that the rules now also cover `rooms/<code>` for online co-op and must be re-published the same way (Console → Realtime Database → Rules → paste `database.rules.json` → Publish). Add this sentence at the end of the "What the rules ... do" list:

```markdown
- `rooms/<code>` — readable/writable by participants who know the 4-char code
  (ephemeral co-op session state); the rest of the database stays closed.
```

- [ ] **Step 3: Validate JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('database.rules.json','utf8')); console.log('rules JSON OK')"`
Expected: prints `rules JSON OK` (no parse error).

- [ ] **Step 4: Commit**

```bash
git add database.rules.json FIREBASE_SECURITY.md
git commit -m "feat(coop): RTDB security rules for rooms/<code>"
```

---

## Self-Review

**1. Spec coverage (1C-2 scope):** room code generation/validation → Task 1. Firebase transport (`NetTransport` over RTDB, live + ctrl channels) → Task 2. `rooms/` security rules + re-publish note → Task 3. The lobby UI and game.js wiring that consume these are later sub-plans (1C-3, 1C-4). ✓

**2. Placeholder scan:** No TBD/TODO. roomCode has complete code + tests. RtdbTransport has complete code + a surface test using a fake db (Firebase behavior is explicitly browser/2-device verified, not faked-as-real). Rules task shows the complete JSON. ✓

**3. Type consistency:** `RtdbTransport(db, code, role)` and its `connect/send/close` match the `NetTransport` surface from Phase 1A `BaseTransport`. `MSG.STATE`/`MSG.INPUT` match protocol.js. The `rooms/<code>/<dir>/live|ctrl` paths in the implementation match the test's asserted paths. ✓

## Rollout note

Next: **1C-3** room-code lobby UI (create/join, host difficulty, waiting→start) and **1C-4** `Game` implements the world adapter, runs `NetcodeHost`/`NetcodeGuest` over `RtdbTransport`, renders the second (remote) ship, and switches the four death sites to `this.roster.isGameOver()`. Both are DOM/Firebase and require the user's `rooms/` rules to be published before real 2-device play; interim verification uses two browser tabs against the live RTDB once rules are published.
