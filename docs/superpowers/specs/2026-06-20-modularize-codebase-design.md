# Design: Modularize the Alien Invaders codebase

**Date:** 2026-06-20
**Status:** Approved (pending spec review)
**Type:** Behavior-preserving refactor (no gameplay changes)

## Problem

The game lives in two ~5k-line files:

- `app.js` — 4,701 lines (all game logic in one file)
- `style.css` — 4,982 lines (all styles in one file)

This hurts maintainability, makes changes risky (one edit can affect unrelated
things), and makes AI-assisted edits less reliable (too much to hold in context).

## Goals

- **Maintainability** — find and change code quickly, in small focused files.
- **Fewer bugs / safer changes** — clear boundaries so a change stays local.
- **Easier feature work** — adding enemies/bosses/power-ups/levels is organized.

## Non-goals (explicitly out of scope)

- **No gameplay/behavior changes.** Code is moved verbatim; only `import`/`export`
  lines are added. The game must play identically before and after.
- **No build step / no new runtime tools.** Native ES modules only.
- **No performance/FPS work.** Tracked separately as a future profiling pass
  (the modular structure makes that pass easier later).
- **No god-class decomposition.** The `Game` class moves to its own file intact.
  Splitting it into subsystems is a possible future phase, not this one.

## Chosen approach

**ES modules, no build step, one file per class + a CSS split.** Selected over a
Vite/bundler approach (avoids adding Node/npm and a build step to the current
"edit files, upload to GitHub" workflow) and over a minimal partial split
(doesn't fully solve the problem).

Trade-off accepted: native ES modules require serving over http(s). The live site
(GitHub Pages) already does this. Local testing now needs a small static server
(e.g. `python -m http.server`) instead of double-clicking `index.html`.

## Target structure

```
Alien Invaders/
├── index.html              # <link>s to css/*; <script type="module" src="src/main.js">
├── css/
│   ├── base.css            # reset, :root variables, fonts, #game-container, canvas
│   ├── screens.css         # credits, story, start, settings, game-over, pause
│   ├── hud.css             # HUD, boss HUD, lives, super-weapon, difficulty, active-bonuses
│   ├── leaderboard.css     # modal, leaderboard list/entries, score form
│   ├── gallery.css         # gallery grid, lightbox
│   ├── controls.css        # touch joystick, super-weapon button
│   └── responsive.css      # @media blocks
└── src/
    ├── config.js           # GAME_SETTINGS, DIFFICULTY_CONFIG, generateProgressiveDifficulty,
    │                       #   PROGRESSIVE_DIFFICULTY, CONFIG, WAVE_CONFIG, SHADOW_OPTIMIZATION
    ├── utils.js            # randomRange, distance, GradientCache
    ├── managers/
    │   ├── LeaderboardManager.js
    │   ├── SoundManager.js
    │   ├── VibrationManager.js
    │   └── MusicManager.js
    ├── entities/
    │   ├── Particle.js
    │   ├── Shockwave.js
    │   ├── FloatingText.js
    │   ├── BonusPickup.js
    │   ├── Bullet.js
    │   ├── HomingBullet.js
    │   ├── Star.js
    │   ├── Player.js
    │   ├── Enemy.js
    │   └── Boss.js
    ├── gallery.js          # GALLERY_ITEMS, GalleryManager
    ├── game.js             # Game class (moved intact)
    └── main.js             # bootstrap on window load
```

`app.js` is deleted once everything is migrated and verified.

## Source → destination mapping (from current `app.js` line ranges)

| Lines | Construct(s) | Destination |
|---|---|---|
| 2–239 | GAME_SETTINGS, DIFFICULTY_CONFIG, generateProgressiveDifficulty, PROGRESSIVE_DIFFICULTY, CONFIG, WAVE_CONFIG, SHADOW_OPTIMIZATION | `src/config.js` |
| 881–889, 2276–2310 | randomRange, distance, GradientCache | `src/utils.js` |
| 240–362 | LeaderboardManager | `src/managers/LeaderboardManager.js` |
| 363–580 | SoundManager | `src/managers/SoundManager.js` |
| 581–656 | VibrationManager | `src/managers/VibrationManager.js` |
| 657–792 | MusicManager | `src/managers/MusicManager.js` |
| 793–880 | BonusPickup | `src/entities/BonusPickup.js` |
| 890–953 | Particle | `src/entities/Particle.js` |
| 954–986 | Shockwave | `src/entities/Shockwave.js` |
| 987–1022 | FloatingText | `src/entities/FloatingText.js` |
| 1023–1203 | Bullet | `src/entities/Bullet.js` |
| 1204–1281 | HomingBullet | `src/entities/HomingBullet.js` |
| 1282–1575 | Boss | `src/entities/Boss.js` |
| 1576–1774 | Player | `src/entities/Player.js` |
| 1775–2242 | Enemy | `src/entities/Enemy.js` |
| 2243–2275 | Star | `src/entities/Star.js` |
| 2311–2493 | GALLERY_ITEMS, GalleryManager | `src/gallery.js` |
| 2494–4695 | Game | `src/game.js` |
| 4696–end | `let game`, window load bootstrap | `src/main.js` |

(Exact ranges are confirmed during implementation; each file gets the `export`
keyword on its declarations and `import` lines for its dependencies.)

## Wiring details (the subtle parts)

1. **`window.game` must stay global.** `index.html` has an inline handler
   `onclick="...game.startGame()..."` in the story screen. With modules, the
   `game` variable is module-scoped. `src/main.js` will set `window.game = game`
   so the inline handler keeps working. (Alternatively, replace the inline
   handler with an `addEventListener` in `main.js`.)
2. **Firebase stays a CDN `<script>`** in `index.html`, loaded *before* the
   module script, so `window.firebase` exists when `LeaderboardManager` runs.
3. **Module load order is automatic** — the browser resolves the `import` graph;
   no manual ordering needed (unlike the current single-file scope).
4. **CSS order matters.** The 7 css files are linked in the current cascade order
   (base → screens → hud → leaderboard → gallery → controls → responsive) via
   separate `<link>` tags (not `@import`, to avoid serialized loading).

## Migration sequence (incremental, runnable at each step)

1. Create `css/*` from `style.css`; update `index.html` `<link>`s; verify visuals.
2. Extract `config.js` + `utils.js`; have `app.js` import them; verify.
3. Extract entities one group at a time; verify after each.
4. Extract managers; verify.
5. Move `Game` to `game.js` and bootstrap to `main.js`; switch `index.html` to
   `<script type="module" src="src/main.js">`; add `window.game`.
6. Delete `app.js`; final full verification.

## Verification strategy (no automated tests exist)

After each step and at the end, run a **browser smoke test** (local static server
+ Playwright):

- Page loads with **zero console errors**.
- Start screen → start game; enemies spawn; auto-fire works; bullets hit.
- Pick up a power-up; HUD active-bonuses updates.
- Pause (`P`) / resume.
- Trigger super weapon when charged.
- Open leaderboard modal → list renders and **scrolls**; score form visible.
- Open Story and Artwork (gallery + lightbox).
- Mobile viewport: joystick + super-weapon button present.

Behavior must match the pre-refactor build. (Optional: a tiny `smoke.test` page
that imports each module and asserts the classes construct without throwing.)

## Delivery & source of truth

- The live site is **remote `main`** (GitHub Pages, `konskall.github.io/alieninvaders`),
  currently single-file. Local `master` is an unrelated history, now ~content-aligned.
- **Decision (approved): `origin/main` is the single source of truth.** The
  refactor is done on a branch based off `origin/main`, verified, then pushed to
  `main`. The local working copy is afterwards aligned to `origin/main` so we stop
  juggling two divergent histories.
- The refactor lands as a coherent series of commits on the branch (each step
  above ≈ one commit), so it can be reviewed and, if needed, reverted step by step.

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Inline `onclick` breaks under modules | `window.game = game` in `main.js` |
| Firebase undefined at module run time | CDN script before module; existing guard in LeaderboardManager |
| CSS cascade order changes → visual regressions | Preserve link order; visual smoke test |
| Cross-class references missed during extraction | Incremental extraction + console-error check after each step |
| Divergent local/remote histories cause a messy merge | Base all work on `origin/main`; consolidate to it |

## Out-of-scope follow-ups (noted, not now)

- Performance/FPS profiling pass.
- Decomposing the `Game` class into subsystems (input, spawning, collisions,
  rendering, UI).
- Adding a real automated test harness.
