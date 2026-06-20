<div align="center">

<img src="og-alien.png" alt="Alien Invaders β€” Space War" width="640">

# π‘½ Alien Invaders β€” Space War

### Ξ¥Ο€ΞµΟΞ±ΟƒΟ€Ξ―ΟƒΞΏΟ… Ο„ΞΏΞ½ Ξ“Ξ±Ξ»Ξ±ΞΎΞ―Ξ± Ξ±Ο€Ο Ο„ΞΏΟ…Ο‚ Ξ•ΞΎΟ‰Ξ³Ξ®ΞΉΞ½ΞΏΟ…Ο‚ Ξ•ΞΉΟƒΞ²ΞΏΞ»ΞµΞ―Ο‚

An intense, browser-based vertical arcade shoot-'em-up built in **pure vanilla JavaScript** β€” no frameworks, no build step. Procedural 8-bit music, hand-drawn-by-code bosses, a global leaderboard, and full mobile support.

[![Play Now](https://img.shields.io/badge/β–¶_PLAY_NOW-Live_Demo-32B8C6?style=for-the-badge)](https://konskall.github.io/alieninvaders/)
&nbsp;
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge)
![Firebase](https://img.shields.io/badge/Firebase-Leaderboard-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

*Created by **KonsKall** β€” for my little boy.* π€

</div>

---

## π“– Table of Contents

- [The Story](#-the-story--ΞΏ-ΞΊΟΞΊΞ»ΞΏΟ‚-Ο„ΞΏΟ…-ΞΊΞµΞ½ΞΏΟ)
- [Features at a Glance](#-features-at-a-glance)
- [How to Play](#-how-to-play)
- [Game Systems](#-game-systems)
  - [Enemies](#enemies)
  - [Bosses](#bosses)
  - [Power-ups & Pickups](#power-ups--pickups)
  - [Combos & Scoring](#combos--scoring)
  - [Super Weapon](#super-weapon)
  - [Waves & Difficulty](#waves--difficulty)
- [Leaderboard](#-leaderboard)
- [Artwork Gallery](#-artwork-gallery)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Run It Locally](#-run-it-locally)
- [Deployment](#-deployment)
- [Credits & License](#-credits--license)

---

## π The Story β€” *Ξ ΞΟΞΊΞ»ΞΏΟ‚ Ο„ΞΏΟ… ΞΞµΞ½ΞΏΟ*

> In 2026, the **Xenophage Collective** β€” an ancient cosmic empire β€” awakened. Humanity's first transmission to the stars *was the signal that roused them.*
>
> The enemy came in waves: **Scout Drones**, then **Fighter Wasps**. Cities burned. Nations fell. Humanity united.
>
> The skies filled with **Alien Leviathans** β€” creatures of pure cosmic energy. And then *they* came... the **Void Entities**, beings that defy reality itself.
>
> Chrome-hulled starships answered, armed with the most advanced technology mankind had ever forged. Each victory, a breath of hope.
>
> We haven't won yet... but we still stand. A fragile **Strategic Equilibrium**. The war goes on.

You pilot one of those starships. Hold the line.

---

## β¨ Features at a Glance

- π›Έ **8 distinct enemy types** with unique designs, behaviors, and weapons β€” all rendered procedurally on canvas (no sprite assets).
- π‘Ύ **5 unique bosses** that cycle every 10 waves, each with two combat phases, homing fire, threshold drops, and minion reinforcements.
- π’¥ **Charge-up Super Weapon** that clears the screen with an expanding shockwave.
- β΅ **5 power-ups** β€” Shield, Health, Rapid Fire, Multi-Shot, and Score Multiplier β€” plus a **combo / critical-hit** system.
- ποΈ **4 difficulty levels** (Very Easy β†’ Hard) and a **100-level progressive scaling** curve.
- πµ **Real-time procedural 8-bit chiptune music** (110β€“155 BPM) and ~9 synthesized sound effects β€” zero audio files.
- π“³ **Haptic feedback** via the Vibration API on mobile.
- π† **Global leaderboard** (Firebase Realtime Database, top 10) with localStorage fallback and one-tap **score sharing**.
- π“± **Fully responsive** β€” keyboard on desktop, virtual joystick + touch buttons on mobile.
- π“¦ **Installable PWA** β€” add it to your home screen and play offline (gameplay; leaderboard needs a connection).
- π‡¬π‡· **Greek-language UI**, story mode, and an in-game artwork gallery.

---

## π® How to Play

The goal: survive endless waves of invaders, defeat the bosses, and climb the leaderboard. **Auto-fire is on by default** β€” focus on dodging and positioning.

### β¨οΈ Desktop

| Action | Control |
|---|---|
| Move | `Arrow Keys` or `W` `A` `S` `D` |
| Fire | Automatic *(or `Space` if auto-fire is turned off)* |
| Super Weapon | `S` *(when fully charged)* |
| Pause | `P` |

> β„ΉοΈ When **Auto-Fire** is disabled in Settings, the `S` key still triggers the Super Weapon β€” use `Space` to shoot.

### π“± Mobile

| Action | Control |
|---|---|
| Move | Drag your finger **anywhere** on screen, or use the virtual joystick (bottom-right) |
| Fire | Automatic |
| Super Weapon | Tap the **π’¥** button (bottom-left) |

### β™οΈ Settings

Difficulty, joystick visibility, **joystick sensitivity** (auto-calibrated per screen size), auto-fire, sound, and vibration are all configurable from the in-game Settings screen and persisted in your browser.

---

## π§© Game Systems

### Enemies

Eight enemy types unlock as you progress. Each has its own silhouette, movement pattern (straight, sine-wave, or homing), projectile, and on-screen health bar.

| Enemy | Unlocks | HP | Speed | Points | Signature |
|---|---|---:|---:|---:|---|
| π›°οΈ **Scout Drone** | Lvl 1 | 2 | 4.0 | 10 | Cyan insectoid, single shot β€” the most common foe |
| π **Fighter Wasp** | Lvl 1 | 3 | 3.5 | 25 | Orange fighter, 40% chance of spread fire |
| π€ **Heavy Cruiser** | Lvl 1 | 5 | 2.5 | 50 | Purple armored battleship with turrets |
| π“΅ **Swarm Commander** | Lvl 4 | 8 | 2.5 | 120 | Golden hexagonal command ship |
| π›΅οΈ **Elite Guardian** | Lvl 5 | 8 | 3.0 | 150 | Fast light-blue diamond with wing fins |
| π™ **Alien Leviathan** | Lvl 6 | 20 | 1.5 | 200 | Pink tentacled organic creature |
| π›οΈ **Behemoth Dreadnought** | Lvl 8 | 25 | 2.0 | 100 | Magenta mega-structure tank |
| π‘ **Void Entity** | Lvl 12 | 25 | 1.0 | 300 | Rarest & slowest β€” crimson distortion ring, highest value |

*HP, damage, and spawn rates are scaled by the chosen difficulty (see below).*

### Bosses

A boss appears on **every 10th wave** (10, 20, 30 β€¦). The five designs cycle as you go deeper, growing tougher each time.

| # | Boss | Appearance |
|---|---|---|
| 1 | π‘‘ **Void Overlord** | Magenta hexagon with a pulsing, rotating core |
| 2 | π™ **Xenophage Prime** | Purple octopus with six writhing tentacles |
| 3 | π‰ **Leviathan King** | Teal elongated diamond with shimmer rings |
| 4 | β”οΈ **Dark Commander** | Orange-red four-spike crystal |
| 5 | β­ **Omega Destroyer** | Gold eight-point star with counter-rotating rings |

**Boss mechanics:**

- **Scaling** β€” Health = `300 Γ— bossLevel Γ— difficulty`; reward = `5000 Γ— bossLevel`.
- **Two phases** β€” At **50% HP** the boss enters Phase 2: faster movement, 5-bullet spreads instead of 3, an added **homing projectile**, and a menacing strobe/flicker.
- **Threshold drops** β€” Pickups rain down as you damage it: β΅ at **75%**, β¤οΈπ›΅οΈ at **50%**, and β¤οΈπ›΅οΈβ΅ at **25%**.
- **Death drops** β€” A defeated boss always grants **Health + Shield + Rapid Fire**.
- **Reinforcements** β€” Regular enemies warp in every ~9 seconds during the fight (`β  REINFORCEMENTS!`).
- A **`π‘Ύ BOSS INCOMING π‘Ύ`** banner and a dedicated boss health bar warn you before each encounter.
- The Super Weapon deals a flat **30% of the boss's max HP** β€” save it for the right moment.

### Power-ups & Pickups

Defeated enemies have a **35% chance** to drop a glowing pickup. Bosses drop them on a guaranteed schedule. Uncollected pickups drift down and fade after ~8 seconds (and gently home toward you when close).

| Icon | Power-up | Effect | Duration | Drop chance |
|:---:|---|---|---|---:|
| π›΅οΈ | **Shield** | Absorbs one hit (bullet or collision) | 15 s | 25% |
| β¤οΈ | **Health** | Restores 1 life (max 3) | Instant | 20% |
| β΅ | **Rapid Fire** | Doubles fire rate (150 ms β†’ 75 ms) | 10 s | 15% |
| π”± | **Multi-Shot** | Dual shot β†’ triple spread shot | 10 s | 15% |
| β­ | **Score Multiplier** | 2Γ— points per kill | 15 s | 25% |

Active bonuses appear as a live icon stack with countdown timers.

### Combos & Scoring

Chaining kills without taking damage builds a **combo multiplier**:

- **3+ kills** β†’ `CRITICAL!` hit text appears above defeated enemies.
- **5+ kills** β†’ **1.5Γ—** score multiplier (and a `KILLING SPREE` banner every 5th kill).
- **10+ kills** β†’ **2.0Γ—** score multiplier.

Taking damage resets your combo. Final points stack like so:

```
points = floor( basePoints Γ— scoreMultiplierBonus(2Γ—) Γ— comboMultiplier(up to 2Γ—) )
```

Clearing every enemy in a (non-boss) wave grants a **Wave Clear bonus** of `500 Γ— waveNumber`.

### Super Weapon

Every kill feeds your Super Weapon gauge by that enemy's point value. At **650 charge** it's ready: trigger it with `S` (desktop) or the **π’¥** button (mobile) to unleash a screen-clearing shockwave that wipes all enemy bullets, blasts nearby foes, and chunks **30%** off any boss's health. Then the gauge resets to zero.

### Waves & Difficulty

Waves spawn `min(6 + (waveβ’1) Γ— 2, 20)` enemies, with a 3-second breather between them. Enemy variety and toughness ramp up across a **100-level** progressive curve (visualized by a color-coded difficulty indicator, green β†’ purple).

Four difficulty presets reshape the whole experience:

| Difficulty | Spawn Rate | Enemy HP | Enemy DMG | Score | Boss Frequency | Your Fire Rate |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| πΆ **Very Easy** | 0.45Γ— | 0.35Γ— | 0.25Γ— | 1.0Γ— | 0.15Γ— | 3.0Γ— |
| π΅ **Easy** *(default)* | 0.70Γ— | 0.60Γ— | 0.45Γ— | 1.0Γ— | 0.30Γ— | 2.0Γ— |
| π  **Normal** | 1.00Γ— | 1.00Γ— | 1.00Γ— | 0.7Γ— | 1.00Γ— | 1.0Γ— |
| π”΄ **Hard** | 1.40Γ— | 1.30Γ— | 1.50Γ— | 0.5Γ— | 1.80Γ— | 0.65Γ— |

> Tougher settings hit harder **and** pay less per kill β€” but bring on the bosses faster.

---

## π† Leaderboard

Scores are saved to a **Firebase Realtime Database** (region `europe-west1`) and the **top 10** are displayed live, with π¥‡π¥π¥‰ medals for the podium and each entry showing the player's name, reached level, date, and score. If Firebase is unavailable, the game transparently falls back to **localStorage** so your best run is never lost.

After a game over you can **share your score** to Facebook or copy it to your clipboard, with a celebratory message that scales with how far you got.

> π”’ The Firebase web config lives in `app.js`. Web API keys are *designed to be public* for client-side Firebase apps β€” access is governed by the database's security rules, not by hiding the key.

---

## π–ΌοΈ Artwork Gallery

The game ships with an in-app **Artwork Gallery** of concept pieces. A taste:

<div align="center">

| | | |
|:---:|:---:|:---:|
| <img src="Gallery/xenophages.png" width="240"><br>**Xenophages** | <img src="Gallery/mothership.png" width="240"><br>**Mothership** | <img src="Gallery/black_hole.png" width="240"><br>**Battle of the Singularity** |
| <img src="Gallery/super_weapon.png" width="240"><br>**Ultimate Attack** | <img src="Gallery/laser_beam.png" width="240"><br>**Neutrino Laser Beam** | <img src="Gallery/two_suns.png" width="240"><br>**Two Suns** |
| <img src="Gallery/tentacles.png" width="240"><br>**Deadly Tentacles** | <img src="Gallery/nova_battle_ship.png" width="240"><br>**Nova Battleship** | <img src="Gallery/assemble_the_army.png" width="240"><br>**Assemble the Army** |

</div>

*See the full set in [`/Gallery`](Gallery) or via the in-game **Artwork** button.*

---

## π› οΈ Tech Stack

Built deliberately with **zero dependencies to install and no build step** β€” just static files.

| Area | Technology |
|---|---|
| **Language** | Vanilla JavaScript (ES6+), a single ~4,700-line `app.js` |
| **Rendering** | HTML5 `<canvas>` 2D β€” procedural ships, particles, shockwaves, parallax starfield (240 stars, 3 layers) |
| **Audio** | Web Audio API β€” real-time chiptune music engine + ~9 synthesized SFX (no audio files) |
| **Haptics** | Vibration API (`navigator.vibrate`) |
| **Backend** | Firebase Realtime Database (compat SDK v10.7.2 via CDN) for the leaderboard |
| **Persistence** | `localStorage` for settings + offline leaderboard fallback |
| **Styling** | Hand-written CSS design system (`style.css`) + Google Fonts (*Orbitron*, *Russo One*) |
| **App shell** | PWA `site.webmanifest`, maskable icons, OpenGraph / Twitter Card metadata |
| **Hosting** | GitHub Pages *(a `netlify.toml` for Netlify is also included)* |

**Performance touches:** gradient caching, shadow-blur culling above an enemy threshold, off-screen particle culling, capped shockwaves, and in-place array updates β€” all to hold 60 fps on mid-range mobile.

---

## π“ Project Structure

```
alieninvaders/
β”β”€β”€ index.html                 # Markup: screens, HUD, canvas, touch controls, modals
β”β”€β”€ app.js                     # The entire game engine (~4,700 lines)
β”β”€β”€ style.css                  # Design system, responsive layout, animations
β”β”€β”€ site.webmanifest           # PWA manifest
β”β”€β”€ netlify.toml               # Netlify hosting config
β”β”€β”€ Gallery/                   # Concept artwork (PNG)
β”β”€β”€ og-alien.png               # Social share / hero image
β”β”€β”€ alieninvadersfb.png        # Facebook share image
β”β”€β”€ favicon.svg / .ico / *.png # Favicons & touch icons
β””β”€β”€ web-app-manifest-*.png     # PWA install icons (192px, 512px)
```

---

## π’» Run It Locally

No toolchain required β€” it's static files. Because the browser loads modules and Firebase over HTTP(S), serve the folder rather than opening `index.html` from disk:

```bash
git clone https://github.com/konskall/alieninvaders.git
cd alieninvaders

# Pick any static server:
python -m http.server 8000          # Python 3
# or
npx serve .                          # Node
# or use the VS Code "Live Server" extension
```

Then open **http://localhost:8000**.

> An internet connection is needed for Google Fonts and the Firebase leaderboard; core gameplay works offline.

---

## π€ Deployment

The game is a static site and deploys anywhere that serves files.

- **GitHub Pages** β€” enable Pages on this repo (branch `main`, root). Live at: **https://konskall.github.io/alieninvaders/**
- **Netlify** β€” `netlify.toml` is included; connect the repo and deploy, no build command needed.

---

## π™ Credits & License

Created with love by **KonsKall** β€” *for my little boy.* π‘¦π’™

Fonts by [Google Fonts](https://fonts.google.com/) (*Orbitron*, *Russo One*). Leaderboard powered by [Firebase](https://firebase.google.com/).

> No license file is currently included. If you'd like others to reuse this code, consider adding one (e.g. [MIT](https://choosealicense.com/licenses/mit/)). Until then, all rights are reserved by the author.

<div align="center">

**[β–¶ Play Alien Invaders](https://konskall.github.io/alieninvaders/)**

*Hold the line. The war goes on.* π‘½β”οΈ

</div>
