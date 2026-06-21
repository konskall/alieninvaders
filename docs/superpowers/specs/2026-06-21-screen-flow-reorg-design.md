# Screen Flow & Navigation Reorganization — Design

**Date:** 2026-06-21
**Scope:** Flow / navigation only. No gameplay, balance, art, or wording changes beyond the button labels the new flow requires. No new screens — existing screens are repurposed and re-wired.

## Goal

Reorganize the game's screens into a coherent flow centered on a **Main Menu hub**: remove the forced Settings gate, eliminate duplicate buttons and entry points, and give the Pause and Game Over screens real navigation. This matches the approved clickable prototype (`flow-prototype.html`, "Approach A").

## Problems with the current flow

1. **Settings is forced** between Credits and play (`credits → settings → start-screen → playing`). You must pass through Settings every launch before you can do anything.
2. **No real hub.** `start-screen` is the de-facto menu but it is reachable only after Settings, and it offers only Story / Gallery / Play — not Leaderboard or Settings.
3. **Duplicate entry points.** Two "Έναρξη Παιχνιδιού" buttons (`settings-start-btn` + `start-btn`) and two story→play entries (`story-start-btn` + an in-prose link).
4. **Pause has no menu** — only the keyboard `P`. No restart, settings, or exit-to-menu.
5. **Game Over** can open Settings but then drops you into the old `settings → start-screen` chain; there is no "back to menu".
6. **Leaderboard modal always shows a name-entry form**, even when the player is only viewing it.

## Target state machine

States: `credits`, `menu`, `settings`, `story`, `playing`, `paused`, `gameOver`.
(`menu` becomes first-class; it replaces the old transient `settings`-first step.)

```
credits ──tap / 10s──▶ menu (hub)

menu ─▶ playing            (▶ ΠΑΙΞΕ)
     ─▶ story              (📖 Το Χρονικό)
     ─▶ gallery (overlay)  (🖼 Artwork)            ──✕──▶ menu
     ─▶ leaderboard modal  (🏆 Top Players, view-only) ──×──▶ (reveals menu behind)
     ─▶ settings           (⚙ Ρυθμίσεις, opener=menu)

settings ──💾 Αποθήκευση & Πίσω──▶ opener   (menu | paused | gameOver)

story ──✕──▶ menu
      ──▶ Παίξε──▶ playing

playing ──P / pause──▶ paused
        ──death──▶ gameOver

paused ─▶ playing   (Συνέχεια)
       ─▶ playing   (Επανεκκίνηση = restart)
       ─▶ settings  (Ρυθμίσεις, opener=paused)
       ─▶ menu      (Κεντρικό Μενού)

gameOver ─▶ playing            (Νέο Παιχνίδι = restart)
         ─▶ leaderboard modal  (Top Players, view-only)
         ─▶ share dialog       (Κοινοποίηση)
         ─▶ settings           (Ρυθμίσεις, opener=gameOver)
         ─▶ menu               (Κεντρικό Μενού)
         + inline name-entry shown ONLY when leaderboardManager.isTopScore(score)
```

## Key decisions

1. **Repurpose `start-screen` as the Main Menu hub** instead of adding a separate `menu-screen`. It already holds the instructions and the Story / Gallery / Play buttons, so the DOM churn is minimal. Add a **Top Players** button and a **Ρυθμίσεις** button to it. Its `state` becomes `'menu'`.
2. **Settings is optional and opener-aware.** It is opened from menu / pause / game-over and always returns to the screen it was opened from. Track `this.settingsOpener ∈ {'menu','paused','gameOver'}`. Credits no longer auto-advances to Settings.
3. **Name entry moves into Game Over**, shown only when `isTopScore(score)` is true. The **leaderboard modal becomes view-only** (its footer form is removed).
4. **Pause gains a button menu** (Συνέχεια / Επανεκκίνηση / Ρυθμίσεις / Κεντρικό Μενού) alongside the `P` shortcut.
5. **One primary action per screen.** Settings button label becomes "💾 Αποθήκευση & Πίσω"; the story button label becomes "▶ Παίξε". Existing duplicate play entries are reduced to one prominent button per screen (the in-prose story link is kept but is no longer the primary call to action).
6. **Leaderboard is a modal overlay**, so closing it simply hides it and reveals whatever screen is behind (menu or game-over). No opener tracking needed for the leaderboard.

## Components touched

### `index.html`
- **`start-screen` (hub):** add a 🏆 Top Players button and a ⚙ Ρυθμίσεις button.
- **`settings-screen`:** relabel `settings-start-btn` → "💾 Αποθήκευση & Πίσω".
- **`story-screen`:** relabel `story-start-btn` → "▶ Παίξε".
- **`pause-screen`:** add four buttons (resume / restart / settings / menu).
- **`game-over-screen`:** add an inline name-entry form (hidden by default) and a "🏠 Κεντρικό Μενού" button.
- **`leaderboard-modal`:** remove the footer `<form id="score-entry-form">` (modal is now view-only).

### `src/game.js`
- `transitionFromCreditsToSettings()` → `transitionFromCreditsToMenu()`: credits → `start-screen`, `state='menu'`. Update the 10s timeout and the credits click handler to call it.
- New `showMenu()`: hide game-over / pause / settings / story / gallery / hud / active-bonuses / touch-controls / leaderboard-modal / share-dialog; show `start-screen`; stop music; reset joystick; `state='menu'`.
- New `openSettings(opener)`: store `this.settingsOpener`, hide the opener screen, show settings, `state='settings'`.
- Settings save: keep the existing read-and-apply logic; instead of always showing `start-screen`, return to `this.settingsOpener` (call `showMenu()`, `pauseGame`-screen, or game-over as appropriate).
- Pause buttons wired to: `resumeGame()`, `restartGame()`, `openSettings('paused')`, `showMenu()`.
- Game Over: after setting the final score, show the inline name-entry form **iff** `this.leaderboardManager.isTopScore(this.score)`, else keep it hidden; wire its submit to `addScore(name, score, level)` with success feedback. Wire the new Menu button to `showMenu()` and the existing settings button to `openSettings('gameOver')`.
- `showLeaderboardModal()`: drop the footer-form wiring (form removed); keep display + close handlers; guard against the missing form.

### `src/gallery.js`
- `showGallery()` / `hideGallery()` already toggle `start-screen` ↔ `gallery-screen`, which is correct now that `start-screen` is the hub. No change required beyond confirming behavior.

## Opener tracking detail

- **Settings** is the only screen that fully replaces another and must restore it, so it needs `this.settingsOpener`. From pause, opening Settings must **not** call `startGame()` — the in-progress game objects (player, enemies, wave state) stay intact and frozen because `updateGame()` only runs while `state==='playing'`. Saving returns to the pause screen; Συνέχεια then resumes the same game.
- **Story / Gallery** open only from the menu in this design and return to the menu.
- **Leaderboard / Share** are modal overlays; closing hides the overlay and reveals the screen behind. No state change.

## Verification (no unit-test harness — vanilla browser game)

Drive the local server with Playwright and assert screen visibility + zero console errors for every transition:

1. `credits` → tap → `menu` (start-screen visible, settings hidden).
2. Menu: each of the 5 buttons reaches the correct screen.
3. Settings from menu → save → back to menu.
4. Settings from pause → save → back to pause; Συνέχεια → playing (same game preserved).
5. Settings from game-over → save → back to game-over.
6. Story ✕ → menu; Story ▶ Παίξε → playing.
7. Gallery ✕ → menu.
8. Pause: all four buttons behave correctly.
9. Game Over: name-entry visible when `isTopScore` is true, hidden when false; Menu button → menu.
10. Leaderboard modal: no name field; opens from menu and from game-over; closes correctly.

## Risks

- Orphaned/duplicate event listeners or duplicate element IDs after markup edits.
- Wrong `settingsOpener` from any of the three entry points.
- `showLeaderboardModal()` breaking when the footer form is removed (guard required).
- Pause → Settings → back accidentally restarting the game instead of preserving it.

## Out of scope

Gameplay/balance, art, the story prose, performance work, and decomposing the large `Game` class. Those remain possible future passes.
