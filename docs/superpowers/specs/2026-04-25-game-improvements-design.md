# Alien Invaders — Game Improvements Design
Date: 2026-04-25

## Overview

Πέντε βελτιώσεις στο Alien Invaders space shooter: Wave System, Boss Fights, Visual Polish, Background Music, και HUD Improvements. Όλες υλοποιούνται σε vanilla JS/Canvas 2D χωρίς νέες εξαρτήσεις.

---

## 1. Wave System

**Τι αλλάζει:** Αντί για συνεχές random spawn, οι εχθροί έρχονται σε δομημένα waves.

**Λογική:**
- Νέα state `waveState` στο `Game`: `{ number, enemiesRemaining, phase, breakTimer }`
- Phases: `'spawning'` → `'fighting'` → `'break'` → `'announcing'` → `'spawning'`
- Enemies ανά wave: `Math.min(6 + (waveNumber - 1) * 2, 20)` (cap στα 20)
- Spawn interval μέσα στο wave: 500ms μεταξύ εχθρών
- Break διάρκεια: 3 δευτ. (`WAVE_BREAK_DURATION = 3000`)
- Announce διάρκεια: 2 δευτ. (`WAVE_ANNOUNCE_DURATION = 2000`)
- Wave clear bonus: `500 * waveNumber` πόντοι

**Wave → Level mapping:** `waveNumber` αντικαθιστά το χρονικό spawn trigger. Το progressive level εξακολουθεί να βασίζεται στο score.

**UI:**
- Wave announce banner: fullwidth, semi-transparent, "⚡ WAVE N INCOMING ⚡"
- Wave clear message: floating center text, "WAVE CLEAR! +Xpts"
- Wave counter στο HUD δίπλα στο Level

---

## 2. Boss Fights

**Τι αλλάζει:** Κάθε 10 levels εμφανίζεται Boss αντί για κανονικό wave.

**Νέα class `Boss extends Enemy`:**
```
health: baseHealth * 20 * diffMultiplier
maxHealth: (same)
size: 50
speed: 1.5
phase: 1 | 2  (αλλάζει στο 50% HP)
entranceComplete: false (slides in από y=-100)
```

**Phase 1 (>50% HP):**
- Κινείται πλάγια (sine wave οριζόντια)
- Πυρά spread 3 bullets κάθε 1500ms

**Phase 2 (<50% HP):**
- Ταχύτερο (speed * 1.4)
- Spread 5 bullets + 1 homing bullet κάθε 1000ms
- Visual: flickering red glow

**Homing bullet:** κινείται προς τον παίκτη με `speed = 3`, max στροφή `0.05 rad/frame`

**Boss entrance:** `y` starts at `-100`, κινείται προς `canvas.height * 0.2` με speed 3. `entranceComplete = true` όταν φτάσει.

**Boss death:** screen shake intensity `0.5`, 100 particles, 3 shockwaves, bonus `5000 * bossLevel` πόντοι (π.χ. wave 10 boss → +5000, wave 20 boss → +10000).

**Boss health bar:** εμφανίζεται στο HUD μόνο όταν `game.boss !== null`.

**Boss schedule:** Waves 10, 20, 30, 40, 50 (κάθε 10ο wave). Αντί για κανονικό wave spawn, ξεκινά boss sequence. Μετά τον θάνατο του boss, επόμενο wave συνεχίζει κανονικά. `bossLevel = waveNumber / 10` (integer).

---

## 3. Visual Polish

### 3a. Parallax Starfield
Τρία layers αντί για ένα. Αλλαγή στην `Star` class:
- Layer 0 (far): speed 0.1, size 0.5-1px, opacity 0.3-0.5
- Layer 1 (mid): speed 0.3, size 1-2px, opacity 0.5-0.7
- Layer 2 (near): speed 0.6, size 1.5-3px, opacity 0.8-1.0

`initializeStars()`: 80 stars ανά layer (240 σύνολο αντί 150).

### 3b. Hit Flash
Στην `Enemy` class:
- Νέο property `hitFlash = 0` (counter σε frames)
- Όταν χτυπηθεί: `this.hitFlash = 4`
- Στο `draw()`: αν `hitFlash > 0`, overlay λευκό `rgba(255,255,255,0.6)` πάνω από το sprite, `hitFlash--`

### 3c. Nebula Background
Στο `Game.draw()`, πριν τα stars:
- 2-3 `createRadialGradient` με soft μοβ/μπλε/teal χρώματα, πολύ χαμηλό alpha (0.06-0.12)
- Static (δεν κινούνται) — χωρίς performance cost

### 3d. Invincibility Frames
Στον `Player`:
- `invincible = false`, `invincibleTimer = 0`, `INVINCIBLE_DURATION = 120` frames
- Μετά από damage: `invincible = true`, `invincibleTimer = 120`
- Κάθε frame: αν `invincibleTimer > 0`, `invincibleTimer--`; αν `= 0`, `invincible = false`
- Visual: `player.draw()` με `ctx.globalAlpha = Math.sin(Date.now() * 0.02) > 0 ? 1 : 0.3` (blink effect)
- Collision check: αν `player.invincible`, skip enemy bullet/collision damage

---

## 4. Background Music

**Νέα class `MusicManager`:**

```js
class MusicManager {
    constructor(audioContext)
    start()      // ξεκινά το loop
    stop()       // σταματά
    setTempo(bpm)
    setIntensity(level)  // 1-100, αυξάνει complexity
    toggle()
}
```

**Structure:**
- Scheduler loop με `setTimeout` (Web Audio clock-accurate scheduling)
- Bar = 4 beats. Loop κάθε 2 bars.
- **Kick**: `OscillatorNode` (sine, 80→40Hz sweep, 0.3s) κάθε beat
- **Hi-hat**: `AudioBufferSourceNode` (noise burst, 0.05s) κάθε half-beat
- **Bass**: square wave, κρατά χαμηλή νότα του scale
- **Melody**: square wave, simple arpeggio (4 notes C-minor pentatonic)

**Tempo:**
- Level 1-20: 110 BPM
- Level 21-50: 130 BPM
- Level 51+: 155 BPM
- Boss fight: 160 BPM + distortion effect

**Mute button:** `🎵` / `🔇` στο HUD top-right. Calls `musicManager.toggle()`.

---

## 5. HUD Improvements (Option A — Full Featured)

### 5a. FloatingText class
```js
class FloatingText {
    constructor(x, y, text, color, size = 16)
    // x, y: canvas coords
    // velocityY = -1.5 (ανεβαίνει)
    // life = 1, decay = 0.02
    update() / draw(ctx) / isDead()
}
```

Triggers:
- Εχθρός καταστρέφεται: `+N` (λευκό) ή `+N CRITICAL!` (κίτρινο) αν combo > 3
- Killing spree: `"KILLING SPREE x5!"` (πορτοκαλί) κάθε 5 kills
- Wave clear: `"WAVE CLEAR! +Npts"` (τιρκουάζ, size 22)
- Level up: `"LEVEL UP!"` (χρυσό, size 24, center screen)
- Boss death: `"BOSS DEFEATED! +5000"` (κόκκινο→χρυσό, size 28)

### 5b. Animated Score Counter
- `this.displayScore = 0` (rendered value)
- Κάθε frame: `displayScore += (score - displayScore) * 0.12`
- HUD δείχνει `Math.floor(displayScore)`

### 5c. Combo Counter
- `this.combo = 0`, reset όταν ο παίκτης χτυπηθεί
- +1 ανά kill
- Combo 5+: score multiplier x1.5 (ανεξάρτητο από το bonus multiplier)
- Combo 10+: x2
- Display: "COMBO x3" bottom-left όταν combo >= 2

### 5d. Kill Counter
- `this.killCount = 0`, reset στο `startGame()`
- Display: "KILLS N" bottom-right

### 5e. Boss Health Bar
- Εμφανίζεται κάτω από το κύριο HUD bar μόνο όταν `game.boss !== null`
- Gradient red health fill, boss name label αριστερά, HP αριθμός δεξιά
- Αναβοσβήνει κόκκινο σε phase 2

---

## Architecture Notes

- Όλα τα νέα objects (`FloatingText`, `Boss`) ακολουθούν το υπάρχον pattern (`update()`, `draw()`, `isDead()`)
- `Game` class αποκτά: `boss`, `waveState`, `floatingTexts`, `killCount`, `combo`, `displayScore`, `musicManager`
- `MusicManager` λαμβάνει το `audioContext` από τον `SoundManager` (κοινό context)
- Parallax stars: `this.stars` γίνεται array από 3 sub-arrays
- Δεν αλλάζει η Firebase/leaderboard λογική

---

## Out of Scope

- Νέοι εχθροί (υπάρχουν ήδη 8 τύποι)
- Multiplayer
- Persistent save game / achievements
- Mobile-specific boss UI
