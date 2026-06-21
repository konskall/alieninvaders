# Co-op Phase 1B — Engine Roster & Modes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the engine so the player is held in a `CoopRoster` (a list of players) accessed through a `this.player` getter, and add a `mode` field — with **solo gameplay behaviorally identical** — laying the structural foundation for two ships without changing any current behavior.

**Architecture:** A pure, DOM-free `CoopRoster` holds the players array, tracks who is alive, and computes the all-players-dead game-over condition (unit-tested). `Game` keeps a `this.roster`, exposes `get player()` returning the local player so the ~50 existing `this.player.*` reads keep working unchanged, and gains `this.mode = 'solo'`. The multiplayer death semantics (a single player's death must NOT end the game when a partner is alive) are deliberately deferred to Phase 1C, where a second player actually exists; in solo the existing "player dead = game over" logic is already correct and is left untouched.

**Tech Stack:** Vanilla JS ES modules; Node `node:test` (built-in); browser-loaded modules.

## Global Constraints

- Vanilla JS ES modules only. No bundler/transpiler/TypeScript. Zero runtime dependencies.
- `CoopRoster` MUST be DOM-free (unit-testable under `node --test`).
- **Solo gameplay must be behaviorally identical** after this phase. No change to spawning, scoring, collisions, difficulty, or the game-over trigger in solo.
- Do NOT modify the four player-death collision sites (`if (this.player.takeDamage()) { this.gameOver(); }`) in this phase — multiplayer death semantics belong to Phase 1C.
- `this.player` becomes a getter; therefore NO code may assign `this.player = …` (the two existing assignments are converted to roster calls in this plan).
- Work happens on the `coop` branch. Commit once per task.

---

### Task 1: CoopRoster pure module

**Files:**
- Create: `src/coop/CoopRoster.js`
- Test: `tests/coop/coopRoster.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `class CoopRoster` with:
  - `this.players` (array), `this.localIndex` (number, default 0)
  - `setLocal(player) -> player` — stores `player` at `localIndex` and returns it
  - `get local()` — returns the local player or `null`
  - `aliveCount() -> number` — count of players with `health > 0`
  - `isGameOver() -> boolean` — `true` only when there is ≥1 player AND none have `health > 0`
  - `reset()` — empties `players`

- [ ] **Step 1: Write the failing tests**

Create `tests/coop/coopRoster.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CoopRoster } from '../../src/coop/CoopRoster.js';

test('setLocal stores and returns the local player; local getter reads it', () => {
  const r = new CoopRoster();
  const p = { health: 3 };
  assert.equal(r.setLocal(p), p);
  assert.equal(r.local, p);
});

test('local is null on a fresh roster', () => {
  assert.equal(new CoopRoster().local, null);
});

test('aliveCount counts only players with health > 0', () => {
  const r = new CoopRoster();
  r.players = [{ health: 2 }, { health: 0 }, { health: 1 }];
  assert.equal(r.aliveCount(), 2);
});

test('isGameOver is false for an empty roster', () => {
  assert.equal(new CoopRoster().isGameOver(), false);
});

test('isGameOver is false while at least one player is alive', () => {
  const r = new CoopRoster();
  r.players = [{ health: 0 }, { health: 1 }];
  assert.equal(r.isGameOver(), false);
});

test('isGameOver is true only when all players are dead', () => {
  const r = new CoopRoster();
  r.players = [{ health: 0 }, { health: 0 }];
  assert.equal(r.isGameOver(), true);
});

test('solo: one player dead means game over', () => {
  const r = new CoopRoster();
  r.setLocal({ health: 0 });
  assert.equal(r.isGameOver(), true);
});

test('reset empties the players array', () => {
  const r = new CoopRoster();
  r.setLocal({ health: 3 });
  r.reset();
  assert.equal(r.players.length, 0);
  assert.equal(r.local, null);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../src/coop/CoopRoster.js'`.

- [ ] **Step 3: Implement the module**

Create `src/coop/CoopRoster.js`:

```js
// Holds the players in a game session and answers the co-op game-over question.
// DOM-free and engine-agnostic: a "player" is any object with a numeric `health`.
export class CoopRoster {
  constructor() {
    this.players = [];
    this.localIndex = 0;
  }

  setLocal(player) {
    this.players[this.localIndex] = player;
    return player;
  }

  get local() {
    return this.players[this.localIndex] || null;
  }

  aliveCount() {
    return this.players.filter(p => p && p.health > 0).length;
  }

  isGameOver() {
    return this.players.length > 0 && this.aliveCount() === 0;
  }

  reset() {
    this.players = [];
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS — coopRoster tests green; all prior coop tests still green.

- [ ] **Step 5: Commit**

```bash
git add src/coop/CoopRoster.js tests/coop/coopRoster.test.js
git commit -m "feat(coop): CoopRoster players list + game-over logic"
```

---

### Task 2: Wire Game to the roster (solo unchanged)

**Files:**
- Modify: `src/game.js` (constructor `this.player = null`; add `get player()`; `startGame` player creation; add import)

**Interfaces:**
- Consumes: `CoopRoster` from `./coop/CoopRoster.js` — `setLocal(player)`, `get local`, `reset()`.
- Produces: `this.roster` (a `CoopRoster`), `this.mode` (string, `'solo'`), and `get player()` returning `this.roster.local`. All existing `this.player.*` reads continue to resolve to the local player.

- [ ] **Step 1: Add the import**

In `src/game.js`, find the existing import block at the top. After the existing imports (the entities/managers/config imports), add:

```js
import { CoopRoster } from './coop/CoopRoster.js';
```

(If a `from './config.js'` import line is the first import, place the new line immediately after the last existing `import` statement.)

- [ ] **Step 2: Replace the constructor's player field with the roster + mode**

Find this line in the `Game` constructor:

```js
        this.player = null;
```

Replace it with:

```js
        this.roster = new CoopRoster();
        this.mode = 'solo';   // 'solo' | 'coopHost' | 'coopGuest' (set by later phases)
```

- [ ] **Step 3: Add the `player` getter**

Immediately AFTER the constructor's closing brace (before the next method), add this getter inside the `Game` class:

```js
    // Local player accessor — all existing `this.player.*` reads resolve here.
    // `this.player` is intentionally read-only now; assign via `this.roster`.
    get player() {
        return this.roster.local;
    }
```

- [ ] **Step 4: Convert the startGame player creation to a roster call**

In `startGame()`, find:

```js
        this.player = new Player(
            CONFIG.canvas.width / 2,
            CONFIG.canvas.height - 100
        );
```

Replace it with:

```js
        this.roster.reset();
        this.roster.setLocal(new Player(
            CONFIG.canvas.width / 2,
            CONFIG.canvas.height - 100
        ));
```

- [ ] **Step 5: Verify no remaining `this.player =` assignments**

Run: `grep -n "this\.player\s*=" src/game.js`
Expected: NO matches (only `this.player.` reads remain; the getter has no setter, so any leftover assignment would throw at runtime). If any assignment remains, convert it to a `this.roster` call before continuing.

- [ ] **Step 6: Run the test suite (no regressions)**

Run: `npm test`
Expected: PASS — all existing tests (smoke, protocol, BaseTransport, MockTransport, CoopRoster) green. (These do not exercise `game.js`, but confirm nothing else broke.)

- [ ] **Step 7: Browser playtest verification (controller performs this)**

This step is verified in a real browser (game.js is DOM/canvas-bound and cannot run under `node --test`). Serve the repo and load the game:
- Solo game starts, ship spawns bottom-center, moves, auto-fires — identical to before.
- Taking enough hits triggers Game Over exactly as before.
- 0 console errors.

- [ ] **Step 8: Commit**

```bash
git add src/game.js
git commit -m "refactor(coop): hold player in CoopRoster behind a getter; add mode field"
```

---

## Self-Review

**1. Spec coverage (Phase 1B scope):** engine refactor to `players[]`/modes with solo unchanged → Task 1 (roster) + Task 2 (wiring + `mode`). The "second ship / 2-player collisions/HUD/input" and multiplayer death semantics are explicitly Phase 1C (stated in Architecture + Global Constraints), not 1B. ✓

**2. Placeholder scan:** No TBD/TODO; every code step shows complete code or an exact command. Task 2 Step 7 is a manual browser verification (game.js is un-unit-testable without a canvas DOM) and is marked as controller-performed, not a vague "test it". ✓

**3. Type consistency:** `CoopRoster.setLocal/local/reset/isGameOver/aliveCount` defined in Task 1 are used with identical names in Task 2 (`this.roster.reset()`, `this.roster.setLocal(...)`, `this.roster.local` via the getter). The `health > 0` aliveness rule matches the `Player.health` field the engine already uses. ✓

## Rollout note

Phase 1B delivers the structural roster + modes with solo identical. Phase 1C
(next) wires the netcode session + `RtdbTransport` + lobby and adds the second
(remote) player — at which point the four death-collision sites change from
"local player dead → game over" to "all players dead → `this.roster.isGameOver()`",
and the host runs collisions for both ships.
