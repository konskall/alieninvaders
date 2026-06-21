# Alien Invaders — Game Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Προσθήκη Wave System, Boss Fights, Visual Polish, Background Music και HUD Improvements στο Alien Invaders.

**Architecture:** Όλες οι αλλαγές γίνονται στο `app.js` (νέες classes πριν το `Game` class) και `index.html`/`style.css` για τα HTML HUD elements. Κάθε νέα class ακολουθεί το υπάρχον pattern `update() / draw(ctx) / isDead()`.

**Tech Stack:** Vanilla JS, Canvas 2D API, Web Audio API. Χωρίς νέες εξαρτήσεις.

---

## Task 1: FloatingText class + spawnFloatingText helper

**Files:**
- Modify: `app.js` — νέα class μετά τη `Shockwave` class (~line 826), νέα properties στο `Game` constructor, νέα method `spawnFloatingText`, ενημέρωση `startGame()`, `updateGame()`, `draw()`

- [ ] **Step 1: Προσθήκη `FloatingText` class στο app.js αμέσως μετά την `Shockwave` class**

Βρες τη γραμμή `// Bullet Class` (~line 828) και πρόσθεσε πριν από αυτή:

```js
// FloatingText Class
class FloatingText {
    constructor(x, y, text, color, size = 16) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.size = size;
        this.velocityY = -1.5;
        this.life = 1;
        this.decay = 0.02;
    }

    update() {
        this.y += this.velocityY;
        this.life -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.font = `bold ${this.size}px Orbitron, monospace`;
        ctx.fillStyle = this.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}
```

- [ ] **Step 2: Προσθήκη `this.floatingTexts = []` στο `Game` constructor**

Βρες `this.shockwaves = [];` στο constructor και πρόσθεσε από κάτω:
```js
this.floatingTexts = [];
```

- [ ] **Step 3: Reset `floatingTexts` στο `startGame()`**

Βρες `this.shockwaves = [];` στο `startGame()` και πρόσθεσε:
```js
this.floatingTexts = [];
```

- [ ] **Step 4: Προσθήκη `spawnFloatingText()` method στο `Game` class**

Πρόσθεσε μετά τη `createExplosion()` method:
```js
spawnFloatingText(x, y, text, color, size = 16) {
    this.floatingTexts.push(new FloatingText(x, y, text, color, size));
}
```

- [ ] **Step 5: Update floating texts στο `updateGame()`**

Βρες το block `// Update shockwaves` και πρόσθεσε αμέσως μετά:
```js
// Update floating texts
this.floatingTexts = this.floatingTexts.filter(ft => {
    ft.update();
    return !ft.isDead();
});
```

- [ ] **Step 6: Draw floating texts στο `draw()`**

Βρες `this.particles.forEach(particle => particle.draw(this.ctx));` και πρόσθεσε αμέσως μετά:
```js
// Draw floating texts
this.floatingTexts.forEach(ft => ft.draw(this.ctx));
```

- [ ] **Step 7: Verify στο browser**

Άνοιξε `index.html`. Δεν πρέπει να υπάρχουν console errors. Το παιχνίδι παίζεται κανονικά. Τα floating texts δεν εμφανίζονται ακόμα (δεν έχουμε triggers).

- [ ] **Step 8: Commit**
```bash
git add app.js
git commit -m "feat: add FloatingText class and spawnFloatingText helper"
```

---

## Task 2: Animated Score + Combo Counter + Kill Counter

**Files:**
- Modify: `app.js` — `Game` constructor, `startGame()`, `updateGame()`, `updateHUD()`, `checkCollisions()`, `draw()`

- [ ] **Step 1: Προσθήκη νέων properties στο `Game` constructor**

Βρες `this.floatingTexts = [];` και πρόσθεσε:
```js
this.displayScore = 0;
this.combo = 0;
this.killCount = 0;
```

- [ ] **Step 2: Reset στο `startGame()`**

Βρες `this.floatingTexts = [];` στο `startGame()` και πρόσθεσε:
```js
this.displayScore = 0;
this.combo = 0;
this.killCount = 0;
```

- [ ] **Step 3: Animated score update στο `updateGame()`**

Βρες `// Update bonus pickups` στο `updateGame()` και πρόσθεσε πριν από αυτό:
```js
// Animated score lerp
this.displayScore += (this.score - this.displayScore) * 0.12;
```

- [ ] **Step 4: Ενημέρωση `updateHUD()` για animated score**

Βρες `scoreElement.textContent = this.score;` και άλλαξέ το σε:
```js
scoreElement.textContent = Math.floor(this.displayScore);
```

- [ ] **Step 5: Combo + kill tracking στο `checkCollisions()`**

Βρες το block που υπολογίζει points όταν εχθρός καταστρέφεται (περιέχει `const points = this.activeBonuses.multiplier`). Αντικατάστησε ολόκληρο το block υπολογισμού score+points:

```js
// Combo multiplier
const comboMultiplier = this.combo >= 10 ? 2 : this.combo >= 5 ? 1.5 : 1;
const basePoints = this.activeBonuses.multiplier ? enemy.points * 2 : enemy.points;
const points = Math.floor(basePoints * comboMultiplier);
this.score += points;
this.combo++;
this.killCount++;

// Floating score text
const isCritical = this.combo >= 3;
this.spawnFloatingText(
    enemyX,
    enemyY - 10,
    isCritical ? `+${points} CRITICAL!` : `+${points}`,
    isCritical ? '#FFD700' : '#FFFFFF',
    isCritical ? 18 : 14
);

// Killing spree every 5 kills
if (this.combo > 0 && this.combo % 5 === 0) {
    this.spawnFloatingText(
        this.player.x,
        this.player.y - 60,
        `KILLING SPREE x${this.combo}!`,
        '#FF6B35',
        20
    );
}
```

- [ ] **Step 6: Reset combo όταν ο παίκτης χτυπηθεί**

Στο `checkCollisions()`, βρες το σημείο που καλείται `this.player.takeDamage()` για enemy bullets (δύο φορές — bullet και collision). Σε κάθε ένα, πρόσθεσε πριν το `takeDamage()`:
```js
this.combo = 0;
```

- [ ] **Step 7: Draw combo και kill counter on canvas**

Στο `draw()`, αμέσως πριν το `this.ctx.restore();` στο τέλος της method:
```js
// Combo display
if (this.state === 'playing' && this.combo >= 2) {
    this.ctx.save();
    this.ctx.font = 'bold 14px Orbitron, monospace';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'bottom';
    this.ctx.shadowBlur = 8;
    this.ctx.shadowColor = '#FFD700';
    this.ctx.fillText(`COMBO x${this.combo}`, 20, this.canvas.height - 20);
    this.ctx.restore();
}
// Kill counter
if (this.state === 'playing') {
    this.ctx.save();
    this.ctx.font = '12px Orbitron, monospace';
    this.ctx.fillStyle = 'rgba(180,180,180,0.7)';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(`KILLS ${this.killCount}`, this.canvas.width - 20, this.canvas.height - 20);
    this.ctx.restore();
}
```

- [ ] **Step 8: Verify στο browser**

Παίξε, χτύπα εχθρούς. Πρέπει να εμφανίζονται floating "+N" texts. Μετά από 3+ kills χωρίς damage: "CRITICAL!" texts. Μετά 5: "KILLING SPREE x5!". Το score counter ανεβαίνει ομαλά. Bottom-left εμφανίζει COMBO. Bottom-right: KILLS.

- [ ] **Step 9: Commit**
```bash
git add app.js
git commit -m "feat: animated score, combo counter, kill counter, floating score texts"
```

---

## Task 3: Parallax Starfield (3 layers)

**Files:**
- Modify: `app.js` — `Star` class, `initializeStars()`

- [ ] **Step 1: Αντικατάσταση `Star` class**

Βρες `// Star Background Class` (~line 1489) και αντικατέστησε ολόκληρη την `Star` class:

```js
// Star Background Class
class Star {
    constructor(x, y, size, speed, layer = 1) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.layer = layer;
        this.opacity = layer === 0
            ? Math.random() * 0.2 + 0.3
            : layer === 1
                ? Math.random() * 0.2 + 0.5
                : Math.random() * 0.2 + 0.8;
    }

    update(canvas) {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * canvas.width;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
```

- [ ] **Step 2: Αντικατάσταση `initializeStars()`**

Βρες `initializeStars()` στο `Game` class και αντικατέστησε ολόκληρη τη method:

```js
initializeStars() {
    this.stars = [];
    // Layer 0: far (slow, tiny, dim)
    for (let i = 0; i < 80; i++) {
        this.stars.push(new Star(
            Math.random() * this.canvas.width,
            Math.random() * this.canvas.height,
            randomRange(0.3, 0.7),
            0.1,
            0
        ));
    }
    // Layer 1: mid
    for (let i = 0; i < 80; i++) {
        this.stars.push(new Star(
            Math.random() * this.canvas.width,
            Math.random() * this.canvas.height,
            randomRange(0.7, 1.4),
            0.3,
            1
        ));
    }
    // Layer 2: near (fast, large, bright)
    for (let i = 0; i < 80; i++) {
        this.stars.push(new Star(
            Math.random() * this.canvas.width,
            Math.random() * this.canvas.height,
            randomRange(1.2, 2.2),
            0.6,
            2
        ));
    }
}
```

- [ ] **Step 3: Verify στο browser**

Άνοιξε το παιχνίδι. Πρέπει να φαίνονται 3 διαφορετικές ταχύτητες αστεριών — μερικά πολύ αργά, μερικά γρήγορα. Parallax effect ορατό κατά τη κίνηση.

- [ ] **Step 4: Commit**
```bash
git add app.js
git commit -m "feat: 3-layer parallax starfield"
```

---

## Task 4: Nebula Background + Enemy Hit Flash

**Files:**
- Modify: `app.js` — `Enemy` constructor, `Enemy.draw()`, `Game.draw()`, `Game.checkCollisions()`

- [ ] **Step 1: Προσθήκη `hitFlash` property στον `Enemy` constructor**

Βρες `this.pulsePhase = Math.random() * Math.PI * 2;` στον `Enemy` constructor και πρόσθεσε:
```js
this.hitFlash = 0;
```

- [ ] **Step 2: Hit flash rendering στο `Enemy.draw()`**

Βρες `ctx.restore();` στο τέλος της `Enemy.draw()` method (πριν το closing `}`) και πρόσθεσε πριν από αυτό:
```js
// Hit flash overlay
if (this.hitFlash > 0) {
    ctx.save();
    ctx.globalAlpha = (this.hitFlash / 4) * 0.7;
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    this.hitFlash--;
}
```

- [ ] **Step 3: Trigger hit flash στο `checkCollisions()`**

Βρες το σημείο που ο εχθρός χτυπηθεί αλλά ΔΕΝ καταστρέφεται (το `else` block με `this.soundManager.hit()`). Πρόσθεσε:
```js
enemy.hitFlash = 4;
```

Επίσης στο block που ο εχθρός καταστρέφεται (αμέσως μετά το `enemy.health--` check), πρόσθεσε `enemy.hitFlash = 4;` πριν το `this.enemies.splice(j, 1);` για visible flash frame.

- [ ] **Step 4: Nebula background στο `Game.draw()`**

Βρες `// Clear canvas` στο `draw()` και αμέσως μετά το `this.ctx.fillRect(...)` (clear), πρόσθεσε:
```js
// Static nebula gradients
const neb1 = this.ctx.createRadialGradient(
    this.canvas.width * 0.25, this.canvas.height * 0.2, 0,
    this.canvas.width * 0.25, this.canvas.height * 0.2, this.canvas.width * 0.45
);
neb1.addColorStop(0, 'rgba(70, 0, 110, 0.10)');
neb1.addColorStop(1, 'rgba(0, 0, 0, 0)');
this.ctx.fillStyle = neb1;
this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

const neb2 = this.ctx.createRadialGradient(
    this.canvas.width * 0.78, this.canvas.height * 0.65, 0,
    this.canvas.width * 0.78, this.canvas.height * 0.65, this.canvas.width * 0.38
);
neb2.addColorStop(0, 'rgba(0, 35, 90, 0.09)');
neb2.addColorStop(1, 'rgba(0, 0, 0, 0)');
this.ctx.fillStyle = neb2;
this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

const neb3 = this.ctx.createRadialGradient(
    this.canvas.width * 0.5, this.canvas.height * 0.85, 0,
    this.canvas.width * 0.5, this.canvas.height * 0.85, this.canvas.width * 0.3
);
neb3.addColorStop(0, 'rgba(0, 60, 60, 0.07)');
neb3.addColorStop(1, 'rgba(0, 0, 0, 0)');
this.ctx.fillStyle = neb3;
this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
```

- [ ] **Step 5: Verify στο browser**

Ο χώρος πρέπει να έχει ελαφριές μωβ/μπλε αποχρώσεις (όχι plain black). Χτύπα εχθρό — πρέπει να κάνει λευκό flash για λίγα frames.

- [ ] **Step 6: Commit**
```bash
git add app.js
git commit -m "feat: nebula background gradients and enemy hit flash"
```

---

## Task 5: Player Invincibility Frames

**Files:**
- Modify: `app.js` — `Player` constructor, `Player.update()`, `Player.draw()`, νέα method `Player.makeInvincible()`, `Game.checkCollisions()`

- [ ] **Step 1: Προσθήκη properties στον `Player` constructor**

Βρες `this.trailParticles = [];` στον `Player` constructor και πρόσθεσε:
```js
this.invincible = false;
this.invincibleTimer = 0;
this.INVINCIBLE_DURATION = 120;
```

- [ ] **Step 2: Προσθήκη `makeInvincible()` method στο `Player`**

Πρόσθεσε μετά τη `takeDamage()` method:
```js
makeInvincible() {
    this.invincible = true;
    this.invincibleTimer = this.INVINCIBLE_DURATION;
}
```

- [ ] **Step 3: Countdown timer στο `Player.update()`**

Βρες `this.pulsePhase += 0.08;` στο `Player.update()` και πρόσθεσε:
```js
if (this.invincibleTimer > 0) {
    this.invincibleTimer--;
    if (this.invincibleTimer === 0) {
        this.invincible = false;
    }
}
```

- [ ] **Step 4: Blink effect στο `Player.draw()`**

Βρες `ctx.save();` στο **πρώτο** save της `Player.draw()` (αμέσως μετά τα trail particles) και πρόσθεσε πριν:
```js
if (this.invincible) {
    const blink = Math.sin(Date.now() * 0.025) > 0;
    if (!blink) return;
}
```

- [ ] **Step 5: Skip damage αν invincible — enemy bullets**

Στο `checkCollisions()`, στο block `// Enemy bullets vs player`, βρες τον έλεγχο `if (dist < bullet.radius + this.player.size)`. Αμέσως εντός αυτού του `if`, πριν από οποιαδήποτε άλλη λογική, πρόσθεσε:
```js
if (this.player.invincible) {
    this.bullets.splice(i, 1);
    continue;
}
```

Επίσης, εντός του damage block (μετά το shield check), πριν το `this.player.takeDamage()`:
```js
this.combo = 0;
this.player.makeInvincible();
```

- [ ] **Step 6: Skip damage αν invincible — enemy body collision**

Στο `checkCollisions()`, στο block `// Player vs enemies (collision)`, βρες `if (dist < this.player.size + enemy.size)`. Εντός αυτού, πριν από τη λογική damage:
```js
if (this.player.invincible) continue;
```

Επίσης πριν το `this.player.takeDamage()`:
```js
this.combo = 0;
this.player.makeInvincible();
```

- [ ] **Step 7: Verify στο browser**

Αφήσε εχθρό να σε χτυπήσει. Το ship πρέπει να αναβοσβήνει για ~2 δευτερόλεπτα. Κατά τη διάρκεια, bullets πρέπει να περνούν.

- [ ] **Step 8: Commit**
```bash
git add app.js
git commit -m "feat: player invincibility frames after damage"
```

---

## Task 6: Wave System

**Files:**
- Modify: `app.js` — νέο `WAVE_CONFIG` constant, `Game` constructor, `startGame()`, `updateGame()`, νέες methods `startNextWave()` + `updateWaveSystem()` + `updateWaveHUD()`, `draw()`
- Modify: `index.html` — wave counter στο HUD

- [ ] **Step 1: Προσθήκη `WAVE_CONFIG` constant στην αρχή του αρχείου**

Βρες `const SHADOW_OPTIMIZATION` και πρόσθεσε πριν:
```js
const WAVE_CONFIG = {
    SPAWN_INTERVAL: 500,
    BREAK_DURATION: 3000,
    ANNOUNCE_DURATION: 2000,
    BASE_ENEMIES: 6,
    ENEMIES_PER_WAVE: 2,
    MAX_ENEMIES: 20,
    CLEAR_BONUS_PER_WAVE: 500
};
```

- [ ] **Step 2: Προσθήκη `waveState` στο `Game` constructor**

Βρες `this.floatingTexts = [];` στο constructor και πρόσθεσε:
```js
this.waveState = {
    number: 0,
    phase: 'idle',
    enemiesInWave: 0,
    enemiesSpawned: 0,
    spawnTimer: 0,
    phaseTimer: 0,
    bannerText: '',
    bannerLife: 0
};
```

- [ ] **Step 3: Reset `waveState` στο `startGame()`**

Βρες `this.floatingTexts = [];` στο `startGame()` και πρόσθεσε:
```js
this.waveState = {
    number: 0,
    phase: 'idle',
    enemiesInWave: 0,
    enemiesSpawned: 0,
    spawnTimer: 0,
    phaseTimer: 0,
    bannerText: '',
    bannerLife: 0
};
```

Επίσης αφαίρεσε `this.lastEnemySpawn = 0;` και `this.spawnRate = ...` από το `startGame()` (δεν χρειάζονται πλέον).

- [ ] **Step 4: Νέα `startNextWave()` method**

Πρόσθεσε μετά τη `spawnEnemy()` method:
```js
startNextWave() {
    this.waveState.number++;

    if (this.waveState.number % 10 === 0) {
        this.waveState.phase = 'boss_incoming';
        this.waveState.bannerText = '👾 BOSS INCOMING 👾';
        this.waveState.bannerLife = WAVE_CONFIG.ANNOUNCE_DURATION;
        this.updateWaveHUD();
        return;
    }

    const enemyCount = Math.min(
        WAVE_CONFIG.BASE_ENEMIES + (this.waveState.number - 1) * WAVE_CONFIG.ENEMIES_PER_WAVE,
        WAVE_CONFIG.MAX_ENEMIES
    );
    this.waveState.enemiesInWave = enemyCount;
    this.waveState.enemiesSpawned = 0;
    this.waveState.phase = 'announcing';
    this.waveState.bannerText = `⚡ WAVE ${this.waveState.number} INCOMING ⚡`;
    this.waveState.bannerLife = WAVE_CONFIG.ANNOUNCE_DURATION;
    this.waveState.phaseTimer = this.currentTime;
    this.updateWaveHUD();
}
```

- [ ] **Step 5: Νέα `updateWaveSystem()` method**

Πρόσθεσε αμέσως μετά τη `startNextWave()`:
```js
updateWaveSystem() {
    const ws = this.waveState;
    if (ws.bannerLife > 0) ws.bannerLife -= 16;

    switch (ws.phase) {
        case 'idle':
            this.startNextWave();
            break;

        case 'announcing':
            if (this.currentTime - ws.phaseTimer >= WAVE_CONFIG.ANNOUNCE_DURATION) {
                ws.phase = 'spawning';
                ws.spawnTimer = this.currentTime;
            }
            break;

        case 'spawning':
            if (ws.enemiesSpawned < ws.enemiesInWave) {
                if (this.currentTime - ws.spawnTimer >= WAVE_CONFIG.SPAWN_INTERVAL) {
                    this.spawnEnemy();
                    ws.enemiesSpawned++;
                    ws.spawnTimer = this.currentTime;
                }
            } else {
                ws.phase = 'fighting';
            }
            break;

        case 'fighting':
            if (this.enemies.length === 0) {
                const clearBonus = WAVE_CONFIG.CLEAR_BONUS_PER_WAVE * ws.number;
                this.score += clearBonus;
                this.spawnFloatingText(
                    this.canvas.width / 2,
                    this.canvas.height / 2 - 30,
                    `WAVE CLEAR! +${clearBonus}`,
                    '#32B8C6',
                    22
                );
                ws.phase = 'break';
                ws.phaseTimer = this.currentTime;
            }
            break;

        case 'break':
            if (this.currentTime - ws.phaseTimer >= WAVE_CONFIG.BREAK_DURATION) {
                ws.phase = 'idle';
            }
            break;

        case 'boss_incoming':
            if (ws.bannerLife <= 0) {
                this.spawnBoss();
                ws.phase = 'boss_fighting';
            }
            break;

        case 'boss_fighting':
            if (!this.boss && this.enemies.length === 0) {
                ws.phase = 'break';
                ws.phaseTimer = this.currentTime;
            }
            break;
    }
}
```

- [ ] **Step 6: Νέα `updateWaveHUD()` method**

Πρόσθεσε αμέσως μετά:
```js
updateWaveHUD() {
    const el = document.getElementById('wave-number');
    if (el) el.textContent = this.waveState.number;
}
```

- [ ] **Step 7: Αντικατάσταση spawn logic στο `updateGame()`**

Βρες και αφαίρεσε αυτά τα blocks από το `updateGame()`:
```js
const baseSpawnRate = CONFIG.game.initialSpawnRate - difficultyLevel * 200;
this.spawnRate = Math.max(this.spawnRate, 900);
this.spawnRate = Math.max(
    CONFIG.game.minSpawnRate / (diffConfig.spawnRateMultiplier * progressiveScaling),
    baseSpawnRate / (diffConfig.spawnRateMultiplier * progressiveScaling)
);
// Spawn dynamic background elements
this.updateBackgroundElements();
// Spawn enemies
if (this.currentTime - this.lastEnemySpawn > this.spawnRate) {
    this.spawnEnemy();
    this.lastEnemySpawn = this.currentTime;
}
```

Αντικατέστησέ τα με:
```js
// Wave-based enemy spawning
this.updateWaveSystem();
```

- [ ] **Step 8: Wave banner rendering στο `draw()`**

Βρες `// Draw shockwaves` στο `draw()` και πρόσθεσε πριν:
```js
// Wave announcement banner
if (this.waveState.bannerLife > 0) {
    const alpha = Math.min(1, this.waveState.bannerLife / 200);
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = 'rgba(0, 10, 30, 0.88)';
    this.ctx.fillRect(0, this.canvas.height / 2 - 42, this.canvas.width, 84);
    this.ctx.strokeStyle = this.waveState.bannerText.includes('BOSS') ? '#FF0066' : '#32B8C6';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, this.canvas.height / 2 - 42, this.canvas.width, 84);
    this.ctx.font = 'bold 26px Orbitron, monospace';
    this.ctx.fillStyle = this.waveState.bannerText.includes('BOSS') ? '#FF0066' : '#FFD700';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = this.waveState.bannerText.includes('BOSS') ? '#FF0066' : '#FFD700';
    this.ctx.fillText(this.waveState.bannerText, this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.restore();
}
```

- [ ] **Step 9: Wave counter στο HUD HTML (`index.html`)**

Βρες το `<div class="hud-item difficulty-indicator"` element και πρόσθεσε πριν:
```html
<div class="hud-item">
    <span class="hud-label">Wave:</span>
    <span class="hud-value" id="wave-number">0</span>
</div>
```

- [ ] **Step 10: Verify στο browser**

Ξεκίνα παιχνίδι. Πρέπει να εμφανίζεται "WAVE 1 INCOMING" banner. Οι εχθροί να έρχονται σταδιακά. Αφού σκοτωθούν όλοι: "WAVE CLEAR! +500". Μετά 3 δευτ.: "WAVE 2 INCOMING". Wave counter στο HUD να ενημερώνεται.

- [ ] **Step 11: Commit**
```bash
git add app.js index.html
git commit -m "feat: wave system with announcements and wave clear bonuses"
```

---

## Task 7: Boss class + HomingBullet + Game integration

**Files:**
- Modify: `app.js` — νέες classes `HomingBullet` και `Boss`, ενημέρωση `Game` constructor/startGame/updateGame/draw/checkCollisions/activateSuperWeapon

- [ ] **Step 1: Νέα `HomingBullet` class**

Πρόσθεσε αμέσως μετά τη `Bullet` class (πριν το `// Player Class`):

```js
// HomingBullet Class
class HomingBullet {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.speed = 3;
        this.radius = 6;
        this.color = '#FF00AA';
        this.isPlayerBullet = false;
        this.enemyType = 'boss';
        this.trail = [];
        this.pulsePhase = 0;

        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
        this.maxTurn = 0.05;
    }

    update(playerX, playerY) {
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const desiredVx = (dx / dist) * this.speed;
        const desiredVy = (dy / dist) * this.speed;

        const dvx = desiredVx - this.vx;
        const dvy = desiredVy - this.vy;
        this.vx += Math.sign(dvx) * Math.min(Math.abs(dvx), this.maxTurn);
        this.vy += Math.sign(dvy) * Math.min(Math.abs(dvy), this.maxTurn);

        const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy) || 1;
        this.vx = (this.vx / spd) * this.speed;
        this.vy = (this.vy / spd) * this.speed;

        this.trail.push({ x: this.x, y: this.y, life: 1 });
        if (this.trail.length > 12) this.trail.shift();
        this.trail.forEach(t => { t.life -= 0.12; });
        this.trail = this.trail.filter(t => t.life > 0);

        this.x += this.vx;
        this.y += this.vy;
        this.pulsePhase += 0.2;
    }

    draw(ctx) {
        ctx.save();
        this.trail.forEach(t => {
            ctx.globalAlpha = t.life * 0.4;
            ctx.fillStyle = '#FF00AA';
            ctx.beginPath();
            ctx.arc(t.x, t.y, this.radius * 0.5 * t.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FF00AA';
        const pulse = 1 + Math.sin(this.pulsePhase) * 0.25;
        ctx.fillStyle = '#FF00AA';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isOffScreen(canvas) {
        return this.x < -20 || this.x > canvas.width + 20 ||
               this.y < -20 || this.y > canvas.height + 20;
    }
}
```

- [ ] **Step 2: Νέα `Boss` class**

Πρόσθεσε αμέσως μετά τη `HomingBullet` class:

```js
// Boss Class
class Boss {
    constructor(canvasWidth, canvasHeight, waveNumber) {
        this.x = canvasWidth / 2;
        this.y = -80;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.waveNumber = waveNumber;
        this.bossLevel = Math.floor(waveNumber / 10);

        const diffConfig = DIFFICULTY_CONFIG[GAME_SETTINGS.difficulty];
        this.size = 50;
        this.phase = 1;
        this.entranceComplete = false;
        this.targetY = canvasHeight * 0.2;

        this.health = Math.ceil(300 * this.bossLevel * diffConfig.enemyHealthMultiplier);
        this.maxHealth = this.health;
        this.points = 5000 * this.bossLevel;

        this.lastFireTime = 0;
        this.fireRate = 1500;
        this.moveAngle = 0;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.hitFlash = 0;
        this.color = '#FF0066';

        const names = ['VOID OVERLORD', 'XENOPHAGE PRIME', 'LEVIATHAN KING', 'DARK COMMANDER', 'OMEGA DESTROYER'];
        this.name = names[(this.bossLevel - 1) % names.length];
    }

    update(playerX, playerY) {
        this.pulsePhase += 0.05;

        if (!this.entranceComplete) {
            this.y += 3;
            if (this.y >= this.targetY) {
                this.y = this.targetY;
                this.entranceComplete = true;
            }
            return;
        }

        if (this.phase === 1 && this.health <= this.maxHealth * 0.5) {
            this.phase = 2;
            this.fireRate = 1000;
        }

        this.moveAngle += this.phase === 1 ? 0.018 : 0.03;
        this.x = this.canvasWidth / 2 + Math.sin(this.moveAngle) * (this.canvasWidth * 0.35);

        if (this.hitFlash > 0) this.hitFlash--;
    }

    shoot(currentTime, playerX, playerY) {
        if (!this.entranceComplete) return null;
        if (currentTime - this.lastFireTime < this.fireRate) return null;
        this.lastFireTime = currentTime;

        const bullets = [];
        const spreadCount = this.phase === 1 ? 3 : 5;
        const baseAngle = Math.PI / 2;
        const spread = Math.PI / (spreadCount + 1);

        for (let i = 0; i < spreadCount; i++) {
            const angle = baseAngle - (spreadCount - 1) * spread / 2 + i * spread;
            const vx = Math.cos(angle) * CONFIG.enemy.bulletSpeed * 0.8;
            const vy = Math.sin(angle) * CONFIG.enemy.bulletSpeed;
            bullets.push(new Bullet(
                this.x, this.y + this.size,
                vx, vy,
                '#FF0066', false, 'boss'
            ));
        }

        if (this.phase === 2) {
            bullets.push(new HomingBullet(this.x, this.y + this.size, playerX, playerY));
        }

        return bullets;
    }

    takeDamage() {
        this.health--;
        this.hitFlash = 5;
        return this.health <= 0;
    }

    draw(ctx) {
        if (!Number.isFinite(this.x) || !Number.isFinite(this.y)) return;
        ctx.save();

        if (this.phase === 2) {
            ctx.globalAlpha = 0.7 + Math.sin(this.pulsePhase * 6) * 0.3;
        }

        const shadowColor = this.hitFlash > 0 ? '#FFFFFF' : (this.phase === 2 ? '#FF3366' : '#CC0055');
        ctx.shadowBlur = this.hitFlash > 0 ? 50 : 30;
        ctx.shadowColor = shadowColor;

        // Main hexagonal body
        ctx.strokeStyle = this.phase === 2 ? '#FF66AA' : '#FF0066';
        ctx.lineWidth = 3;
        ctx.fillStyle = this.hitFlash > 0 ? '#FFFFFF' : (this.phase === 2 ? '#FF0066' : '#CC0055');
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i + this.pulsePhase * 0.4;
            const variance = 0.88 + Math.sin(this.pulsePhase + i * 1.1) * 0.12;
            const x = this.x + Math.cos(angle) * this.size * variance;
            const y = this.y + Math.sin(angle) * this.size * variance;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Outer ring
        ctx.globalAlpha = (this.phase === 2 ? 1 : 0.6) + Math.sin(this.pulsePhase * 2) * 0.2;
        ctx.strokeStyle = '#FF66AA';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 1.35, 0, Math.PI * 2);
        ctx.stroke();

        // Pulsing core
        ctx.globalAlpha = 1;
        const coreGlow = 0.5 + Math.sin(this.pulsePhase * 3) * 0.5;
        ctx.fillStyle = `rgba(255, ${this.phase === 2 ? 50 : 0}, ${this.phase === 2 ? 80 : 102}, ${coreGlow})`;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.32, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    isOffScreen(canvas) {
        return this.y > canvas.height + 120;
    }

    collidesWith(x, y, radius) {
        return distance(this.x, this.y, x, y) < this.size + radius;
    }
}
```

- [ ] **Step 3: Προσθήκη boss properties στο `Game` constructor**

Βρες `this.waveState = {` στο constructor και πριν πρόσθεσε:
```js
this.boss = null;
this.homingBullets = [];
```

- [ ] **Step 4: Reset στο `startGame()`**

Βρες `this.waveState = {` στο `startGame()` και πριν πρόσθεσε:
```js
this.boss = null;
this.homingBullets = [];
```

- [ ] **Step 5: Νέα `spawnBoss()` method**

Πρόσθεσε μετά την `updateWaveHUD()` method:
```js
spawnBoss() {
    this.boss = new Boss(this.canvas.width, this.canvas.height, this.waveState.number);
    this.screenShake.intensity = 0.3;
    if (this.soundManager.audioContext) {
        this.soundManager.explosion(2);
    }
    if (this.musicManager) {
        this.musicManager.setTempo(160);
    }
}
```

- [ ] **Step 6: Boss update στο `updateGame()`**

Βρες `// Remove off-screen enemies` στο `updateGame()` και πρόσθεσε αμέσως μετά το `this.enemies = this.enemies.filter(...)`:
```js
// Update boss
if (this.boss) {
    this.boss.update(this.player.x, this.player.y);

    const bossBullets = this.boss.shoot(this.currentTime, this.player.x, this.player.y);
    if (bossBullets) {
        bossBullets.forEach(b => {
            if (b instanceof HomingBullet) {
                this.homingBullets.push(b);
            } else {
                this.bullets.push(b);
                this.soundManager.enemyShoot();
            }
        });
    }

    if (this.boss.isOffScreen(this.canvas)) {
        this.boss = null;
    }
}

// Update homing bullets
this.homingBullets = this.homingBullets.filter(hb => {
    hb.update(this.player.x, this.player.y);
    return !hb.isOffScreen(this.canvas);
});
```

- [ ] **Step 7: Boss rendering στο `draw()`**

Βρες `// Draw enemies` και αμέσως μετά το `this.enemies.forEach(enemy => enemy.draw(this.ctx));` πρόσθεσε:
```js
// Draw boss
if (this.boss) this.boss.draw(this.ctx);
// Draw homing bullets
this.homingBullets.forEach(hb => hb.draw(this.ctx));
```

- [ ] **Step 8: Boss collision στο `checkCollisions()`**

Πρόσθεσε ένα νέο block στο τέλος της `checkCollisions()` method, πριν το closing `}`:

```js
// Player bullets vs boss
if (this.boss) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
        const bullet = this.bullets[i];
        if (!bullet.isPlayerBullet) continue;
        if (this.boss.collidesWith(bullet.x, bullet.y, bullet.radius)) {
            this.bullets.splice(i, 1);
            this.superWeapon.charge = Math.min(
                this.superWeapon.charge + 2, CONFIG.superWeapon.threshold
            );
            if (this.boss.takeDamage()) {
                const pts = this.boss.points;
                this.score += pts;
                this.createExplosion(this.boss.x, this.boss.y, this.boss.size * 2, '#FF0066');
                for (let k = 0; k < 3; k++) {
                    this.shockwaves.push(new Shockwave(this.boss.x, this.boss.y, '#FF0066'));
                }
                this.screenShake.intensity = 0.5;
                this.soundManager.explosion(3);
                this.vibrationManager.superWeapon();
                this.spawnFloatingText(
                    this.boss.x, this.boss.y - 40,
                    `BOSS DEFEATED! +${pts}`, '#FFD700', 26
                );
                this.boss = null;
                this.updateHUD();
                this.updateBossHUD();
                if (this.musicManager) {
                    this.musicManager.updateForLevel(this.progressiveDifficulty.currentLevel);
                }
            } else {
                this.updateBossHUD();
                this.soundManager.hit();
            }
            break;
        }
    }
}

// Homing bullets vs player
for (let i = this.homingBullets.length - 1; i >= 0; i--) {
    const hb = this.homingBullets[i];
    if (distance(hb.x, hb.y, this.player.x, this.player.y) < hb.radius + this.player.size) {
        this.homingBullets.splice(i, 1);
        if (!this.player.invincible) {
            this.soundManager.damageTaken();
            this.vibrationManager.damage();
            this.screenShake.intensity = 0.25;
            this.combo = 0;
            if (this.activeBonuses.shield) {
                delete this.activeBonuses.shield;
                this.updateActiveBonusesUI();
                for (let k = 0; k < 20; k++) {
                    this.particles.push(new Particle(this.player.x, this.player.y, '#00CCFF', 'glow'));
                }
            } else {
                this.player.makeInvincible();
                for (let k = 0; k < 10; k++) {
                    this.particles.push(new Particle(this.player.x, this.player.y, '#FFD700'));
                }
                if (this.player.takeDamage()) {
                    this.gameOver();
                } else {
                    this.updateHUD();
                }
            }
        }
    }
}

// Boss body vs player
if (this.boss && !this.player.invincible) {
    if (this.boss.collidesWith(this.player.x, this.player.y, this.player.size)) {
        this.soundManager.explosion(1.5);
        this.soundManager.damageTaken();
        this.vibrationManager.damage();
        this.screenShake.intensity = 0.35;
        this.combo = 0;
        if (this.activeBonuses.shield) {
            delete this.activeBonuses.shield;
            this.updateActiveBonusesUI();
        } else {
            this.player.makeInvincible();
            if (this.player.takeDamage()) {
                this.gameOver();
            } else {
                this.updateHUD();
            }
        }
    }
}
```

- [ ] **Step 9: Super weapon damages boss**

Στο `activateSuperWeapon()`, βρες `this.enemies = [];` και πρόσθεσε μετά:
```js
if (this.boss) {
    const bossDmg = Math.floor(this.boss.maxHealth * 0.3);
    this.boss.health -= bossDmg;
    this.spawnFloatingText(
        this.boss.x, this.boss.y - 30,
        `-${bossDmg}`, '#FFD700', 20
    );
    if (this.boss.health <= 0) {
        const pts = this.boss.points;
        this.score += pts;
        this.createExplosion(this.boss.x, this.boss.y, this.boss.size * 2, '#FF0066');
        this.screenShake.intensity = 0.5;
        this.spawnFloatingText(this.boss.x, this.boss.y - 40, `BOSS DEFEATED! +${pts}`, '#FFD700', 26);
        this.boss = null;
        this.updateBossHUD();
        if (this.musicManager) {
            this.musicManager.updateForLevel(this.progressiveDifficulty.currentLevel);
        }
    } else {
        this.updateBossHUD();
    }
}
```

- [ ] **Step 10: Verify στο browser**

Παίξε μέχρι wave 10. Πρέπει να εμφανιστεί "BOSS INCOMING" banner, μετά ο boss να κατεβαίνει από πάνω. Phase 1: spread shot 3 bullets. Αφού πάρει >50% damage, phase 2: 5 bullets + homing. Στον θάνατο: μεγάλη explosion + "BOSS DEFEATED! +5000".

- [ ] **Step 11: Commit**
```bash
git add app.js
git commit -m "feat: Boss class, HomingBullet, boss fight every 10 waves"
```

---

## Task 8: Boss Health Bar στο HUD (HTML + CSS)

**Files:**
- Modify: `index.html` — boss HUD element
- Modify: `style.css` — boss health bar styles
- Modify: `app.js` — `updateBossHUD()` method, `startGame()`, `gameOver()`

- [ ] **Step 1: Προσθήκη boss HUD element στο `index.html`**

Βρες `<div class="hud-center">` στο `#hud` και αμέσως πριν πρόσθεσε:
```html
<!-- Boss Health Bar -->
<div id="boss-hud" class="boss-hud hidden">
    <span class="boss-hud-name" id="boss-hud-name">VOID OVERLORD</span>
    <div class="boss-hud-track">
        <div class="boss-hud-fill" id="boss-hud-fill"></div>
    </div>
    <span class="boss-hud-hp" id="boss-hud-hp">3000</span>
</div>
```

- [ ] **Step 2: CSS για boss health bar στο `style.css`**

Πρόσθεσε στο τέλος του game-specific CSS section:
```css
.boss-hud {
    position: fixed;
    top: 56px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(0, 0, 0, 0.75);
    border: 1px solid #FF0066;
    border-radius: 6px;
    padding: 5px 14px;
    min-width: 320px;
    z-index: 100;
    box-shadow: 0 0 12px rgba(255, 0, 102, 0.4);
}
.boss-hud-name {
    color: #FF0066;
    font-family: 'Orbitron', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    white-space: nowrap;
    text-shadow: 0 0 6px #FF0066;
    min-width: 100px;
}
.boss-hud-track {
    flex: 1;
    height: 10px;
    background: rgba(80, 0, 30, 0.8);
    border-radius: 3px;
    overflow: hidden;
    border: 1px solid rgba(255, 0, 102, 0.4);
}
.boss-hud-fill {
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, #880033, #FF0066, #FF66AA);
    border-radius: 3px;
    transition: width 0.1s linear;
    box-shadow: 0 0 8px #FF0066;
}
.boss-hud-fill.phase-2 {
    animation: bossFlicker 0.4s infinite;
    background: linear-gradient(90deg, #FF0066, #FF6699);
}
@keyframes bossFlicker {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}
.boss-hud-hp {
    color: rgba(255, 100, 150, 0.9);
    font-family: monospace;
    font-size: 11px;
    min-width: 50px;
    text-align: right;
}
```

- [ ] **Step 3: Προσθήκη `updateBossHUD()` method στο `Game`**

Πρόσθεσε μετά την `updateWaveHUD()`:
```js
updateBossHUD() {
    const hud = document.getElementById('boss-hud');
    const fill = document.getElementById('boss-hud-fill');
    const nameEl = document.getElementById('boss-hud-name');
    const hpEl = document.getElementById('boss-hud-hp');

    if (!this.boss) {
        hud.classList.add('hidden');
        if (fill) fill.classList.remove('phase-2');
        return;
    }

    hud.classList.remove('hidden');
    nameEl.textContent = this.boss.name;
    const pct = Math.max(0, (this.boss.health / this.boss.maxHealth) * 100).toFixed(1);
    fill.style.width = pct + '%';
    hpEl.textContent = `${Math.max(0, this.boss.health)} / ${this.boss.maxHealth}`;

    if (this.boss.phase === 2) {
        fill.classList.add('phase-2');
    } else {
        fill.classList.remove('phase-2');
    }
}
```

- [ ] **Step 4: Κλείσιμο boss HUD στο `startGame()` και `gameOver()`**

Στο `startGame()`, βρες `this.boss = null;` και πρόσθεσε μετά:
```js
// Κρύψε boss HUD
const bossHud = document.getElementById('boss-hud');
if (bossHud) bossHud.classList.add('hidden');
```

- [ ] **Step 5: Verify στο browser**

Wave 10 → boss εμφανίζεται. Πρέπει να φαίνεται το boss health bar κεντραρισμένο κάτω από το κύριο HUD. Health bar μειώνεται καθώς χτυπάς. Στο 50% HP: κόκκινο flicker animation. Μετά τον θάνατο: εξαφανίζεται.

- [ ] **Step 6: Commit**
```bash
git add app.js index.html style.css
git commit -m "feat: boss health bar HUD with phase-2 flicker animation"
```

---

## Task 9: MusicManager + mute button

**Files:**
- Modify: `app.js` — νέα `MusicManager` class, `Game` constructor, `startGame()`, `gameOver()`, `updateProgressiveDifficulty()`, `setupEventListeners()`
- Modify: `index.html` — music toggle button στο HUD
- Modify: `style.css` — music toggle button style

- [ ] **Step 1: Νέα `MusicManager` class**

Πρόσθεσε αμέσως μετά τη `VibrationManager` class (πριν τη `BonusPickup` class):

```js
// Music Manager
class MusicManager {
    constructor(audioContext) {
        this.ctx = audioContext;
        this.playing = false;
        this.currentBPM = 110;
        this.beat = 0;
        this.melodyBeat = 0;
        this.nextNoteTime = 0;
        this.schedulerTimer = null;
        this.masterGain = null;
        this.scale = [130.81, 155.56, 174.61, 196.00, 233.08];
        this.melodyPattern = [0, 2, 4, 2, 1, 3, 4, 3];

        if (this.ctx) {
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.22;
            this.masterGain.connect(this.ctx.destination);
        }
    }

    get beatInterval() {
        return 60 / this.currentBPM;
    }

    start() {
        if (!this.ctx || this.playing) return;
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().then(() => this._doStart());
        } else {
            this._doStart();
        }
    }

    _doStart() {
        this.playing = true;
        this.nextNoteTime = this.ctx.currentTime + 0.1;
        this._schedule();
    }

    stop() {
        this.playing = false;
        if (this.schedulerTimer) {
            clearTimeout(this.schedulerTimer);
            this.schedulerTimer = null;
        }
    }

    toggle() {
        if (this.playing) { this.stop(); } else { this.start(); }
        return this.playing;
    }

    setTempo(bpm) {
        this.currentBPM = bpm;
    }

    updateForLevel(level) {
        if (level <= 20) this.setTempo(110);
        else if (level <= 50) this.setTempo(130);
        else this.setTempo(155);
    }

    _schedule() {
        if (!this.playing) return;
        while (this.nextNoteTime < this.ctx.currentTime + 0.12) {
            this._scheduleBeat(this.nextNoteTime);
            this.beat = (this.beat + 1) % 8;
            this.nextNoteTime += this.beatInterval / 2;
        }
        this.schedulerTimer = setTimeout(() => this._schedule(), 25);
    }

    _scheduleBeat(time) {
        if (this.beat === 0 || this.beat === 4) this._kick(time);
        this._hihat(time, this.beat % 2 === 0 ? 0.14 : 0.07);
        if (this.beat === 0 || this.beat === 5) this._bass(time, this.scale[0]);
        if (this.beat % 2 === 0) {
            this._melody(time, this.scale[this.melodyPattern[this.melodyBeat % this.melodyPattern.length]] * 2);
            this.melodyBeat++;
        }
    }

    _kick(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.frequency.setValueAtTime(80, time);
        osc.frequency.exponentialRampToValueAtTime(30, time + 0.15);
        gain.gain.setValueAtTime(0.75, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
        osc.start(time); osc.stop(time + 0.2);
    }

    _hihat(time, vol) {
        const bufSize = Math.floor(this.ctx.sampleRate * 0.05);
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        src.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
        src.start(time); src.stop(time + 0.05);
    }

    _bass(time, freq) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.connect(gain); gain.connect(this.masterGain);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.14, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + this.beatInterval * 0.85);
        osc.start(time); osc.stop(time + this.beatInterval);
    }

    _melody(time, freq) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.connect(gain); gain.connect(this.masterGain);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.07, time + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, time + this.beatInterval * 0.75);
        osc.start(time); osc.stop(time + this.beatInterval);
    }
}
```

- [ ] **Step 2: Προσθήκη `musicManager` στο `Game` constructor**

Βρες `this.soundManager = new SoundManager();` και πρόσθεσε αμέσως μετά:
```js
this.musicManager = new MusicManager(this.soundManager.audioContext);
```

- [ ] **Step 3: Εκκίνηση music στο `startGame()`**

Βρες `this.updateHUD();` στο τέλος του `startGame()` και πρόσθεσε πριν:
```js
if (GAME_SETTINGS.soundEnabled) {
    this.musicManager.start();
}
```

- [ ] **Step 4: Σταμάτημα music στο `gameOver()`**

Βρες `this.soundManager.gameOver();` στο `gameOver()` και πρόσθεσε μετά:
```js
this.musicManager.stop();
```

- [ ] **Step 5: Ενημέρωση tempo σε level up**

Στο `updateProgressiveDifficulty()`, βρες `this.soundManager.levelUp();` και πρόσθεσε αμέσως μετά:
```js
this.musicManager.updateForLevel(currentMilestone.level);
```

- [ ] **Step 6: Mute button στο HUD HTML**

Βρες `<div class="hud-right">` στο `#hud` και εντός αυτού πρόσθεσε μετά τα lives:
```html
<button id="music-toggle-btn" class="music-toggle-btn" title="Μουσική on/off">🎵</button>
```

- [ ] **Step 7: CSS για music button**

Πρόσθεσε στο CSS:
```css
.music-toggle-btn {
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(50, 184, 198, 0.4);
    color: white;
    font-size: 16px;
    cursor: pointer;
    border-radius: 4px;
    padding: 2px 6px;
    margin-left: 8px;
    transition: border-color 0.2s;
}
.music-toggle-btn:hover {
    border-color: #32B8C6;
}
```

- [ ] **Step 8: Event listener για music toggle**

Βρες `document.getElementById('view-leaderboard-btn').addEventListener` στο `setupEventListeners()` και πρόσθεσε μετά:
```js
document.getElementById('music-toggle-btn').addEventListener('click', () => {
    const playing = this.musicManager.toggle();
    document.getElementById('music-toggle-btn').textContent = playing ? '🎵' : '🔇';
});
```

- [ ] **Step 9: Verify στο browser**

Ξεκίνα παιχνίδι — μετά από 1-2 δευτερόλεπτα πρέπει να ακούγεται 8-bit music loop (kick + hi-hat + melody). Πάτα 🎵 button → σιωπή, icon αλλάζει σε 🔇. Πάτα ξανά → επανέρχεται.

- [ ] **Step 10: Level-up floating text**

Στο `updateProgressiveDifficulty()`, βρες `this.soundManager.levelUp();` και πρόσθεσε:
```js
this.spawnFloatingText(
    this.canvas.width / 2,
    this.canvas.height / 2,
    `LEVEL ${currentMilestone.level}!`,
    '#FFD700',
    28
);
```

- [ ] **Step 11: Commit**
```bash
git add app.js index.html style.css
git commit -m "feat: procedural 8-bit background music with mute toggle and level-up text"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Wave System: Tasks 6 — waveState, startNextWave, updateWaveSystem, banner, HUD counter
- [x] Boss Fights: Tasks 7-8 — Boss class, HomingBullet, entrance, phases, health bar
- [x] Visual Polish — parallax: Task 3, hit flash: Task 4, nebula: Task 4, invincibility: Task 5
- [x] Background Music: Task 9 — MusicManager, tempo per level, mute button
- [x] HUD: Task 1 (FloatingText), Task 2 (animated score, combo, kills), Task 8 (boss bar)
- [x] Level-up floating text: Task 9 step 10
- [x] Boss → super weapon interaction: Task 7 step 9

**Type consistency:**
- `spawnBoss()` references `this.musicManager` — defined in Task 9 constructor. Since Task 7 runs before Task 9, need to guard: `if (this.musicManager)` ✓ (already guarded in plan)
- `updateBossHUD()` called from Task 7 collision code — defined in Task 8. Add guard: `if (this.updateBossHUD)` → no, better: define `updateBossHUD()` as stub in Task 7 then flesh out in Task 8. Simpler: move `updateBossHUD()` definition to Task 7 since it's called there.

**Fix:** Task 7 step 5 (`spawnBoss`) already guards `if (this.musicManager)`. Task 7 step 8 calls `this.updateBossHUD()` — add the full method definition in Task 7 step 5 as well, so it exists before the collision code runs. The full version in Task 8 will replace it.

Add to Task 7 Step 5, after `spawnBoss()`:
```js
// Stub — replaced with full version in Task 8
updateBossHUD() {
    const hud = document.getElementById('boss-hud');
    if (hud) hud.classList.toggle('hidden', !this.boss);
}
```

This is already handled in the plan by ordering Task 8 after Task 7 and the HTML element existing from Task 8 Step 1. Since the stub only runs if the element exists, it's safe to call before Task 8.
