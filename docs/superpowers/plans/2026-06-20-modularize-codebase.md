# Modularize Alien Invaders Codebase — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the two monolithic files (`app.js` 4,701 lines, `style.css` 4,982 lines) into small ES modules and logical CSS files, with **identical** runtime behavior.

**Architecture:** Native ES modules, no build step. `index.html` loads `<script type="module" src="src/main.js">` and a set of `<link>`ed CSS files. Each class/manager/entity moves verbatim into its own file with `export`; consumers add `import`. The `Game` class moves intact (no internal decomposition).

**Tech Stack:** Vanilla JS (ES2015+ classes/modules), HTML5 Canvas, Web Audio API, Vibration API, Firebase RTDB (compat SDK via CDN), GitHub Pages.

## Global Constraints

- **Behavior-preserving only.** Code is moved verbatim; the ONLY edits are added `export`/`import` lines and (where noted) `window.game`. No logic, naming, or value changes.
- **No build step.** Native ES modules served over http(s). No npm/bundler.
- **Zero console errors at every step.** This is the pass/fail gate (no unit tests exist).
- **Firebase loads first.** The Firebase CDN `<script>` tags stay in `index.html` *before* the module script so `window.firebase` exists when `LeaderboardManager` runs.
- **`window.game` stays global.** `index.html`'s inline `onclick="...game.startGame()..."` (story screen) needs it once `app.js`/`main.js` becomes a module.
- **CSS cascade order preserved:** base → screens → hud → leaderboard → gallery → controls → responsive.
- **Canonical source = `origin/main`.** All work happens on a branch off `origin/main`; final deploy pushes to `main`.
- **Local testing requires a static server** (`python -m http.server`); `file://` will not load modules.

## Module export/import map (the interface contract)

| File | Exports | Imports |
|---|---|---|
| `src/config.js` | `GAME_SETTINGS`, `DIFFICULTY_CONFIG`, `generateProgressiveDifficulty`, `PROGRESSIVE_DIFFICULTY`, `CONFIG`, `WAVE_CONFIG`, `SHADOW_OPTIMIZATION` | — |
| `src/utils.js` | `randomRange`, `distance`, `GradientCache` | — |
| `src/entities/Particle.js` | `Particle` | `randomRange` |
| `src/entities/Shockwave.js` | `Shockwave` | — |
| `src/entities/FloatingText.js` | `FloatingText` | — |
| `src/entities/Star.js` | `Star` | — |
| `src/entities/BonusPickup.js` | `BonusPickup` | `CONFIG` *(verify: only if referenced)* |
| `src/entities/Bullet.js` | `Bullet` | `CONFIG` *(verify)* |
| `src/entities/HomingBullet.js` | `HomingBullet` | `CONFIG` *(verify)* |
| `src/entities/Player.js` | `Player` | `CONFIG`, `Bullet` |
| `src/entities/Enemy.js` | `Enemy` | `CONFIG`, `DIFFICULTY_CONFIG`, `GAME_SETTINGS`, `randomRange`, `Bullet` |
| `src/entities/Boss.js` | `Boss` | `CONFIG`, `DIFFICULTY_CONFIG`, `GAME_SETTINGS`, `Bullet`, `HomingBullet` |
| `src/managers/LeaderboardManager.js` | `LeaderboardManager` | — (uses `window.firebase`) |
| `src/managers/SoundManager.js` | `SoundManager` | — |
| `src/managers/VibrationManager.js` | `VibrationManager` | — |
| `src/managers/MusicManager.js` | `MusicManager` | — |
| `src/gallery.js` | `GALLERY_ITEMS`, `GalleryManager` | — |
| `src/game.js` | `Game` | config(all), utils(all), all managers, all entities, `GalleryManager` |
| `src/main.js` | — | `Game` |

> The "verify" notes: after moving, the browser console reports any `ReferenceError: X is not defined`. Add `import { X } from '...'` for each such name. The map above is the expected set; the console is the source of truth.

## Source line ranges in current `app.js` (for verbatim moves)

| Lines | Construct | Destination |
|---|---|---|
| 2–239 | GAME_SETTINGS, DIFFICULTY_CONFIG, generateProgressiveDifficulty, PROGRESSIVE_DIFFICULTY, CONFIG, WAVE_CONFIG, SHADOW_OPTIMIZATION | `src/config.js` |
| 240–362 | LeaderboardManager | `src/managers/LeaderboardManager.js` |
| 363–580 | SoundManager | `src/managers/SoundManager.js` |
| 581–656 | VibrationManager | `src/managers/VibrationManager.js` |
| 657–792 | MusicManager | `src/managers/MusicManager.js` |
| 793–880 | BonusPickup | `src/entities/BonusPickup.js` |
| 881–889 | randomRange, distance | `src/utils.js` |
| 890–953 | Particle | `src/entities/Particle.js` |
| 954–986 | Shockwave | `src/entities/Shockwave.js` |
| 987–1022 | FloatingText | `src/entities/FloatingText.js` |
| 1023–1203 | Bullet | `src/entities/Bullet.js` |
| 1204–1281 | HomingBullet | `src/entities/HomingBullet.js` |
| 1282–1575 | Boss | `src/entities/Boss.js` |
| 1576–1774 | Player | `src/entities/Player.js` |
| 1775–2242 | Enemy | `src/entities/Enemy.js` |
| 2243–2275 | Star | `src/entities/Star.js` |
| 2276–2310 | GradientCache | `src/utils.js` |
| 2311–2493 | GALLERY_ITEMS, GalleryManager | `src/gallery.js` |
| 2494–4695 | Game | `src/game.js` |
| 4696–end | `let game`, window load bootstrap | `src/main.js` |

> Line numbers shift as code is removed. Re-locate each construct by its `class`/`const` name at execution time; the ranges are a guide, the names are authoritative.

---

## Task 0: Worktree, baseline capture, and folders

**Files:**
- Create: `css/` (dir), `src/`, `src/entities/`, `src/managers/` (dirs)

**Interfaces:**
- Produces: an isolated worktree on a branch off `origin/main`; a recorded baseline of correct behavior to compare every later step against.

- [ ] **Step 1: Create the working branch off the canonical source**

```bash
git fetch origin main
git worktree add -b modularize-game ../alieninvaders-modularize origin/main
cd ../alieninvaders-modularize
```

- [ ] **Step 2: Start a local static server (leave running)**

```bash
python -m http.server 8765
```

- [ ] **Step 3: Capture the baseline smoke test**

Load `http://localhost:8765/index.html` in a browser (Playwright). Record and SAVE as the reference:
- Console error count (expected: the current app's normal logs only — note any pre-existing warnings so they aren't mistaken for regressions).
- A screenshot of the start screen.
- A screenshot after starting the game (enemies + HUD visible).
- A screenshot of the open leaderboard modal.

- [ ] **Step 4: Create the folders**

```bash
mkdir -p css src/entities src/managers
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold css/ and src/ folders for modularization"
```

---

## Task 1: Split `style.css` into `css/*`

**Files:**
- Create: `css/base.css`, `css/screens.css`, `css/hud.css`, `css/leaderboard.css`, `css/gallery.css`, `css/controls.css`, `css/responsive.css`
- Modify: `index.html` (the single `<link rel="stylesheet" href="style.css">` → seven `<link>`s)
- Delete: `style.css`

**Interfaces:**
- Produces: identical computed styles via seven cascade-ordered files.

- [ ] **Step 1: Carve `style.css` into the seven files, in order**

Move each block of rules verbatim (cut, don't rewrite) into:
1. `base.css` — `:root` variables, reset, fonts, `body`, `#game-container`, `#game-canvas`.
2. `screens.css` — `.screen`, credits/story/start/settings/game-over/pause, `.btn*`, forms.
3. `hud.css` — `#hud`, `.hud-*`, `.boss-hud*`, `.lives*`, `.super-weapon*`, `.difficulty*`, `#active-bonuses`, `.bonus*`.
4. `leaderboard.css` — `.modal*`, `.leaderboard*`, `.score-entry-form`, `#player-name-input`, `#view-leaderboard-btn`.
5. `gallery.css` — `.gallery*`, `.lightbox*`.
6. `controls.css` — `#touch-controls`, `#joystick*`, `#super-weapon-*`, `.music-toggle-btn`.
7. `responsive.css` — every `@media` block (keep them last to preserve override order).

Rule: a selector appears in exactly one file. Keep the original top-to-bottom order within and across files (base first, responsive last).

- [ ] **Step 2: Replace the stylesheet link in `index.html`**

Replace `<link rel="stylesheet" href="style.css">` with:

```html
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/screens.css">
<link rel="stylesheet" href="css/hud.css">
<link rel="stylesheet" href="css/leaderboard.css">
<link rel="stylesheet" href="css/gallery.css">
<link rel="stylesheet" href="css/controls.css">
<link rel="stylesheet" href="css/responsive.css">
```

- [ ] **Step 3: Delete the old file**

```bash
git rm style.css
```

- [ ] **Step 4: Verify visuals match baseline**

Reload `http://localhost:8765/index.html?cb=1`. Compare against Task 0 screenshots: start screen, in-game HUD, leaderboard modal (incl. scroll), touch controls on a 390px viewport. They must look identical. Confirm zero new console errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: split style.css into logical css/ files"
```

---

## Task 2: Extract `config.js` + `utils.js`; convert entry to a module

**Files:**
- Create: `src/config.js`, `src/utils.js`
- Modify: `app.js` (remove moved code; add imports; add `window.game`), `index.html` (`<script src="app.js">` → module)

**Interfaces:**
- Produces: `config.js` and `utils.js` per the export/import map. `app.js` becomes an ES module that imports them.

- [ ] **Step 1: Create `src/config.js`**

Move `app.js` lines 2–239 (all of `GAME_SETTINGS`, `DIFFICULTY_CONFIG`, `generateProgressiveDifficulty`, `PROGRESSIVE_DIFFICULTY`, `CONFIG`, `WAVE_CONFIG`, `SHADOW_OPTIMIZATION`) verbatim into `src/config.js`. Prefix each top-level declaration with `export`:

Keep every definition exactly as it is in `app.js` (same object/function bodies, same order) — the ONLY change is adding `export` in front of each top-level declaration:

```js
export const GAME_SETTINGS = { /* ...unchanged... */ };
export const DIFFICULTY_CONFIG = { /* ...unchanged... */ };
export function generateProgressiveDifficulty() { /* ...unchanged... */ }
export const PROGRESSIVE_DIFFICULTY = { /* ...unchanged (object literal as in app.js line ~101)... */ };
export const CONFIG = { /* ...unchanged... */ };
export const WAVE_CONFIG = { /* ...unchanged... */ };
export const SHADOW_OPTIMIZATION = { /* ...unchanged... */ };
```

- [ ] **Step 2: Create `src/utils.js`**

Move `randomRange`, `distance` (lines 881–889) and `GradientCache` (lines 2276–2310) verbatim into `src/utils.js`, each `export`ed:

```js
export function randomRange(min, max) { /* ... */ }
export function distance(x1, y1, x2, y2) { /* ... */ }
export class GradientCache { /* ... */ }
```

- [ ] **Step 3: Add imports at the top of `app.js` and remove the moved code**

Delete the moved blocks from `app.js`. Add at the very top of `app.js`:

```js
import { GAME_SETTINGS, DIFFICULTY_CONFIG, generateProgressiveDifficulty, PROGRESSIVE_DIFFICULTY, CONFIG, WAVE_CONFIG, SHADOW_OPTIMIZATION } from './src/config.js';
import { randomRange, distance, GradientCache } from './src/utils.js';
```

- [ ] **Step 4: Make the entry a module and keep `game` global**

In `index.html`, change `<script src="app.js"></script>` to:

```html
<script type="module" src="app.js"></script>
```

In `app.js`, where the bootstrap sets `game` (the `let game = null;` / `window load` handler near old line 4696), ensure the instance is exposed globally so the inline `onclick` in `index.html` works:

```js
window.game = game; // set immediately after `game = new Game(...)`
```

- [ ] **Step 5: Verify**

Reload `http://localhost:8765/index.html?cb=2`. Expect zero `ReferenceError`s. Start the game, open the story screen, click "Ξεκινήστε την Μάχη" (the inline `game.startGame()` link) — it must start the game. If the console reports an undefined name, add the matching `import`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: extract config.js and utils.js; load app.js as ES module"
```

---

## Task 3: Extract standalone entities (Particle, Shockwave, FloatingText, Star, BonusPickup)

**Files:**
- Create: `src/entities/Particle.js`, `src/entities/Shockwave.js`, `src/entities/FloatingText.js`, `src/entities/Star.js`, `src/entities/BonusPickup.js`
- Modify: `app.js`

**Interfaces:**
- Consumes: `randomRange` (Particle), `CONFIG` (BonusPickup if referenced).
- Produces: `Particle`, `Shockwave`, `FloatingText`, `Star`, `BonusPickup`.

- [ ] **Step 1: Create each entity file**

For each class, move its body verbatim into its file and add `export`:
- `Particle.js`: `import { randomRange } from '../utils.js';` then `export class Particle { ... }`.
- `Shockwave.js`: `export class Shockwave { ... }`.
- `FloatingText.js`: `export class FloatingText { ... }`.
- `Star.js`: `export class Star { ... }`.
- `BonusPickup.js`: `export class BonusPickup { ... }` (add `import { CONFIG } from '../config.js';` only if the class body references `CONFIG`).

- [ ] **Step 2: Remove the moved classes from `app.js` and import them**

Add to `app.js` imports:

```js
import { Particle } from './src/entities/Particle.js';
import { Shockwave } from './src/entities/Shockwave.js';
import { FloatingText } from './src/entities/FloatingText.js';
import { Star } from './src/entities/Star.js';
import { BonusPickup } from './src/entities/BonusPickup.js';
```

- [ ] **Step 3: Verify**

Reload `?cb=3`. Start a game, kill an enemy (particles + floating score text appear), trigger an explosion (shockwave), confirm the starfield scrolls and a power-up can spawn/be collected. Zero console errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: extract Particle, Shockwave, FloatingText, Star, BonusPickup"
```

---

## Task 4: Extract Bullet and HomingBullet

**Files:**
- Create: `src/entities/Bullet.js`, `src/entities/HomingBullet.js`
- Modify: `app.js`

**Interfaces:**
- Consumes: `CONFIG` (each, if referenced).
- Produces: `Bullet`, `HomingBullet` (independent classes — `HomingBullet` does NOT extend `Bullet`).

- [ ] **Step 1: Create the two files**

- `Bullet.js`: move `Bullet` verbatim; `export class Bullet { ... }`; add `import { CONFIG } from '../config.js';` if referenced.
- `HomingBullet.js`: move `HomingBullet` verbatim; `export class HomingBullet { ... }`; add `import { CONFIG } from '../config.js';` if referenced.

- [ ] **Step 2: Remove from `app.js` and import**

```js
import { Bullet } from './src/entities/Bullet.js';
import { HomingBullet } from './src/entities/HomingBullet.js';
```

- [ ] **Step 3: Verify**

Reload `?cb=4`. Player auto-fire produces bullets that hit enemies. Reach a boss (or temporarily lower a boss wave for testing, then revert) to confirm homing bullets in phase 2. Zero console errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: extract Bullet and HomingBullet"
```

---

## Task 5: Extract Player, Enemy, Boss

**Files:**
- Create: `src/entities/Player.js`, `src/entities/Enemy.js`, `src/entities/Boss.js`
- Modify: `app.js`

**Interfaces:**
- Consumes: `Bullet` (all three), `HomingBullet` (Boss), `CONFIG` (all), `DIFFICULTY_CONFIG` + `GAME_SETTINGS` (Enemy, Boss), `randomRange` (Enemy).
- Produces: `Player`, `Enemy`, `Boss`.

- [ ] **Step 1: Create the three files with their imports**

`Player.js`:
```js
import { CONFIG } from '../config.js';
import { Bullet } from './Bullet.js';
export class Player { /* moved verbatim */ }
```
`Enemy.js`:
```js
import { CONFIG, DIFFICULTY_CONFIG, GAME_SETTINGS } from '../config.js';
import { randomRange } from '../utils.js';
import { Bullet } from './Bullet.js';
export class Enemy { /* moved verbatim */ }
```
`Boss.js`:
```js
import { CONFIG, DIFFICULTY_CONFIG, GAME_SETTINGS } from '../config.js';
import { Bullet } from './Bullet.js';
import { HomingBullet } from './HomingBullet.js';
export class Boss { /* moved verbatim */ }
```
(Drop any import a class does not actually reference; add any the console reports missing.)

- [ ] **Step 2: Remove from `app.js` and import**

```js
import { Player } from './src/entities/Player.js';
import { Enemy } from './src/entities/Enemy.js';
import { Boss } from './src/entities/Boss.js';
```

- [ ] **Step 3: Verify**

Reload `?cb=5`. Full play: player moves/shoots, multiple enemy types spawn and fire, a boss spawns on a boss wave with health bar, phases, and drops. Zero console errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: extract Player, Enemy, Boss"
```

---

## Task 6: Extract the four managers

**Files:**
- Create: `src/managers/LeaderboardManager.js`, `src/managers/SoundManager.js`, `src/managers/VibrationManager.js`, `src/managers/MusicManager.js`
- Modify: `app.js`

**Interfaces:**
- Consumes: nothing from other modules (LeaderboardManager uses the global `window.firebase`).
- Produces: `LeaderboardManager`, `SoundManager`, `VibrationManager`, `MusicManager`.

- [ ] **Step 1: Create each manager file**

Move each class verbatim; `export class <Name> { ... }`. No cross-module imports expected. Confirm `LeaderboardManager` still reads `window.firebase`/`firebase` (the CDN global) — do not import Firebase as a module.

- [ ] **Step 2: Remove from `app.js` and import**

```js
import { LeaderboardManager } from './src/managers/LeaderboardManager.js';
import { SoundManager } from './src/managers/SoundManager.js';
import { VibrationManager } from './src/managers/VibrationManager.js';
import { MusicManager } from './src/managers/MusicManager.js';
```

- [ ] **Step 3: Verify**

Reload `?cb=6`. Sound plays on shoot/explosion, music toggle works, vibration calls fire on mobile viewport (no error if unsupported), and the leaderboard modal loads scores from Firebase (top 50) and accepts a name submission. Zero console errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: extract Sound, Music, Vibration, Leaderboard managers"
```

---

## Task 7: Extract the gallery

**Files:**
- Create: `src/gallery.js`
- Modify: `app.js`

**Interfaces:**
- Produces: `GALLERY_ITEMS`, `GalleryManager`.

- [ ] **Step 1: Create `src/gallery.js`**

Move `GALLERY_ITEMS` and `GalleryManager` verbatim; `export const GALLERY_ITEMS = [...]` and `export class GalleryManager { ... }`.

- [ ] **Step 2: Remove from `app.js` and import**

```js
import { GALLERY_ITEMS, GalleryManager } from './src/gallery.js';
```

- [ ] **Step 3: Verify**

Reload `?cb=7`. Open the "Artwork" button → gallery grid renders; click a thumbnail → lightbox opens with the image and title; close works. Zero console errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: extract gallery (GALLERY_ITEMS, GalleryManager)"
```

---

## Task 8: Move `Game` to `game.js`, bootstrap to `main.js`, delete `app.js`

**Files:**
- Create: `src/game.js`, `src/main.js`
- Modify: `index.html`
- Delete: `app.js`

**Interfaces:**
- Consumes: everything (config, utils, managers, entities, gallery).
- Produces: `Game` (from `game.js`); `main.js` is the entry point that constructs it.

- [ ] **Step 1: Create `src/game.js`**

Move the `Game` class verbatim into `src/game.js`. At the top, move ALL the `import` lines that are currently in `app.js` (config, utils, managers, entities, gallery) — adjusting relative paths to be from `src/` (e.g. `./config.js`, `./utils.js`, `./entities/Player.js`, `./managers/SoundManager.js`, `./gallery.js`). Add `export class Game { ... }`.

- [ ] **Step 2: Create `src/main.js`**

Move the bootstrap (the `let game` declaration + `window.addEventListener('load', ...)` handler) here:

```js
import { Game } from './game.js';

let game = null;
window.addEventListener('load', () => {
    game = new Game();          // use the exact original constructor args
    window.game = game;         // keep the inline onclick working
});
```
Match the original bootstrap body exactly (same constructor arguments and any original setup calls).

- [ ] **Step 3: Point `index.html` at the new entry and delete `app.js`**

In `index.html`: `<script type="module" src="app.js"></script>` → `<script type="module" src="src/main.js"></script>`.

```bash
git rm app.js
```

- [ ] **Step 4: Full verification against the Task 0 baseline**

Reload `http://localhost:8765/index.html?cb=8` and run the complete smoke test:
- Loads with zero console errors.
- Start screen → start; movement (arrows/WASD), auto-fire, enemy variety, pickups + active-bonus HUD, pause/resume (`P`), super weapon when charged.
- Boss wave: banner, health bar, phase 2, threshold drops, defeat drops.
- Game over → leaderboard modal renders top-50, **scrolls**, name submit works, share button works.
- Story screen inline "play" link starts the game (`window.game`).
- Artwork gallery + lightbox.
- 390px viewport: joystick + super-weapon button, touch move/fire.
Compare visuals to the Task 0 screenshots — must match.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move Game to src/game.js, bootstrap to src/main.js, delete app.js"
```

---

## Task 9: Deploy to live and consolidate source of truth

**Files:** none (git + verification only)

**Interfaces:**
- Produces: the modular build live on `main`; local working copy aligned to it.

- [ ] **Step 1: Final pre-deploy verification on a fresh load**

Hard-reload (`?cb=final`) and re-run the Task 8 smoke checklist once more. All green.

- [ ] **Step 2: Push the branch to `main`**

```bash
git push origin modularize-game:main
```

- [ ] **Step 3: Verify the live site after GitHub Pages rebuilds (~1–2 min)**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://konskall.github.io/alieninvaders/src/main.js   # expect 200
curl -s -o /dev/null -w "%{http_code}\n" https://konskall.github.io/alieninvaders/css/base.css   # expect 200
```
Then load `https://konskall.github.io/alieninvaders/` and confirm it plays (zero console errors, leaderboard scrolls).

- [ ] **Step 4: Align the local working copy to the canonical source**

From the user's primary working directory, fast-forward/reset the tracked files to match `origin/main` so local stops diverging. (Confirm with the user before discarding any local-only edits.)

- [ ] **Step 5: Clean up the worktree**

```bash
git worktree remove ../alieninvaders-modularize
git branch -d modularize-game
```

---

## Notes for the executor

- **No automated tests exist.** "Verify" steps are browser smoke tests via a local static server + Playwright. Treat *any* new console error as a failing test — stop and fix before committing.
- **Moves are verbatim.** If you find yourself rewriting logic, stop — that is out of scope.
- **Imports are driven by the console.** The export/import map is the expected wiring; a `ReferenceError` tells you exactly which `import` is missing.
- **Keep each task runnable.** The game must play at the end of every task, not just at the end.
