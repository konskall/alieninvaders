# Screen Flow & Navigation Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the game's screens into a coherent flow centered on a Main Menu hub — remove the forced Settings gate, give Pause and Game Over real navigation, move name-entry into Game Over, and make the leaderboard view-only.

**Architecture:** Vanilla-JS browser game with no build step. Screens are `<div class="screen">` blocks in `index.html` toggled via the `hidden` class. A single `Game` class in `src/game.js` owns a `this.state` string and all screen transitions. This plan repurposes the existing `start-screen` as the hub and rewires `Game`'s navigation methods; it adds no new screen elements (only buttons and one inline form).

**Tech Stack:** ES modules (no bundler), HTML5 Canvas, Firebase Realtime DB (leaderboard), GitHub Pages. Verification via `node --check`, `grep`, and Playwright against `python -m http.server`.

## Global Constraints

- **Greek** for all customer-facing button labels and copy; technical identifiers in English.
- **No build step** — plain ES modules loaded via `<script type="module">`. Do not introduce bundlers, transpilers, or new dependencies.
- **Files are UTF-8 (no BOM)** containing emoji/Greek. Edit only with the Write/Edit tools — never via PowerShell text round-trips (corrupts encoding).
- **Flow/navigation only.** Do not change gameplay, balance, art, story prose, or the visual design system. The only copy changes allowed are the button labels this plan specifies.
- **`state` values** are exactly: `'credits'`, `'menu'`, `'settings'`, `'story'`, `'playing'`, `'paused'`, `'gameOver'`.
- **Work on branch `flow-reorg`** (already created). Do not commit to `main`.

---

## File Structure

- `index.html` — screen markup. Modified: `start-screen` (hub buttons), `settings-screen` (button label), `story-screen` (button label), `pause-screen` (button menu), `game-over-screen` (inline name-entry + menu button), `leaderboard-modal` (remove footer form).
- `src/game.js` — the `Game` class: all navigation/state logic. Modified: constructor, `loadSettings`, credits transition, settings return, new `showMenu`/`openSettings`/`returnFromSettings`/`setupGameOverScoreEntry`, button wiring in `setupEventListeners`, `gameOver`, `showLeaderboardModal`, `startGame` (clear pause screen), `goToSettings`.
- `src/gallery.js` — `showGallery`/`hideGallery` already toggle `start-screen` ↔ `gallery-screen`; correct as-is now that `start-screen` is the hub. **No change.**

---

### Task 1: Core hub navigation (Credits → Menu, opener-aware Settings)

Make `start-screen` the Main Menu hub. Credits advances to the menu (not Settings). Settings is opened from the hub and returns to whatever opened it. Relabel the Settings and Story action buttons.

**Files:**
- Modify: `index.html` (start-screen buttons, settings button label, story button label)
- Modify: `src/game.js` (constructor, `loadSettings`, credits transition, new `showMenu`/`openSettings`/`returnFromSettings`, `startGame` pause-clear, `goToSettings`)

**Interfaces:**
- Produces:
  - `showMenu()` → void — hides every non-menu screen/overlay, stops music, resets joystick, shows `start-screen`, sets `state='menu'`.
  - `openSettings(opener)` → void — `opener ∈ {'menu','paused','gameOver'}`; stores `this.settingsOpener`, hides the three opener screens, shows `settings-screen`, sets `state='settings'`.
  - `returnFromSettings()` → void — hides `settings-screen`, shows the screen named by `this.settingsOpener` (menu via `showMenu()`, else pause/game-over), restores that state.
  - `transitionFromCreditsToMenu()` → void — replaces `transitionFromCreditsToSettings()`.
  - `this.settingsOpener` (string, default `'menu'`).

- [ ] **Step 1: Repurpose `start-screen` markup as the hub.** In `index.html`, replace the whole `start-screen` block (currently lines ~193–218) with this. Note: `story-btn` and `gallery-btn` move OUT of the instructions div to sit with the other menu buttons, and two new buttons are added.

```html
        <!-- Start Screen / Main Menu hub -->
        <div id="start-screen" class="screen hidden">
            <div class="screen-content">
                <h1>🛸 Η Μάχη Ξεκινά ⚔️</h1>
                <p class="subtitle">Υπερασπίσου το Γαλαξία!</p>
                <div class="instructions" id="game-instructions">
                    <h3>Στοιχεία Ελέγχου:</h3>
                    <div id="desktop-instructions">
                        <p><strong>Κίνηση:</strong> Βέλη ή WASD</p>
                        <p><strong>Σούπερ Όπλο:</strong> S (όταν είναι έτοιμο)</p>
                        <p><strong>Παύση:</strong> P</p>
                        <p class="note" id="auto-fire-note">Tip: Αυτόματα πυρά πάντα ενεργά!</p>
                    </div>
                    <div id="mobile-instructions" class="hidden">
                        <p><strong>Κίνηση:</strong> Σύρε το δάχτυλο σου οπουδήποτε ή χρησιμοποίησε το joystick</p>
                        <p><strong>Σούπερ Όπλο:</strong> Πάτησε το κουμπί 💥</p>
                        <p class="note">Tip: Αυτόματα πυρά πάντα ενεργά!</p>
                    </div>
                </div>
                <button class="btn btn--primary btn--lg" id="start-btn">▶ Έναρξη Παιχνιδιού</button>
                <button class="btn btn--primary btn--lg" id="story-btn" style="margin-top: 12px; border-color: #8b5cf6;">📖 Το Χρονικό</button>
                <button class="btn btn--primary btn--lg" id="gallery-btn" style="margin-top: 12px;">🖼 Artwork</button>
                <button class="btn btn--primary btn--lg" id="menu-leaderboard-btn" style="margin-top: 12px;">🏆 Top Players</button>
                <button class="btn btn--primary btn--lg" id="menu-settings-btn" style="margin-top: 12px;">⚙ Ρυθμίσεις</button>
            </div>
        </div>
```

- [ ] **Step 2: Relabel the Settings save button.** In `index.html`, change the settings button (currently line ~189):

```html
                <button class="btn btn--primary btn--lg" id="settings-start-btn">💾 Αποθήκευση & Πίσω</button>
```

- [ ] **Step 3: Relabel the Story action button.** In `index.html`, change the story button (currently line ~108):

```html
            <button class="btn btn--primary btn--lg" id="story-start-btn">▶ Παίξε</button>
```

- [ ] **Step 4: Add `this.settingsOpener` to the constructor.** In `src/game.js`, immediately after the `this.state = 'credits';` line (~103), add:

```js
        this.state = 'credits';
        this.settingsOpener = 'menu';
```

- [ ] **Step 5: Point credits at the menu.** In `src/game.js` `loadSettings()`, update the two callers (the 10s timeout ~152 and the credits click handler ~158). Replace both occurrences of `this.transitionFromCreditsToSettings();` with `this.transitionFromCreditsToMenu();`. The surrounding code becomes:

```js
        // Show credits splash screen, then auto-transition to the main menu
        setTimeout(() => {
            this.transitionFromCreditsToMenu();
        }, 10000);

        // Allow click to skip credits
        const creditsScreen = document.getElementById('credits-screen');
        creditsScreen.addEventListener('click', () => {
            if (this.state === 'credits') {
                this.transitionFromCreditsToMenu();
            }
        });
```

- [ ] **Step 6: Make the Settings save button return to its opener.** In `src/game.js` `loadSettings()`, the `settings-start-btn` click handler ends (~181–182) with:

```js
            document.getElementById('settings-screen').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
```

Replace those two lines with:

```js
            this.returnFromSettings();
```

- [ ] **Step 7: Replace the credits→settings method with credits→menu + add hub helpers.** In `src/game.js`, replace the whole `transitionFromCreditsToSettings()` method (~190–196) with these four methods:

```js
    transitionFromCreditsToMenu() {
        if (this.state !== 'credits') return;

        document.getElementById('credits-screen').classList.add('hidden');
        this.showMenu();
    }

    showMenu() {
        this.state = 'menu';
        ['game-over-screen', 'pause-screen', 'settings-screen', 'story-screen',
         'gallery-screen', 'hud', 'active-bonuses', 'touch-controls', 'leaderboard-modal']
            .forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('hidden');
            });
        const shareDialog = document.getElementById('share-dialog');
        if (shareDialog) shareDialog.remove();
        this.musicManager.stop();
        this.resetJoystick();
        document.getElementById('start-screen').classList.remove('hidden');
    }

    openSettings(opener) {
        this.settingsOpener = opener;
        ['start-screen', 'pause-screen', 'game-over-screen'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });
        document.getElementById('settings-screen').classList.remove('hidden');
        this.state = 'settings';
    }

    returnFromSettings() {
        document.getElementById('settings-screen').classList.add('hidden');
        if (this.settingsOpener === 'paused') {
            document.getElementById('pause-screen').classList.remove('hidden');
            this.state = 'paused';
        } else if (this.settingsOpener === 'gameOver') {
            document.getElementById('game-over-screen').classList.remove('hidden');
            this.state = 'gameOver';
        } else {
            this.showMenu();
        }
    }
```

- [ ] **Step 8: Clear the pause screen on (re)start.** In `src/game.js` `startGame()`, the block that hides screens (~730–731) is:

```js
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
```

Replace with (adds the pause screen):

```js
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('pause-screen').classList.add('hidden');
```

- [ ] **Step 9: Route the game-over Settings button through `openSettings`.** In `src/game.js`, replace the whole `goToSettings()` method (~774–779) with:

```js
    goToSettings() {
        this.openSettings('gameOver');
    }
```

- [ ] **Step 10: Wire the two new hub buttons.** In `src/game.js` `setupEventListeners()`, just after the existing `view-leaderboard-btn` listener (~387–389), add:

```js
        document.getElementById('menu-leaderboard-btn').addEventListener('click', () => {
            this.showLeaderboardModal();
        });
        document.getElementById('menu-settings-btn').addEventListener('click', () => {
            this.openSettings('menu');
        });
```

- [ ] **Step 11: Syntax check.**

Run: `node --check src/game.js`
Expected: no output, exit code 0.

- [ ] **Step 12: Static wiring assertions.**

Run: `grep -c "transitionFromCreditsToSettings" src/game.js`
Expected: `0` (the old method name is fully gone).

Run: `grep -nE "menu-leaderboard-btn|menu-settings-btn|💾 Αποθήκευση|▶ Παίξε" index.html`
Expected: 4 matching lines (two new buttons, settings label, story label).

- [ ] **Step 13: Commit.**

```bash
git add index.html src/game.js
git commit -m "feat(flow): credits opens main-menu hub; opener-aware settings"
```

---

### Task 2: Pause menu

Give the pause screen four working buttons. The `P` key already toggles pause/resume; this adds clickable navigation.

**Files:**
- Modify: `index.html` (`pause-screen` buttons)
- Modify: `src/game.js` (button wiring in `setupEventListeners`)

**Interfaces:**
- Consumes: `resumeGame()`, `restartGame()`, `openSettings('paused')`, `showMenu()` (all exist after Task 1).

- [ ] **Step 1: Add the pause buttons.** In `index.html`, replace the whole `pause-screen` block (currently lines ~236–242) with:

```html
        <!-- Pause Screen -->
        <div id="pause-screen" class="screen hidden">
            <div class="screen-content">
                <h1>Παύση</h1>
                <p class="subtitle">Πάτησε P για συνέχεια</p>
                <button class="btn btn--primary btn--lg" id="resume-btn">▶ Συνέχεια</button>
                <button class="btn btn--primary btn--lg" id="pause-restart-btn" style="margin-top: 12px;">🔄 Επανεκκίνηση</button>
                <button class="btn btn--primary btn--lg" id="pause-settings-btn" style="margin-top: 12px;">⚙ Ρυθμίσεις</button>
                <button class="btn btn--primary btn--lg" id="pause-menu-btn" style="margin-top: 12px;">🏠 Κεντρικό Μενού</button>
            </div>
        </div>
```

- [ ] **Step 2: Wire the pause buttons.** In `src/game.js` `setupEventListeners()`, just after the two hub-button listeners added in Task 1 Step 10, add:

```js
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.resumeGame();
        });
        document.getElementById('pause-restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
        document.getElementById('pause-settings-btn').addEventListener('click', () => {
            this.openSettings('paused');
        });
        document.getElementById('pause-menu-btn').addEventListener('click', () => {
            this.showMenu();
        });
```

(`restartGame()` → `startGame()` now hides `pause-screen` via Task 1 Step 8.)

- [ ] **Step 3: Syntax check.**

Run: `node --check src/game.js`
Expected: no output, exit code 0.

- [ ] **Step 4: Static wiring assertions.**

Run: `grep -cE "resume-btn|pause-restart-btn|pause-settings-btn|pause-menu-btn" src/game.js`
Expected: `4`.

Run: `grep -cE "resume-btn|pause-restart-btn|pause-settings-btn|pause-menu-btn" index.html`
Expected: `4`.

- [ ] **Step 5: Commit.**

```bash
git add index.html src/game.js
git commit -m "feat(flow): pause screen gets resume/restart/settings/menu buttons"
```

---

### Task 3: Game Over reorganization + inline name-entry

Add a "Κεντρικό Μενού" button and an inline name-entry form that appears **only** when the score qualifies for the top 50. Saving writes to the leaderboard once.

**Files:**
- Modify: `index.html` (`game-over-screen`: inline form + menu button + button labels)
- Modify: `src/game.js` (`gameOver`, new `setupGameOverScoreEntry`, menu-button wiring)

**Interfaces:**
- Consumes: `this.leaderboardManager.isTopScore(score)` → boolean (exists in `LeaderboardManager`); `this.leaderboardManager.addScore(name, score, level)`; `this.progressiveDifficulty.currentLevel`; `showMenu()`, `openSettings('gameOver')` (Task 1).
- Produces: `setupGameOverScoreEntry()` → void — toggles `#game-over-score-form` visibility by `isTopScore(this.score)` and wires its one-shot submit.

- [ ] **Step 1: Add the inline form, menu button, and labels.** In `index.html`, replace the whole `game-over-screen` block (currently lines ~220–234) with:

```html
        <!-- Game Over Screen -->
        <div id="game-over-screen" class="screen hidden">
            <div class="screen-content">
                <h1>Game Over</h1>
                <div class="final-score-container">
                    <p class="score-label">Τελική Βαθμολογία:</p>
                    <p class="final-score" id="final-score">0</p>
                    <button id="view-leaderboard-btn" class="btn btn--primary btn--lg btn--full-width">Top Players 👑</button>
                </div>

                <form id="game-over-score-form" class="score-entry-form hidden" style="margin: 12px 0;">
                    <input
                        type="text"
                        id="game-over-name-input"
                        placeholder="🏆 Μπήκες στο Top 50! Το όνομά σου..."
                        maxlength="20"
                        class="form-control"
                    >
                    <button type="submit" class="btn btn--primary">Αποθήκευση Σκορ</button>
                </form>

                <button class="btn btn--primary btn--lg" id="restart-btn">▶ Νέο Παιχνίδι</button>
                <button class="btn btn--primary btn--lg" id="game-over-settings-btn" style="margin-top: 16px;">⚙ Ρυθμίσεις</button>
                <button class="btn btn--primary btn--lg" id="share-score-btn" style="margin-top: 16px;">📤 Κοινοποίηση Σκορ</button>
                <button class="btn btn--primary btn--lg" id="game-over-menu-btn" style="margin-top: 16px;">🏠 Κεντρικό Μενού</button>
            </div>
        </div>
```

- [ ] **Step 2: Trigger the name-entry on game over.** In `src/game.js` `gameOver()`, the line that sets the score (~894) is:

```js
    document.getElementById('final-score').textContent = this.score;
```

Add a call right after it:

```js
    document.getElementById('final-score').textContent = this.score;
    this.setupGameOverScoreEntry();
```

- [ ] **Step 3: Add `setupGameOverScoreEntry()`.** In `src/game.js`, add this method immediately after the `gameOver()` method (i.e. after its closing `}` at ~900):

```js
    setupGameOverScoreEntry() {
        const form = document.getElementById('game-over-score-form');
        const input = document.getElementById('game-over-name-input');
        if (!form || !input) return;

        const qualifies = this.leaderboardManager.isTopScore(this.score);
        form.classList.toggle('hidden', !qualifies);
        if (!qualifies) return;

        input.value = '';
        input.disabled = false;
        const btn = form.querySelector('button');
        btn.textContent = 'Αποθήκευση Σκορ';
        let saved = false;

        form.onsubmit = (e) => {
            e.preventDefault();
            if (saved) return;
            const name = input.value.trim();
            if (!name) {
                alert('Παρακαλώ εισάγετε ένα όνομα!');
                return;
            }
            this.leaderboardManager.addScore(name, this.score, this.progressiveDifficulty.currentLevel);
            saved = true;
            input.disabled = true;
            btn.textContent = '✓ Αποθηκεύτηκε!';
        };
    }
```

- [ ] **Step 4: Wire the Game Over menu button.** In `src/game.js` `setupEventListeners()`, after the pause-button listeners (Task 2 Step 2), add:

```js
        document.getElementById('game-over-menu-btn').addEventListener('click', () => {
            this.showMenu();
        });
```

(The existing `game-over-settings-btn` listener already calls `goToSettings()`, which Task 1 routed through `openSettings('gameOver')`.)

- [ ] **Step 5: Syntax check.**

Run: `node --check src/game.js`
Expected: no output, exit code 0.

- [ ] **Step 6: Static assertions.**

Run: `grep -cE "game-over-score-form|game-over-name-input|game-over-menu-btn" index.html`
Expected: `3`.

Run: `grep -c "setupGameOverScoreEntry" src/game.js`
Expected: `2` (definition + call site).

- [ ] **Step 7: Commit.**

```bash
git add index.html src/game.js
git commit -m "feat(flow): Game Over menu button + top-50 inline name-entry"
```

---

### Task 4: View-only leaderboard modal

Remove the leaderboard modal's footer name-entry form (name-entry now lives in Game Over) and simplify `showLeaderboardModal()` to a view-only display.

**Files:**
- Modify: `index.html` (remove `.modal-footer` from `leaderboard-modal`)
- Modify: `src/game.js` (rewrite `showLeaderboardModal`)

**Interfaces:**
- Consumes: `updateLeaderboardDisplay()` (unchanged, exists).
- Produces: `showLeaderboardModal()` → void — shows the modal, refreshes the list, wires close-button and backdrop-click; no form handling.

- [ ] **Step 1: Remove the modal footer form.** In `index.html`, delete the entire `.modal-footer` block from `leaderboard-modal` (currently lines ~329–340):

```html
        <div class="modal-footer">
            <form id="score-entry-form" class="score-entry-form">
                <input 
                    type="text" 
                    id="player-name-input" 
                    placeholder="Εισάγετε το όνομά σας..." 
                    maxlength="20"
                    class="form-control"
                >
                <button type="submit" class="btn btn--primary">Αποθήκευση Σκορ</button>
            </form>
        </div>
```

After deletion, the modal ends:

```html
        <div class="modal-body">
            <div id="leaderboard-display">
                <div id="leaderboard-list" class="leaderboard-list"></div>
            </div>
        </div>
    </div>
</div>
```

- [ ] **Step 2: Rewrite `showLeaderboardModal()` as view-only.** In `src/game.js`, replace the entire `showLeaderboardModal()` method (currently ~927–977, from `showLeaderboardModal() {` through its closing `}`) with:

```js
showLeaderboardModal() {
    const modal = document.getElementById('leaderboard-modal');
    modal.classList.remove('hidden');

    // Refresh the list with current scores (view-only — name entry lives in Game Over)
    this.updateLeaderboardDisplay();

    const closeBtn = modal.querySelector('.modal-close');
    const closeOnBackdrop = (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            modal.removeEventListener('click', closeOnBackdrop);
        }
    };
    if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');
    modal.addEventListener('click', closeOnBackdrop);
}
```

- [ ] **Step 3: Syntax check.**

Run: `node --check src/game.js`
Expected: no output, exit code 0.

- [ ] **Step 4: Confirm the removed IDs are fully gone.**

Run: `grep -cE "score-entry-form|player-name-input" index.html src/game.js`
Expected: `0` for both files (grep prints `index.html:0` and `src/game.js:0`).

- [ ] **Step 5: Commit.**

```bash
git add index.html src/game.js
git commit -m "feat(flow): leaderboard modal is view-only (name entry moved to Game Over)"
```

---

### Task 5: Full-flow browser verification + cleanup

Serve the game locally and drive every transition with Playwright, asserting screen visibility and zero console errors. Then remove the prototype scaffolding.

**Files:**
- No source changes (verification only). Delete: `flow-prototype.html`, `proto-menu.png`, `.playwright-mcp/`.

- [ ] **Step 1: Start a local server** from the repo root (background): `python -m http.server 8777`. Confirm `index.html` is served at `http://localhost:8777/`.

- [ ] **Step 2: Verify the launch + hub.** Navigate to `http://localhost:8777/`, click the credits screen, and confirm via evaluated JS that `start-screen` is visible and `settings-screen` is hidden, and the menu shows exactly five buttons (`start-btn`, `story-btn`, `gallery-btn`, `menu-leaderboard-btn`, `menu-settings-btn`).

Expected: start-screen visible; settings-screen hidden; all five button IDs present and visible.

- [ ] **Step 3: Verify Settings round-trips per opener.**
  - Menu → `menu-settings-btn` → settings visible; `settings-start-btn` → back to `start-screen`.
  - Start a game (`start-btn`), press `P` → pause; `pause-settings-btn` → settings; save → back to `pause-screen` (state `paused`); `resume-btn` → playing (player/enemies preserved — confirm `game.player` is still non-null and `game.state==='playing'`).
  - Trigger game over (`game.gameOver()` via evaluate), `game-over-settings-btn` → settings; save → back to `game-over-screen`.

Expected: each save returns to the correct opener with the correct `game.state`.

- [ ] **Step 4: Verify Story / Gallery / Pause / Game Over / Leaderboard.**
  - Story: `story-btn` → story; `✕` (`story-close-btn`) → menu; re-open, `story-start-btn` (▶ Παίξε) → playing.
  - Gallery: `gallery-btn` → gallery; `✕` (`gallery-close-btn`) → menu.
  - Pause: each of the four buttons behaves (resume→playing, restart→fresh playing, menu→`start-screen`).
  - Game Over name-entry: with `game.leaderboardManager.scores` emptied, `game.gameOver()` shows `#game-over-score-form` (qualifies); with 50 scores all higher than the current score, the form stays `hidden`.
  - Leaderboard modal: opens from `menu-leaderboard-btn` and `view-leaderboard-btn`; has **no** `#player-name-input`; closes via `.modal-close` and backdrop click.

Expected: every transition lands on the right screen; name-entry visibility matches `isTopScore`; no `#player-name-input` in the DOM.

- [ ] **Step 5: Confirm zero console errors** across the whole walkthrough (collect Playwright console messages; assert none are errors).

Expected: no error-level console messages.

- [ ] **Step 6: Remove prototype scaffolding.**

```bash
git rm flow-prototype.html proto-menu.png 2>/dev/null; rm -rf .playwright-mcp
git status --short
```

Expected: `flow-prototype.html` and `proto-menu.png` staged for deletion; `.playwright-mcp/` gone from the working tree.

- [ ] **Step 7: Commit.**

```bash
git add -A
git commit -m "chore: remove flow prototype scaffolding after flow reorg"
```

---

## Self-Review

**1. Spec coverage** (against `2026-06-21-screen-flow-reorg-design.md`):
- Forced-settings removal → Task 1 (Steps 5, 7). ✓
- `start-screen` as hub with Top Players + Settings → Task 1 (Steps 1, 10). ✓
- Opener-aware settings (`settingsOpener`, `openSettings`, `returnFromSettings`) → Task 1 (Steps 4, 6, 7). ✓
- Story/Settings button relabels → Task 1 (Steps 2, 3). ✓
- Pause menu (resume/restart/settings/menu) → Task 2. ✓
- Game Over menu button + top-50 inline name-entry → Task 3. ✓
- View-only leaderboard (remove footer form) → Task 4. ✓
- Gallery returns to menu → no change needed (design §Components confirms). ✓
- Pause→Settings preserves the in-progress game → Task 5 Step 3 verifies. ✓
- Verification of all ten flow checks → Task 5 Steps 2–5. ✓

**2. Placeholder scan:** No TBD/TODO/"handle edge cases"; every code step shows complete code. ✓

**3. Type/name consistency:** `showMenu`, `openSettings`, `returnFromSettings`, `transitionFromCreditsToMenu`, `setupGameOverScoreEntry`, `this.settingsOpener` are defined in Task 1/Task 3 and consumed with identical names in Tasks 2–3. Button IDs (`menu-leaderboard-btn`, `menu-settings-btn`, `resume-btn`, `pause-restart-btn`, `pause-settings-btn`, `pause-menu-btn`, `game-over-menu-btn`, `game-over-score-form`, `game-over-name-input`) match between the `index.html` markup steps and the `src/game.js` wiring steps. ✓
