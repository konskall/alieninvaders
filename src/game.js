import { GAME_SETTINGS, DIFFICULTY_CONFIG, generateProgressiveDifficulty, PROGRESSIVE_DIFFICULTY, CONFIG, WAVE_CONFIG, SHADOW_OPTIMIZATION } from './config.js';
import { randomRange, distance, GradientCache } from './utils.js';
import { BonusPickup } from './entities/BonusPickup.js';
import { Particle } from './entities/Particle.js';
import { Shockwave } from './entities/Shockwave.js';
import { FloatingText } from './entities/FloatingText.js';
import { Star } from './entities/Star.js';
import { Bullet } from './entities/Bullet.js';
import { HomingBullet } from './entities/HomingBullet.js';
import { Boss } from './entities/Boss.js';
import { Player } from './entities/Player.js';
import { Enemy } from './entities/Enemy.js';
import { LeaderboardManager } from './managers/LeaderboardManager.js';
import { SoundManager } from './managers/SoundManager.js';
import { VibrationManager } from './managers/VibrationManager.js';
import { MusicManager } from './managers/MusicManager.js';
import { GALLERY_ITEMS, GalleryManager } from './gallery.js';
import { CoopRoster } from './coop/CoopRoster.js';
// Main Game Class
export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        // Initialize gradient cache
        this.gradientCache = new GradientCache();
        // Initialize managers
		this.leaderboardManager = new LeaderboardManager();
        this.soundManager = new SoundManager();
        this.musicManager = new MusicManager(this.soundManager.audioContext);
        this.vibrationManager = new VibrationManager();
		 this.galleryManager = new GalleryManager();
        
        // Touch control state
        this.touchState = {
            joystickActive: false,
            joystickTouchId: null,
            joystickStartX: 0,
            joystickStartY: 0,
            joystickCurrentX: 0,
            joystickCurrentY: 0,
            directionX: 0,
            directionY: 0,
            dragTouchId: null,
            dragActive: false
        };
        
        this.superWeapon = {
            charge: 0,
            ready: false,
            active: false,
            activationTime: 0
        };
        
        this.shockwaves = [];
        this.floatingTexts = [];
        this.waveState = {
            number: 0,
            phase: 'idle',
            enemiesInWave: 0,
            enemiesSpawned: 0,
            spawnTimer: 0,
            phaseTimer: 0,
            bannerText: '',
            bannerLife: 0,
            bannerStartTime: 0,
            minionTimer: 0
        };
        this.boss = null;
        this.homingBullets = [];
        this.displayScore = 0;
        this.combo = 0;
        this.killCount = 0;
        this.screenShake = { x: 0, y: 0, intensity: 0 };

        // Dynamic background elements (DISABLED)
        this.backgroundElements = {
            planets: [],
            nebulae: [],
            asteroids: [],
            comets: []
        };
        this.lastElementSpawn = {
            planet: 0,
            nebula: 0,
            asteroid: 0,
            comet: 0
        };
        
        // Bonus pickup system
        this.bonusPickups = [];
        this.lastBonusSpawn = 0;
        this.activeBonuses = {};
        
        // Progressive difficulty tracking
        this.progressiveDifficulty = {
            currentLevel: 1,
            currentScaling: 1.0,
            currentMilestone: PROGRESSIVE_DIFFICULTY.milestones[0]
        };
        
        this.isMobileDevice = this.detectMobile();

        this.state = 'credits';
        this.settingsOpener = 'menu';
        this.score = 0;
        this.roster = new CoopRoster();
        this.mode = 'solo';   // 'solo' | 'coopHost' | 'coopGuest' (set by later phases)
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.stars = [];
        this.keys = {};
        this.currentTime = 0;
        this.gameStartTime = 0;
        
        // Show device-appropriate instructions
        this.updateInstructionsForDevice();

        this.initializeStars();
        this.setupEventListeners();
        this.loadSettings();
        this.gameLoop();
    }

    // Local player accessor — all existing `this.player.*` reads resolve here.
    // `this.player` is intentionally read-only now; assign via `this.roster`.
    get player() {
        return this.roster.local;
    }

    loadSettings() {
        // Calculate automatic sensitivity based on screen size
        this.calculateAutoSensitivity();
        
        // Setup sensitivity slider
        const sensitivitySlider = document.getElementById('sensitivity-slider');
        const sensitivityValue = document.getElementById('sensitivity-value');
        
        sensitivitySlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            GAME_SETTINGS.joystickSensitivity = value;
            sensitivityValue.textContent = value.toFixed(1) + 'x';
        });
        
        // Set initial value
        sensitivitySlider.value = GAME_SETTINGS.joystickSensitivity.toFixed(1);
        sensitivityValue.textContent = GAME_SETTINGS.joystickSensitivity.toFixed(1) + 'x';
        
        // Setup preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const value = parseFloat(btn.dataset.sensitivity);
                GAME_SETTINGS.joystickSensitivity = value;
                sensitivitySlider.value = value;
                sensitivityValue.textContent = value.toFixed(1) + 'x';
            });
        });
        
        // Show credits splash, then auto-transition to the menu (re-armable so
        // the menu logo can replay the intro).
        this.armCreditsAdvance();

        // Allow tap to skip — but ignore stray taps during the opening so the
        // cinematic intro (warp -> reveal -> title) always plays first.
        const creditsScreen = document.getElementById('credits-screen');
        creditsScreen.addEventListener('click', () => {
            if (this.state === 'credits' && Date.now() - this.creditsShownAt > 1500) {
                this.transitionFromCreditsToMenu();
            }
        });
        
        // Load settings from UI on game start
        document.getElementById('settings-start-btn').addEventListener('click', () => {
            GAME_SETTINGS.difficulty = document.getElementById('difficulty-select').value;
            GAME_SETTINGS.joystickVisible = document.getElementById('joystick-toggle').checked;
            GAME_SETTINGS.autoFire = document.getElementById('auto-fire-toggle').checked;
            GAME_SETTINGS.soundEnabled = document.getElementById('sound-toggle').checked;
            GAME_SETTINGS.vibrationEnabled = document.getElementById('vibration-toggle').checked;
            GAME_SETTINGS.joystickSensitivity = parseFloat(document.getElementById('sensitivity-slider').value);
            
            this.soundManager.enabled = GAME_SETTINGS.soundEnabled;
            this.vibrationManager.enabled = GAME_SETTINGS.vibrationEnabled;
            
            // Resume audio context on user interaction
            if (this.soundManager.audioContext && this.soundManager.audioContext.state === 'suspended') {
                this.soundManager.audioContext.resume();
            }
            
            this.returnFromSettings();
        });
		const difficultySelect = document.getElementById('difficulty-select')
  if (difficultySelect) {
    difficultySelect.value = GAME_SETTINGS.difficulty
  }
    }
    
    transitionFromCreditsToMenu() {
        if (this.state !== 'credits') return;

        document.getElementById('credits-screen').classList.add('hidden');
        this.showMenu();
    }

    armCreditsAdvance() {
        // (re)start the 10s auto-advance from the credits splash to the menu
        this.creditsShownAt = Date.now();
        const token = this.creditsShownAt;
        setTimeout(() => {
            if (this.state === 'credits' && this.creditsShownAt === token) {
                this.transitionFromCreditsToMenu();
            }
        }, 10000);
    }

    showCredits() {
        // Replay the cinematic splash (e.g. tapping the menu logo)
        this.state = 'credits';
        ['start-screen', 'settings-screen', 'game-over-screen', 'pause-screen', 'story-screen',
         'gallery-screen', 'hud', 'active-bonuses', 'touch-controls', 'leaderboard-modal']
            .forEach(id => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); });
        document.getElementById('credits-screen').classList.remove('hidden');
        if (window.replayCreditsSplash) window.replayCreditsSplash();
        this.armCreditsAdvance();
    }

    showMenu() {
        this.stopCoop();
        this._lastWasCoop = false;
        this.state = 'menu';
        ['game-over-screen', 'pause-screen', 'settings-screen', 'story-screen',
         'gallery-screen', 'coop-screen', 'hud', 'active-bonuses', 'touch-controls', 'leaderboard-modal']
            .forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('hidden');
            });
        const shareDialog = document.getElementById('share-dialog');
        if (shareDialog) shareDialog.remove();
        // Leaving any in-progress game: clear transient entities so the hub shows a clean starfield
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.shockwaves = [];
        this.floatingTexts = [];
        this.homingBullets = [];
        this.bonusPickups = [];
        this.boss = null;
        this.keys = {};
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

    setupCanvas() {
        const isMobile = this.isMobileDevice || ('ontouchstart' in window && window.innerWidth <= 1024);
        let width = window.innerWidth;
        let height = window.innerHeight;

        if (!isMobile) {
            const maxW = 750;
            width = Math.min(width, maxW);
        }

        // Logical (CSS-pixel) play area — all game logic and drawing use these.
        CONFIG.canvas.width = width;
        CONFIG.canvas.height = height;

        // Nebula gradients depend on size — rebuild them here, not every frame.
        this.buildNebulaGradients();

        // Back the canvas with a device-pixel-scaled buffer (crisp on Retina /
        // hi-DPI mobile), then scale the context so we keep drawing in logical px.
        const dpr = Math.min(window.devicePixelRatio || 1, 3);
        const c = this.canvas;
        c.width = Math.round(width * dpr);
        c.height = Math.round(height * dpr);
        c.style.width = width + 'px';
        c.style.height = height + 'px';
        c.style.position = 'absolute';
        c.style.left = '50%';
        c.style.top = '50%';
        c.style.transform = 'translate(-50%, -50%)';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Mobile perf: disable the costly shadowBlur glow on the HIGH-COUNT
        // entities (particles / bullets / enemies / homing) via CONFIG.lowFX
        // guards in their draw(). Player, boss, shield, pickups and HUD keep glow.
        CONFIG.lowFX = isMobile;

        // Keep an active boss aligned to the new logical size (it captured the old one).
        if (this.boss) {
            this.boss.canvasWidth = width;
            this.boss.canvasHeight = height;
        }
    }
    
    detectMobile() {
        const ua = navigator.userAgent;
        // iPadOS 13+ reports a desktop Safari UA; detect it via touch + Mac platform.
        const iPadOS = navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
            || iPadOS
            || (('ontouchstart' in window) && window.innerWidth <= 1024);
    }
    
    calculateAutoSensitivity() {
        // Calculate screen diagonal in pixels
        const width = window.innerWidth;
        const height = window.innerHeight;
        const diagonal = Math.sqrt(width * width + height * height);
        
        // OPTIMIZED: Maximum sensitivity for large screens (iPad)
        let autoMultiplier = 1.0;
        
        if (diagonal <= 600) {
            // Small screens (phones): 3.0x
            autoMultiplier = 3.0;
        } else if (diagonal <= 1024) {
            // Medium screens (tablets): 4.5x
            autoMultiplier = 4.5;
        } else {
            // Large screens (iPad Pro, desktop): 6.0x to 7.5x (MAXIMUM RESPONSIVENESS!)
            autoMultiplier = 6.0 + ((diagonal - 1024) / 800) * 1.5;
            autoMultiplier = Math.min(autoMultiplier, 7.5);
        }
        
        GAME_SETTINGS.autoSensitivityMultiplier = autoMultiplier;
        
        
        // Set optimal default sensitivity
        const adjustedDefault = 5.0;
        GAME_SETTINGS.joystickSensitivity = adjustedDefault;
        
        // Update slider and value display
        const slider = document.getElementById('sensitivity-slider');
        const valueDisplay = document.getElementById('sensitivity-value');
        if (slider) {
            slider.value = adjustedDefault.toFixed(1);
        }
        if (valueDisplay) {
            valueDisplay.textContent = adjustedDefault.toFixed(1) + 'x';
        }
    }
    
    updateInstructionsForDevice() {
        const desktopInstructions = document.getElementById('desktop-instructions');
        const mobileInstructions = document.getElementById('mobile-instructions');
        
        if (this.isMobileDevice) {
            desktopInstructions.classList.add('hidden');
            mobileInstructions.classList.remove('hidden');
        } else {
            desktopInstructions.classList.remove('hidden');
            mobileInstructions.classList.add('hidden');
        }
    }

    initializeStars() {
        this.stars = [];
        // Layer 0: far (slow, tiny, dim)
        for (let i = 0; i < 80; i++) {
            this.stars.push(new Star(
                Math.random() * CONFIG.canvas.width,
                Math.random() * CONFIG.canvas.height,
                randomRange(0.3, 0.7),
                0.1,
                0
            ));
        }
        // Layer 1: mid
        for (let i = 0; i < 80; i++) {
            this.stars.push(new Star(
                Math.random() * CONFIG.canvas.width,
                Math.random() * CONFIG.canvas.height,
                randomRange(0.7, 1.4),
                0.3,
                1
            ));
        }
        // Layer 2: near (fast, large, bright)
        for (let i = 0; i < 80; i++) {
            this.stars.push(new Star(
                Math.random() * CONFIG.canvas.width,
                Math.random() * CONFIG.canvas.height,
                randomRange(1.2, 2.2),
                0.6,
                2
            ));
        }
    }

    setupEventListeners() {
        // Initialize audio on first user interaction (iOS requirement)
        this.setupAudioInitialization();
        
        // Touch controls setup
        this.setupTouchControls();
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === ' ' && this.state === 'playing') {
                e.preventDefault();
            }
            
            // Super weapon activation with E key (S is the WASD "move down" key)
            if ((e.key === 'e' || e.key === 'E') && this.state === 'playing' && this.superWeapon.ready && !this.superWeapon.active) {
                this.activateSuperWeapon();
            }
            
            // Manual fire with Spacebar when auto-fire is OFF
            if (e.key === ' ' && this.state === 'playing' && !GAME_SETTINGS.autoFire) {
                this.keys['fire'] = true;
            }
            
            if ((e.key === 'p' || e.key === 'P') && this.state === 'playing') {
                this.pauseGame();
            } else if ((e.key === 'p' || e.key === 'P') && this.state === 'paused') {
                this.resumeGame();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            
            if (e.key === ' ') {
                this.keys['fire'] = false;
            }
        });

        // Start button
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });

        // Restart button
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });

        // Game over settings button
        document.getElementById('game-over-settings-btn').addEventListener('click', () => {
            this.goToSettings();
        });
        
        // Share score button
        document.getElementById('share-score-btn').addEventListener('click', () => {
            this.showShareDialog();
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
        
        // Prevent default touch behaviors ONLY during gameplay, so menus, the
        // leaderboard, gallery and story screens can still scroll on touch devices.
        document.addEventListener('touchmove', (e) => {
            if (this.state === 'playing') e.preventDefault();
        }, { passive: false });
		 this.setupStoryModeListeners();
		 
		 document.getElementById('view-leaderboard-btn').addEventListener('click', () => {
    this.showLeaderboardModal();
});
        // Main-menu hub buttons
        document.getElementById('menu-leaderboard-btn').addEventListener('click', () => {
            this.showLeaderboardModal();
        });
        document.getElementById('menu-settings-btn').addEventListener('click', () => {
            this.openSettings('menu');
        });
        const coopBtn = document.getElementById('coop-btn');
        if (coopBtn) coopBtn.addEventListener('click', () => { if (this.coopLobby) this.coopLobby.show(); });
        // Tap the menu logo to replay the cinematic intro
        const menuBrand = document.getElementById('menu-brand-btn');
        if (menuBrand) {
            menuBrand.addEventListener('click', () => this.showCredits());
            menuBrand.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.showCredits(); }
            });
        }

        // Pause-screen buttons
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

        // Game Over menu button
        document.getElementById('game-over-menu-btn').addEventListener('click', () => {
            this.showMenu();
        });

        document.getElementById('music-toggle-btn').addEventListener('click', () => {
            const playing = this.musicManager.toggle();
            document.getElementById('music-toggle-btn').textContent = playing ? '🎵' : '🔇';
        });
    }
    
    setupAudioInitialization() {
        // Resume audio context on first user interaction (required for iOS)
        const resumeAudio = () => {
            if (this.soundManager.audioContext && !this.soundManager.initialized) {
                this.soundManager.ensureAudioContext();
            }
        };
        
        // Listen for any user interaction
        document.addEventListener('touchstart', resumeAudio, { once: false });
        document.addEventListener('click', resumeAudio, { once: false });
        document.addEventListener('keydown', resumeAudio, { once: false });
        
        // Also try to resume when game starts
        const startBtn = document.getElementById('start-btn');
        const settingsStartBtn = document.getElementById('settings-start-btn');
        
        startBtn.addEventListener('click', () => {
            if (this.soundManager.audioContext) {
                this.soundManager.audioContext.resume().then(() => {
                });
            }
        });
        
        settingsStartBtn.addEventListener('click', () => {
            if (this.soundManager.audioContext) {
                this.soundManager.audioContext.resume().then(() => {
                });
            }
        });
    }
    
    setupTouchControls() {
        const joystickBase = document.getElementById('joystick-base');
        const joystickStick = document.getElementById('joystick-stick');
        const superWeaponButton = document.getElementById('super-weapon-button');
        const touchControls = document.getElementById('touch-controls');
        const canvas = this.canvas;
        
        // Show touch controls on mobile or always if enabled
        if (this.isMobileDevice || CONFIG.touch.enabled) {
            // Controls will be shown when game starts
        }
        
        // Joystick touch handlers
        joystickBase.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.state !== 'playing') return;
            
            const touch = e.touches[0];
            this.touchState.joystickActive = true;
            this.touchState.joystickTouchId = touch.identifier;
            
            const rect = joystickBase.getBoundingClientRect();
            this.touchState.joystickStartX = rect.left + rect.width / 2;
            this.touchState.joystickStartY = rect.top + rect.height / 2;
            
            this.updateJoystickPosition(touch.clientX, touch.clientY);
            joystickStick.classList.add('active');
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            if (!this.touchState.joystickActive) return;
            
            for (let touch of e.touches) {
                if (touch.identifier === this.touchState.joystickTouchId) {
                    this.updateJoystickPosition(touch.clientX, touch.clientY);
                    break;
                }
            }
        });
        
        document.addEventListener('touchend', (e) => {
            for (let touch of e.changedTouches) {
                if (touch.identifier === this.touchState.joystickTouchId) {
                    this.resetJoystick();
                    break;
                }
            }
        });
        
        document.addEventListener('touchcancel', (e) => {
            for (let touch of e.changedTouches) {
                if (touch.identifier === this.touchState.joystickTouchId) {
                    this.resetJoystick();
                    break;
                }
            }
        });
        
        // Super weapon button touch handlers
        superWeaponButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.state !== 'playing') return;
            if (!this.superWeapon.ready || this.superWeapon.active) return;
            
            superWeaponButton.classList.add('active');
            this.activateSuperWeapon();
        }, { passive: false });

        superWeaponButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            superWeaponButton.classList.remove('active');
        }, { passive: false });
        
        // Drag anywhere on canvas for movement (and manual fire if auto-fire OFF)
        canvas.addEventListener('touchstart', (e) => {
            if (this.state !== 'playing') return;
            
            // Check if touch is not on joystick or super weapon button
            const touch = e.touches[0];
            const touchX = touch.clientX;
            const touchY = touch.clientY;
            
            const joystickRect = joystickBase.getBoundingClientRect();
            const superWeaponRect = superWeaponButton.getBoundingClientRect();
            
            const onJoystick = touchX >= joystickRect.left && touchX <= joystickRect.right &&
                              touchY >= joystickRect.top && touchY <= joystickRect.bottom;
            const onSuperWeapon = touchX >= superWeaponRect.left && touchX <= superWeaponRect.right &&
                                 touchY >= superWeaponRect.top && touchY <= superWeaponRect.bottom;
            
            if (!onJoystick && !onSuperWeapon && !this.touchState.dragActive) {
                this.touchState.dragActive = true;
                this.touchState.dragTouchId = touch.identifier;
                this.updateDragPosition(touchX, touchY);
                
                // Manual fire on touch if auto-fire is OFF
                if (!GAME_SETTINGS.autoFire) {
                    this.keys['fire'] = true;
                }
            }
        });
        
        canvas.addEventListener('touchmove', (e) => {
            if (!this.touchState.dragActive) return;
            
            for (let touch of e.touches) {
                if (touch.identifier === this.touchState.dragTouchId) {
                    this.updateDragPosition(touch.clientX, touch.clientY);
                    break;
                }
            }
        });
        
        canvas.addEventListener('touchend', (e) => {
            for (let touch of e.changedTouches) {
                if (touch.identifier === this.touchState.dragTouchId) {
                    this.touchState.dragActive = false;
                    this.touchState.dragTouchId = null;
                    this.touchState.directionX = 0;
                    this.touchState.directionY = 0;
                    
                    // Stop manual fire on touch end
                    if (!GAME_SETTINGS.autoFire) {
                        this.keys['fire'] = false;
                    }
                    break;
                }
            }
        });
    }
    
    updateDragPosition(touchX, touchY) {
        if (!this.player) return;
        
        // OPTIMIZED: Direct coordinate conversion with zero overhead
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = (touchX - rect.left) * (CONFIG.canvas.width / rect.width);
        const canvasY = (touchY - rect.top) * (CONFIG.canvas.height / rect.height);
        
        // OPTIMIZED: Direct direction calculation - instant response
        const dx = canvasX - this.player.x;
        const dy = canvasY - this.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // OPTIMIZED: Reduced dead zone for immediate response
        if (distance > 5) {
            // OPTIMIZED: Raw direction vector - no interpolation
            const baseDirX = dx / distance;
            const baseDirY = dy / distance;
            
            // OPTIMIZED: Apply maximum sensitivity with auto-boost
            const userSensitivity = GAME_SETTINGS.joystickSensitivity;
            const autoBoost = GAME_SETTINGS.autoSensitivityMultiplier;
            const totalSensitivity = userSensitivity * autoBoost * 0.25; // Optimized multiplier
            
            // OPTIMIZED: Direct assignment - no smoothing
            this.touchState.directionX = baseDirX * totalSensitivity;
            this.touchState.directionY = baseDirY * totalSensitivity;

            // Max move speed scales with the user's sensitivity setting, so the
            // slider has a real effect (default 5.0 -> 2.5, the previous feel).
            const maxMag = GAME_SETTINGS.joystickSensitivity * 0.5;
            const magnitude = Math.sqrt(this.touchState.directionX ** 2 + this.touchState.directionY ** 2);
            if (magnitude > maxMag) {
                this.touchState.directionX = (this.touchState.directionX / magnitude) * maxMag;
                this.touchState.directionY = (this.touchState.directionY / magnitude) * maxMag;
            }
        } else {
            this.touchState.directionX = 0;
            this.touchState.directionY = 0;
        }
    }
    
    updateJoystickPosition(touchX, touchY) {
        const joystickStick = document.getElementById('joystick-stick');
        
        // OPTIMIZED: Direct delta calculation
        let deltaX = touchX - this.touchState.joystickStartX;
        let deltaY = touchY - this.touchState.joystickStartY;
        
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = CONFIG.touch.joystickRadius;
        
        // OPTIMIZED: Minimal dead zone for instant response
        const adjustedDeadZone = CONFIG.touch.joystickDeadZone * 0.5;
        if (distance < adjustedDeadZone) {
            this.touchState.directionX = 0;
            this.touchState.directionY = 0;
            joystickStick.style.transform = 'translate(-50%, -50%)';
            return;
        }
        
        // Constrain to circle
        if (distance > maxDistance) {
            deltaX = (deltaX / distance) * maxDistance;
            deltaY = (deltaY / distance) * maxDistance;
        }
        
        // OPTIMIZED: Instant visual update
        joystickStick.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
        
        // OPTIMIZED: Raw normalized direction
        const baseDirX = deltaX / maxDistance;
        const baseDirY = deltaY / maxDistance;
        
        // OPTIMIZED: Maximum sensitivity with auto-boost
        const userSensitivity = GAME_SETTINGS.joystickSensitivity;
        const autoBoost = GAME_SETTINGS.autoSensitivityMultiplier;
        const totalSensitivity = userSensitivity * autoBoost * 0.2;
        
        this.touchState.directionX = baseDirX * totalSensitivity;
        this.touchState.directionY = baseDirY * totalSensitivity;

        // Max move speed scales with the user's sensitivity setting, so the
        // slider has a real effect (default 5.0 -> 2.0, the previous feel).
        const maxMag = GAME_SETTINGS.joystickSensitivity * 0.4;
        const magnitude = Math.sqrt(this.touchState.directionX ** 2 + this.touchState.directionY ** 2);
        if (magnitude > maxMag) {
            this.touchState.directionX = (this.touchState.directionX / magnitude) * maxMag;
            this.touchState.directionY = (this.touchState.directionY / magnitude) * maxMag;
        }
    }
    
    resetJoystick() {
        const joystickStick = document.getElementById('joystick-stick');
        
        this.touchState.joystickActive = false;
        this.touchState.joystickTouchId = null;
        this.touchState.directionX = 0;
        this.touchState.directionY = 0;
        
        joystickStick.style.transform = 'translate(-50%, -50%)';
        joystickStick.classList.remove('active');
    }

    startGame() {
        this.state = 'playing';
        this._lastWasCoop = false;
        this.keys = {};
        this.score = 0;
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.shockwaves = [];
        this.floatingTexts = [];
        this.waveState = {
            number: 0,
            phase: 'idle',
            enemiesInWave: 0,
            enemiesSpawned: 0,
            spawnTimer: 0,
            phaseTimer: 0,
            bannerText: '',
            bannerLife: 0,
            bannerStartTime: 0,
            minionTimer: 0
        };
        this.boss = null;
        this.homingBullets = [];
        const bossHud = document.getElementById('boss-hud');
        if (bossHud) bossHud.classList.add('hidden');
        this.updateWaveHUD();
        this.displayScore = 0;
        this.combo = 0;
        this.killCount = 0;
        this.bonusPickups = [];
        this.activeBonuses = {};
        CONFIG.player.fireRate = 150;
        this.lastBonusSpawn = 0;
        this.gameStartTime = Date.now();
        
        // Reset progressive difficulty
        this.progressiveDifficulty = {
            currentLevel: 1,
            currentScaling: 1.0,
            currentMilestone: PROGRESSIVE_DIFFICULTY.milestones[0]
        };
        this.updateDifficultyHUD();
        
        // Reset background elements spawn timers
        this.lastElementSpawn = {
            planet: Date.now(),
            nebula: Date.now(),
            asteroid: Date.now(),
            comet: Date.now()
        };
        
        // Reset super weapon
        this.superWeapon = {
            charge: 0,
            ready: false,
            active: false,
            activationTime: 0
        };
        
        // Reset screen shake
        this.screenShake = { x: 0, y: 0, intensity: 0 };

        this.roster.reset();
        this.roster.setLocal(new Player(
            CONFIG.canvas.width / 2,
            CONFIG.canvas.height - 100
        ));

        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('pause-screen').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        document.getElementById('active-bonuses').classList.remove('hidden');
        
        // Show touch controls based on settings
        if ((this.isMobileDevice || CONFIG.touch.enabled) && GAME_SETTINGS.joystickVisible) {
            document.getElementById('touch-controls').classList.remove('hidden');
            document.getElementById('joystick-zone').style.display = 'block';
        } else if (this.isMobileDevice || CONFIG.touch.enabled) {
            document.getElementById('touch-controls').classList.remove('hidden');
            document.getElementById('joystick-zone').style.display = 'none';
        }
        
        if (GAME_SETTINGS.soundEnabled) {
            this.musicManager.stop();
            this.musicManager.start();
        }
        this.updateHUD();
        this.updateSuperWeaponUI();
        this.updateDifficultyHUD();
    }

    pauseGame() {
        if (this.state === 'playing') {
            this.state = 'paused';
            document.getElementById('pause-screen').classList.remove('hidden');
        }
    }

    resumeGame() {
        if (this.state === 'paused') {
            this.state = 'playing';
            document.getElementById('pause-screen').classList.add('hidden');
        }
    }

    restartGame() {
		 const modal = document.getElementById('leaderboard-modal');
    modal.classList.add('hidden');
        // Restart game with current settings
        this.stopCoop();
        this.startGame();
    }
    
    goToSettings() {
        this.openSettings('gameOver');
    }
    
    showShareDialog() {
        const level = this.progressiveDifficulty.currentLevel;
        const score = this.score;
        
        // Generate message based on level
        let message = '';
        if (level <= 10) {
            message = `Επιβίωσα από το πρώτο κύμα της επίθεσης ${level}/100 Level! 👽`;
        } else if (level <= 25) {
            message = `Έφτασα στο καταφύγιο ${level}/100 Level με ${score} πόντους! 🛸`;
        } else if (level <= 50) {
            message = `Ξεκίνησα την αντεπίθεση ${level}/100 Level με ${score} πόντους! 💪`;
        } else if (level <= 75) {
            message = `Οι εξωγήινοι πλέον με τρέμουν - Έφτασα ${level}/100! Level με ${score} πόντους! 🔥`;
        } else {
            message = `Οι εξωγήινοι ηττήθηκαν - Έφτασα ${level}/100 Level! Μπορείς να με φτάσεις; ${score} πόντους 🚀`;
        }
        
        // Create share dialog
        const dialogHTML = `
            <div id="share-dialog" class="share-dialog">
                <div class="share-content">
                    <h2>Κοινοποίηση Σκορ</h2>
                    <div class="share-message">${message}</div>
                    <div class="share-buttons">
                         <button class="share-btn" data-platform="facebook">
                            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#1877F2"/><path fill="#fff" d="M15.4 12.6l.42-2.74h-2.63V8.08c0-.75.37-1.48 1.55-1.48h1.2V4.27s-1.09-.19-2.13-.19c-2.17 0-3.59 1.32-3.59 3.7v2.08H7.6v2.74h2.42V19h2.97v-6.4z"/></svg> Facebook
                        </button>
						<button class="share-btn" data-platform="copy">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg> Αντιγραφή
                        </button>
                    </div>
                    <button class="share-close-btn">Κλείσιμο</button>
                </div>
            </div>
        `;
        
        // Add to DOM
        const existingDialog = document.getElementById('share-dialog');
        if (existingDialog) existingDialog.remove();
        
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
        
        // Setup event listeners
        const dialog = document.getElementById('share-dialog');
        const shareButtons = dialog.querySelectorAll('.share-btn');
        const closeButton = dialog.querySelector('.share-close-btn');
        
        shareButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const platform = btn.dataset.platform;
                this.shareScore(platform, message);
            });
        });
        
        closeButton.addEventListener('click', () => {
            dialog.remove();
        });
        
        // Close on background click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
    }
    
    fallbackCopy(text) {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'absolute';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            alert(ok ? 'Αντιγράφηκε! ✅' : 'Αντιγράψτε χειροκίνητα: ' + text);
        } catch (e) {
            alert('Αντιγράψτε χειροκίνητα: ' + text);
        }
    }

    shareScore(platform, message) {
        // Always share the live app URL (from og:url), not a local/dev address
        const ogUrl = document.querySelector('meta[property="og:url"]');
        const shareUrl = (ogUrl && ogUrl.content) || window.location.href;

        if (platform === 'copy') {
            const fullText = `${message}\n${shareUrl}`;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(fullText)
                    .then(() => alert('Αντιγράφηκε! ✅'))
                    .catch(() => this.fallbackCopy(fullText));
            } else {
                this.fallbackCopy(fullText);   // older iOS / non-HTTPS contexts
            }
            return; // keep the dialog open so the user still sees the options
        }

        if (platform === 'facebook') {
            // On mobile, the native share sheet opens the Facebook app with the
            // message + link; fall back to Facebook's web sharer on desktop.
            if (navigator.share) {
                navigator.share({ title: 'Alien Invaders', text: message, url: shareUrl })
                    .catch(() => {});
            } else {
                window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                    '_blank', 'noopener'
                );
            }
        }

        const dialog = document.getElementById('share-dialog');
        if (dialog) setTimeout(() => dialog.remove(), 400);
    }

    gameOver() {
    // Co-op: a single ship dying does not end the game while a partner survives.
    if (this.mode !== 'solo' && !this.roster.isGameOver()) { this.updateHUD(); return; }
    this.state = 'gameOver';
    if (this.boss) {
        this.boss = null;
        this.homingBullets = [];
        this.updateBossHUD();
    }
    this.soundManager.gameOver();
    this.musicManager.stop();
    document.getElementById('final-score').textContent = this.score;
    if (this.mode === 'solo') {
        this.setupGameOverScoreEntry();
    } else {
        this._lastWasCoop = true;
        if (this.mode === 'coopHost') {
            this.leaderboardManager.addCoopScore(this.coopNames || 'Co-op', this.score, this.progressiveDifficulty.currentLevel);
        }
    }
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('active-bonuses').classList.add('hidden');
    document.getElementById('touch-controls').classList.add('hidden');
    this.resetJoystick();
}

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
            // Lock synchronously so a double-tap / re-entrant submit can't save twice.
            saved = true;
            btn.disabled = true;
            input.disabled = true;
            this.leaderboardManager.addScore(name, this.score, this.progressiveDifficulty.currentLevel);
            btn.textContent = '✓ Αποθηκεύτηκε!';
        };
    }

    updateHUD() {
        const scoreElement = document.getElementById('score');
        scoreElement.textContent = Math.floor(this.displayScore);
        
        // Update progressive difficulty based on score
        this.updateProgressiveDifficulty();
        
        // Highlight score when multiplier is active
        if (this.activeBonuses.multiplier) {
            scoreElement.style.color = '#FFD700';
            scoreElement.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.8)';
        } else {
            scoreElement.style.color = '';
            scoreElement.style.textShadow = '';
        }
        
        const livesContainer = document.getElementById('lives-container');
        livesContainer.innerHTML = '';
        for (let i = 0; i < this.player.health; i++) {
            const life = document.createElement('span');
            life.className = 'life';
            life.textContent = '❤️';
            livesContainer.appendChild(life);
        }
    }
showLeaderboardModal(coop = this._lastWasCoop) {
    const modal = document.getElementById('leaderboard-modal');
    const title = modal.querySelector('.modal-header h2');
    if (title) title.textContent = coop ? 'Co-op Κατάταξη' : 'Λίστα Κορυφαίων Παικτών';

    // View-only — name entry now lives in the Game Over screen
    modal.classList.remove('hidden');
    this.updateLeaderboardDisplay(coop);

    // Κλείσιμο modal
    const closeBtn = modal.querySelector('.modal-close');
    const closeOnBackdrop = (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            modal.removeEventListener('click', closeOnBackdrop);
        }
    };
    
    closeBtn.onclick = () => modal.classList.add('hidden');
    modal.addEventListener('click', closeOnBackdrop);
}

updateLeaderboardDisplay(coop = false) {
    const leaderboardList = document.getElementById('leaderboard-list');
    const scores = coop ? this.leaderboardManager.getCoopScores() : this.leaderboardManager.getScores();
    
    leaderboardList.innerHTML = '';
    
    if (scores.length === 0) {
        leaderboardList.innerHTML = `
            <div class="leaderboard-empty">
                <p>Δεν υπάρχουν ακόμα σκορ. Γίνετε ο πρώτος! 🚀</p>
            </div>
        `;
        return;
    }
    
    scores.forEach((entry, index) => {
        const rank = index + 1;
        const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
        
        const entryEl = document.createElement('div');
        entryEl.className = 'leaderboard-entry';
        entryEl.innerHTML = `
            <div class="leaderboard-rank ${rankClass}">${medal || rank}</div>
            <div class="leaderboard-info">
                <div class="leaderboard-name">${this.escapeHtml(coop ? entry.names : entry.name)}</div>
                <div class="leaderboard-meta">
                    <span>📊 Level ${this.escapeHtml(String(entry.level ?? ''))}</span>
                    <span>${this.escapeHtml(String(entry.date ?? ''))}</span>
                </div>
            </div>
            <div class="leaderboard-score">${(Number(entry.score) || 0).toLocaleString()}</div>
        `;
        leaderboardList.appendChild(entryEl);
    });
}

escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text ?? '').replace(/[&<>"']/g, m => map[m]);
}
    spawnEnemy() {
        const x = randomRange(50, CONFIG.canvas.width - 50);
        const y = -30;
        
        // Get current level from progressive difficulty
        const currentLevel = this.progressiveDifficulty.currentLevel;
        
        // Filter enemy types available at current level
        const types = CONFIG.enemy.types;
        const availableTypes = [];
        
        for (let [name, config] of Object.entries(types)) {
            const [minLevel, maxLevel] = config.levelRange;
            if (currentLevel >= minLevel && currentLevel <= maxLevel) {
                availableTypes.push({ name, config });
            }
        }
        
        // If no available types (shouldn't happen), default to scout_drone
        if (availableTypes.length === 0) {
            this.enemies.push(new Enemy(x, y, 'scout_drone'));
            return;
        }
        
        // Select enemy based on weights
        const totalWeight = availableTypes.reduce((sum, type) => sum + type.config.spawnWeight, 0);
        let random = Math.random() * totalWeight;
        let cumulative = 0;
        let selectedType = availableTypes[0].name;
        
        for (let type of availableTypes) {
            cumulative += type.config.spawnWeight;
            if (random <= cumulative) {
                selectedType = type.name;
                break;
            }
        }
        
        this.enemies.push(new Enemy(x, y, selectedType));
    }

    startNextWave() {
        this.waveState.number++;

        if (this.waveState.number % 10 === 0) {
            this.waveState.phase = 'boss_incoming';
            this.waveState.bannerText = '👾 BOSS INCOMING 👾';
            this.waveState.bannerLife = WAVE_CONFIG.ANNOUNCE_DURATION;
            this.waveState.bannerStartTime = this.currentTime;
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
        this.waveState.bannerStartTime = this.currentTime;
        this.waveState.phaseTimer = this.currentTime;
        this.updateWaveHUD();
    }

    updateWaveSystem() {
        const ws = this.waveState;

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
                        CONFIG.canvas.width / 2,
                        CONFIG.canvas.height / 2 - 30,
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
                if (this.currentTime - ws.bannerStartTime >= WAVE_CONFIG.ANNOUNCE_DURATION) {
                    this.spawnBoss();
                    ws.phase = 'boss_fighting';
                    ws.minionTimer = 0;
                }
                break;

            case 'boss_fighting':
                if (!this.boss && this.enemies.length === 0) {
                    ws.phase = 'break';
                    ws.phaseTimer = this.currentTime;
                    break;
                }
                // Spawn minion reinforcements every ~9s, max 4 enemies on screen
                if (this.boss && this.boss.entranceComplete && this.enemies.length < 4) {
                    if (ws.minionTimer === 0) ws.minionTimer = this.currentTime;
                    if (this.currentTime - ws.minionTimer >= 9000) {
                        ws.minionTimer = this.currentTime;
                        const count = 2 + Math.floor(Math.random() * 2);
                        for (let i = 0; i < count; i++) this.spawnEnemy();
                        this.spawnFloatingText(
                            CONFIG.canvas.width / 2,
                            CONFIG.canvas.height * 0.35,
                            '⚠ REINFORCEMENTS!', '#FF4400', 18
                        );
                    }
                }
                break;
        }
    }

    updateWaveHUD() {
        const el = document.getElementById('wave-number');
        if (el) el.textContent = this.waveState.number;
        this.updateProgressiveDifficulty();
    }

    spawnBoss() {
        this.boss = new Boss(CONFIG.canvas.width, CONFIG.canvas.height, this.waveState.number);
        this.screenShake.intensity = 0.3;
        if (this.soundManager.audioContext) {
            this.soundManager.explosion(2);
        }
        if (this.musicManager) {
            this.musicManager.setTempo(160);
        }
    }

    updateBossHUD() {
        const hud = document.getElementById('boss-hud');
        const fill = document.getElementById('boss-hud-fill');
        const nameEl = document.getElementById('boss-hud-name');
        const hpEl = document.getElementById('boss-hud-hp');

        if (!this.boss) {
            if (hud) hud.classList.add('hidden');
            if (fill) fill.classList.remove('phase-2');
            return;
        }

        if (hud) hud.classList.remove('hidden');
        if (nameEl) nameEl.textContent = this.boss.name;
        const pct = Math.max(0, (this.boss.health / this.boss.maxHealth) * 100).toFixed(1);
        if (fill) fill.style.width = pct + '%';
        if (hpEl) hpEl.textContent = `${Math.max(0, this.boss.health)} / ${this.boss.maxHealth}`;

        if (fill) {
            if (this.boss.phase === 2) {
                fill.classList.add('phase-2');
            } else {
                fill.classList.remove('phase-2');
            }
        }
    }

    activateSuperWeapon() {
        if (!this.superWeapon.ready || this.superWeapon.active) return;
        
        this.superWeapon.active = true;
        this.superWeapon.activationTime = this.currentTime;
        this.superWeapon.ready = false;
        this.superWeapon.charge = 0;
        
        // Sound and vibration feedback
        this.soundManager.superWeapon();
        this.vibrationManager.superWeapon();
        
        // Screen shake
        this.screenShake.intensity = CONFIG.superWeapon.shakeIntensity;
        
        // Create massive shockwave
        this.shockwaves.push({
            x: this.player.x,
            y: this.player.y,
            radius: 0,
            maxRadius: Math.max(CONFIG.canvas.width, CONFIG.canvas.height) * 1.5,
            life: 1,
            speed: 15
        });
        
        // Create flash effect
        for (let i = 0; i < 50; i++) {
            this.particles.push(new Particle(
                this.player.x,
                this.player.y,
                i % 2 === 0 ? '#FFD700' : '#FFA500',
                'glow'
            ));
        }
        
        // Destroy all enemies — lightweight: score + 2-3 shockwaves instead of per-enemy explosions
        this.enemies.forEach(enemy => {
            this.score += enemy.points;
        });
        // A few large shockwaves to sell the effect without particle spam
        for (let i = 0; i < 3; i++) {
            this.shockwaves.push(new Shockwave(
                CONFIG.canvas.width / 2 + (i - 1) * 150,
                CONFIG.canvas.height / 2,
                '#FFD700'
            ));
        }
        this.enemies = [];

        if (this.boss) {
            const bossDmg = Math.floor(this.boss.maxHealth * 0.3);
            this.boss.health -= bossDmg;
            this.spawnFloatingText(
                this.boss.x, this.boss.y - 30,
                `-${bossDmg}`, '#FFD700', 20
            );
            if (this.boss.health <= 0) {
                const pts = this.boss.points;
                const bossX = this.boss.x;
                const bossY = this.boss.y;
                this.score += pts;
                this.createExplosion(bossX, bossY, this.boss.size * 2, '#FF0066');
                this.screenShake.intensity = 0.5;
                this.spawnFloatingText(bossX, bossY - 40, `BOSS DEFEATED! +${pts}`, '#FFD700', 26);
                this.killCount++;
                this.boss = null;
                this.homingBullets = [];
                this.spawnBossDrops(bossX, bossY);
                this.updateBossHUD();
                if (this.musicManager) {
                    this.musicManager.updateForLevel(this.progressiveDifficulty.currentLevel);
                }
            } else {
                this.updateBossHUD();
                const midDrops = this.boss.checkDropThreshold();
                if (midDrops) {
                    midDrops.forEach((type, i) => {
                        this.bonusPickups.push(new BonusPickup(
                            this.boss.x + (i - Math.floor(midDrops.length / 2)) * 65,
                            this.boss.y + 50,
                            type
                        ));
                    });
                }
            }
        }

        this.updateHUD();
        this.updateSuperWeaponUI();
        // NOTE: deactivation is clock-driven in updateGame() (pause/restart-safe),
        // not a setTimeout that would keep running while paused or after a restart.
    }
    
    createExplosion(x, y, size, color) {
        // Skip low-priority explosions when particle budget is full
        const budget = 350;
        if (this.particles.length > budget) return;

        const particleCount = Math.min(Math.floor(size / 4) + 6, 14);

        // Shockwave — cap total on screen
        if (this.shockwaves.length < 6) {
            this.shockwaves.push(new Shockwave(x, y, color));
        }

        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle(x, y, color, 'glow'));
        }
        for (let i = 0; i < Math.floor(particleCount / 2); i++) {
            this.particles.push(new Particle(x, y, color, 'debris'));
        }
        for (let i = 0; i < 4; i++) {
            this.particles.push(new Particle(x, y, '#FFFFFF', 'glow'));
        }
    }
    
    spawnFloatingText(x, y, text, color, size = 16) {
        this.floatingTexts.push(new FloatingText(x, y, text, color, size));
    }

    updateSuperWeaponUI() {
        const fill = document.getElementById('super-weapon-fill');
        const status = document.getElementById('super-weapon-status');
        const button = document.getElementById('super-weapon-button');
        const chargeText = button.querySelector('.charge-text');
        
        const percent = Math.min((this.superWeapon.charge / CONFIG.superWeapon.threshold) * 100, 100);
        fill.style.width = percent + '%';
        status.textContent = `${this.superWeapon.charge}/${CONFIG.superWeapon.threshold}`;
        chargeText.textContent = Math.floor(percent) + '%';
        
        if (this.superWeapon.ready) {
            fill.classList.add('ready');
            button.classList.remove('disabled');
            button.classList.add('ready');
        } else {
            fill.classList.remove('ready');
            button.classList.add('disabled');
            button.classList.remove('ready');
        }
    }

    handleInput() {
        if (!this.player || this.state !== 'playing') return;
        if (this.player.health <= 0) return;   // dead ship = spectating (co-op)

        let dx = 0;
        let dy = 0;

        // Keyboard input
        if (this.keys['arrowup'] || this.keys['w']) dy -= 1;
        if (this.keys['arrowdown'] || this.keys['s']) dy += 1;
        if (this.keys['arrowleft'] || this.keys['a']) dx -= 1;
        if (this.keys['arrowright'] || this.keys['d']) dx += 1;
        
        // Touch input - prioritize drag, then joystick
        if (this.touchState.dragActive) {
            dx = this.touchState.directionX;
            dy = this.touchState.directionY;
        } else if (this.touchState.joystickActive) {
            dx = this.touchState.directionX;
            dy = this.touchState.directionY;
        }

        // Normalize diagonal movement (only for keyboard)
        if (!this.touchState.joystickActive && !this.touchState.dragActive && dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        this.player.move(dx, dy, CONFIG.canvas);

        // Fire logic based on auto-fire setting
        const hasMultiShot = !!this.activeBonuses.multiShot;
        let shouldFire = false;
        
        if (GAME_SETTINGS.autoFire) {
            // Auto-fire: always shooting
            shouldFire = true;
        } else {
            // Manual fire: only when fire key is pressed
            shouldFire = this.keys['fire'];
        }
        
        if (shouldFire && this.mode !== 'coopGuest') {
            const bullets = this.player.shoot(this.currentTime, hasMultiShot);
            if (bullets) {
                if (Array.isArray(bullets)) {
                    this.bullets.push(...bullets);
                    this.soundManager.playerShoot();
                } else {
                    this.bullets.push(bullets);
                    this.soundManager.playerShoot();
                }
            }
        }
    }

    updateGame() {
        if (this.state !== 'playing') return;

        this.currentTime = Date.now();

        // Clock-driven super-weapon deactivation (survives pause/restart correctly)
        if (this.superWeapon.active &&
            this.currentTime - this.superWeapon.activationTime >= CONFIG.superWeapon.duration) {
            this.superWeapon.active = false;
        }

        // Co-op guest does not simulate — it renders host snapshots (own ship moves in handleInput).
        if (this.mode === 'coopGuest') return;
        // Co-op host: the remote (guest) ship auto-fires too.
        if (this.mode === 'coopHost') this._fireRemoteShip();

        // Spawn dynamic background elements
        this.updateBackgroundElements();

        // Wave-based enemy spawning
        this.updateWaveSystem();

        // Update player
        if (this.player) {
            this.player.update();
        }

        // Update stars
        this.stars.forEach(star => star.update(CONFIG.canvas));

        // Update bullets (in-place swap+pop — no per-frame array allocation)
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update();
            if (bullet.isOffScreen(CONFIG.canvas)) {
                this.bullets[i] = this.bullets[this.bullets.length - 1];
                this.bullets.pop();
            }
        }

        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(this.player.x, this.player.y, CONFIG.canvas);
            
            // Enemy shooting
            const bullet = enemy.shoot(this.currentTime, this.player.x, this.player.y);
            if (bullet) {
                if (Array.isArray(bullet)) {
                    this.bullets.push(...bullet);
                    this.soundManager.enemyShoot();
                } else {
                    this.bullets.push(bullet);
                    this.soundManager.enemyShoot();
                }
            }
        });

        // Remove off-screen enemies (in-place swap+pop)
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (this.enemies[i].isOffScreen(CONFIG.canvas)) {
                this.enemies[i] = this.enemies[this.enemies.length - 1];
                this.enemies.pop();
            }
        }

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

            if (this.boss.isOffScreen(CONFIG.canvas)) {
                this.boss = null;
                this.homingBullets = [];
            }
        }

        // Update homing bullets (in-place swap+pop)
        for (let i = this.homingBullets.length - 1; i >= 0; i--) {
            const hb = this.homingBullets[i];
            hb.update(this.player.x, this.player.y);
            if (hb.isOffScreen(CONFIG.canvas)) {
                this.homingBullets[i] = this.homingBullets[this.homingBullets.length - 1];
                this.homingBullets.pop();
            }
        }

        // Update particles in-place (swap+pop avoids array allocation each frame)
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].isDead()) {
                this.particles[i] = this.particles[this.particles.length - 1];
                this.particles.pop();
            }
        }
        
        // Update shockwaves in-place
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const wave = this.shockwaves[i];
            wave.radius += wave.speed;
            wave.life -= 0.02;
            if (wave.life <= 0 || wave.radius >= wave.maxRadius) {
                this.shockwaves[i] = this.shockwaves[this.shockwaves.length - 1];
                this.shockwaves.pop();
            }
        }

        // Update floating texts in-place
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            this.floatingTexts[i].update();
            if (this.floatingTexts[i].isDead()) {
                this.floatingTexts[i] = this.floatingTexts[this.floatingTexts.length - 1];
                this.floatingTexts.pop();
            }
        }

        // Update screen shake
        if (this.screenShake.intensity > 0) {
            this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity * 20;
            this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity * 20;
            this.screenShake.intensity *= 0.9;
        } else {
            this.screenShake.x = 0;
            this.screenShake.y = 0;
        }

        // Animated score lerp
        this.displayScore += (this.score - this.displayScore) * 0.12;

        // Update bonus pickups (in-place swap+pop)
        for (let i = this.bonusPickups.length - 1; i >= 0; i--) {
            const bonus = this.bonusPickups[i];
            bonus.update(CONFIG.canvas, this.player.x, this.player.y);

            const collected = bonus.collidesWith(this.player.x, this.player.y, this.player.size);
            if (collected) this.collectBonus(bonus);

            if (collected || bonus.isDead()) {
                this.bonusPickups[i] = this.bonusPickups[this.bonusPickups.length - 1];
                this.bonusPickups.pop();
            }
        }
        
        // Update active bonuses
        this.updateActiveBonuses();
        
        // Collision detection
        this.checkCollisions();
    }
    
    updateBackgroundElements() {
        // Background elements DISABLED per user request
        // Keeping only stars for clean gameplay
    }

    checkCollisions() {
        // Player bullets vs enemies
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (!bullet.isPlayerBullet) continue;

            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                const dist = distance(bullet.x, bullet.y, enemy.x, enemy.y);

                if (dist < bullet.radius + enemy.size) {
                    // Hit!
                    this.bullets.splice(i, 1);
                    enemy.health--;
                    
                    if (enemy.health <= 0) {
                        // Enemy destroyed
                        const enemyX = enemy.x;
                        const enemyY = enemy.y;
                        enemy.hitFlash = 4;
                        this.enemies.splice(j, 1);
                        
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
                        if (this.combo % 5 === 0) {
                            this.spawnFloatingText(
                                this.player.x,
                                this.player.y - 60,
                                `KILLING SPREE x${this.combo}!`,
                                '#FF6B35',
                                20
                            );
                        }
                        this.superWeapon.charge = Math.min(this.superWeapon.charge + enemy.points, CONFIG.superWeapon.threshold);
                        
                        if (this.superWeapon.charge >= CONFIG.superWeapon.threshold) {
                            this.superWeapon.ready = true;
                        }
                        
                        // Spawn bonus with chance
                        this.spawnBonusPickup(enemyX, enemyY);
                        
                        this.updateHUD();
                        this.updateSuperWeaponUI();
                        
                        // Sound and vibration feedback
                        const sizeMultiplier = enemy.size / 20;
                        this.soundManager.explosion(sizeMultiplier);
                        this.vibrationManager.explosion();
                        
                        // Create enhanced explosion
                        this.createExplosion(enemyX, enemyY, enemy.size, enemy.color);
                        
                        // Screen shake for big enemies
                        if (enemy.size > 25) {
                            this.screenShake.intensity = 0.15;
                        }
                    } else {
                        // Hit but not destroyed - small particles
                        enemy.hitFlash = 4;
                        this.soundManager.hit();
                        for (let k = 0; k < 5; k++) {
                            this.particles.push(new Particle(enemy.x, enemy.y, enemy.color));
                        }
                    }
                    break;
                }
            }
        }

        // Enemy bullets vs player
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (bullet.isPlayerBullet) continue;

            const dist = distance(bullet.x, bullet.y, this.player.x, this.player.y);
            if (dist < bullet.radius + this.player.size) {
                if (this.player.invincible) {
                    this.bullets.splice(i, 1);
                    continue;
                }
                this.bullets.splice(i, 1);

                // Sound and vibration feedback - ENHANCED
                this.soundManager.damageTaken();
                
                // CRITICAL FIX: Ensure vibration triggers on hit
                if (GAME_SETTINGS.vibrationEnabled) {
                    this.vibrationManager.damage();
                }
                
                this.screenShake.intensity = 0.25;
                
                // Check if shield is active
                if (this.activeBonuses.shield) {
                    // Shield absorbs hit
                    delete this.activeBonuses.shield;
                    this.updateActiveBonusesUI();
                    
                    // Create shield break effect
                    for (let k = 0; k < 20; k++) {
                        this.particles.push(new Particle(this.player.x, this.player.y, '#00CCFF', 'glow'));
                    }
                    continue;
                }
                
                // Create damage particles
                for (let k = 0; k < 10; k++) {
                    this.particles.push(new Particle(this.player.x, this.player.y, '#FFD700'));
                }

                this.combo = 0;
                this.player.makeInvincible();
                if (this.player.takeDamage()) {
                    this.gameOver();
                } else {
                    this.updateHUD();
                }
            }
        }

        // Player vs enemies (collision)
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const dist = distance(this.player.x, this.player.y, enemy.x, enemy.y);

            if (dist < this.player.size + enemy.size) {
                if (this.player.invincible) continue;
                this.enemies.splice(i, 1);

                // Sound and vibration feedback - ENHANCED
                this.soundManager.explosion(1.5);
                this.soundManager.damageTaken();

                // CRITICAL FIX: Ensure vibration triggers on collision
                if (GAME_SETTINGS.vibrationEnabled) {
                    this.vibrationManager.damage();
                }

                // Create collision explosion
                this.createExplosion(enemy.x, enemy.y, enemy.size, '#FF6347');
                this.screenShake.intensity = 0.25;

                // Check if shield is active
                if (this.activeBonuses.shield) {
                    delete this.activeBonuses.shield;
                    this.updateActiveBonusesUI();

                    for (let k = 0; k < 20; k++) {
                        this.particles.push(new Particle(this.player.x, this.player.y, '#00CCFF', 'glow'));
                    }
                } else {
                    this.combo = 0;
                    this.player.makeInvincible();
                    if (this.player.takeDamage()) {
                        this.gameOver();
                    } else {
                        this.updateHUD();
                    }
                }
            }
        }

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
                        const bossX = this.boss.x;
                        const bossY = this.boss.y;
                        this.score += pts;
                        this.createExplosion(bossX, bossY, this.boss.size * 2, '#FF0066');
                        for (let k = 0; k < 3; k++) {
                            this.shockwaves.push(new Shockwave(bossX, bossY, '#FF0066'));
                        }
                        this.screenShake.intensity = 0.5;
                        this.soundManager.explosion(3);
                        this.vibrationManager.superWeapon();
                        this.spawnFloatingText(
                            bossX, bossY - 40,
                            `BOSS DEFEATED! +${pts}`, '#FFD700', 26
                        );
                        this.combo = 0;
                        this.killCount++;
                        this.boss = null;
                        this.homingBullets = [];
                        this.spawnBossDrops(bossX, bossY);
                        this.updateHUD();
                        this.updateBossHUD();
                        if (this.musicManager) {
                            this.musicManager.updateForLevel(this.progressiveDifficulty.currentLevel);
                        }
                    } else {
                        this.updateBossHUD();
                        this.soundManager.hit();
                        const midDrops = this.boss.checkDropThreshold();
                        if (midDrops) {
                            midDrops.forEach((type, i) => {
                                this.bonusPickups.push(new BonusPickup(
                                    this.boss.x + (i - Math.floor(midDrops.length / 2)) * 65,
                                    this.boss.y + 50,
                                    type
                                ));
                            });
                        }
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

        // Co-op: damage the remote (guest) ship too (host-authoritative; additive).
        if (this.mode === 'coopHost') this._damageRemoteShip();
    }

    buildNebulaGradients() {
        if (!this.ctx) return;
        const W = CONFIG.canvas.width, H = CONFIG.canvas.height;
        const g1 = this.ctx.createRadialGradient(W * 0.25, H * 0.2, 0, W * 0.25, H * 0.2, W * 0.45);
        g1.addColorStop(0, 'rgba(70, 0, 110, 0.10)'); g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
        const g2 = this.ctx.createRadialGradient(W * 0.78, H * 0.65, 0, W * 0.78, H * 0.65, W * 0.38);
        g2.addColorStop(0, 'rgba(0, 35, 90, 0.09)'); g2.addColorStop(1, 'rgba(0, 0, 0, 0)');
        const g3 = this.ctx.createRadialGradient(W * 0.5, H * 0.85, 0, W * 0.5, H * 0.85, W * 0.3);
        g3.addColorStop(0, 'rgba(0, 60, 60, 0.07)'); g3.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.nebulaGradients = [g1, g2, g3];
    }

    draw() {
        // Apply screen shake
        this.ctx.save();
        this.ctx.translate(this.screenShake.x, this.screenShake.y);
        
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(-this.screenShake.x, -this.screenShake.y, CONFIG.canvas.width, CONFIG.canvas.height);

        // Static nebula gradients (built once per size in buildNebulaGradients())
        if (this.nebulaGradients) {
            for (const g of this.nebulaGradients) {
                this.ctx.fillStyle = g;
                this.ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
            }
        }

        // Draw stars
        this.stars.forEach(star => star.draw(this.ctx));
        
        // Background elements DISABLED - clean space background

        // Wave announcement banner (only during gameplay — never on splash/menu)
        const bannerElapsed = this.currentTime - (this.waveState.bannerStartTime || 0);
        const bannerRemaining = WAVE_CONFIG.ANNOUNCE_DURATION - bannerElapsed;
        if (this.state === 'playing' && bannerRemaining > 0) {
            const alpha = Math.min(1, bannerRemaining / 200);
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = 'rgba(0, 10, 30, 0.88)';
            this.ctx.fillRect(0, CONFIG.canvas.height / 2 - 42, CONFIG.canvas.width, 84);
            this.ctx.strokeStyle = this.waveState.bannerText.includes('BOSS') ? '#FF0066' : '#32B8C6';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(0, CONFIG.canvas.height / 2 - 42, CONFIG.canvas.width, 84);
            this.ctx.font = 'bold 26px Orbitron, monospace';
            this.ctx.fillStyle = this.waveState.bannerText.includes('BOSS') ? '#FF0066' : '#FFD700';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = this.waveState.bannerText.includes('BOSS') ? '#FF0066' : '#FFD700';
            this.ctx.fillText(this.waveState.bannerText, CONFIG.canvas.width / 2, CONFIG.canvas.height / 2);
            this.ctx.restore();
        }

        // Draw shockwaves
        this.shockwaves.forEach(wave => {
            this.ctx.save();
            this.ctx.globalAlpha = wave.life * 0.6;
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            this.ctx.strokeStyle = '#FFA500';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(wave.x, wave.y, wave.radius * 0.9, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
        });

        // Draw particles
        this.particles.forEach(particle => particle.draw(this.ctx));

        // Draw floating texts
        this.floatingTexts.forEach(ft => ft.draw(this.ctx));

        // Draw bullets
        this.bullets.forEach(bullet => bullet.draw(this.ctx));

        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx));

        // Draw boss
        if (this.boss) this.boss.draw(this.ctx);
        // Draw homing bullets
        this.homingBullets.forEach(hb => hb.draw(this.ctx));

        // Draw bonus pickups
        this.bonusPickups.forEach(bonus => bonus.draw(this.ctx));
        
        // Draw player
        if (this.state === 'playing') {
            // Draw every ship in the roster (1 in solo, 2 in co-op).
            for (const ship of this.roster.players) {
                if (!ship || ship.health <= 0) continue;
                // Shield ring only for the local player's active shield bonus.
                if (ship === this.player && this.activeBonuses.shield) {
                    this.ctx.save();
                    const shieldPulse = 0.7 + Math.sin(Date.now() * 0.005) * 0.3;
                    this.ctx.globalAlpha = shieldPulse;
                    this.ctx.strokeStyle = '#00CCFF';
                    this.ctx.lineWidth = 3;
                    this.ctx.shadowBlur = 20;
                    this.ctx.shadowColor = '#00CCFF';
                    this.ctx.beginPath();
                    this.ctx.arc(ship.x, ship.y, ship.size * 2, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.restore();
                }
                ship.draw(this.ctx);
            }
        }

        // Combo display
        if (this.state === 'playing' && this.combo >= 2) {
            this.ctx.save();
            this.ctx.font = 'bold 14px Orbitron, monospace';
            this.ctx.fillStyle = '#FFD700';
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'bottom';
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = '#FFD700';
            this.ctx.fillText(`COMBO x${this.combo}`, 20, CONFIG.canvas.height - 20);
            this.ctx.restore();
        }
        // Kill counter
        if (this.state === 'playing') {
            this.ctx.save();
            this.ctx.font = '12px Orbitron, monospace';
            this.ctx.fillStyle = 'rgba(180,180,180,0.7)';
            this.ctx.textAlign = 'right';
            this.ctx.textBaseline = 'bottom';
            this.ctx.fillText(`KILLS ${this.killCount}`, CONFIG.canvas.width - 20, CONFIG.canvas.height - 20);
            this.ctx.restore();
        }

        this.ctx.restore();
    }

    spawnBossDrops(x, y) {
        // Guaranteed drops when boss dies: health + shield + random
        const drops = ['health', 'shield', 'rapidFire'];
        drops.forEach((type, i) => {
            const offsetX = (i - 1) * 70;
            this.bonusPickups.push(new BonusPickup(x + offsetX, y + 20, type));
        });
    }

    spawnBonusPickup(x, y) {
        // 35% chance to spawn a bonus
        if (Math.random() > 0.35) return;
        
        const bonusTypes = [
            { type: 'shield', chance: 0.25 },
            { type: 'health', chance: 0.20 },
            { type: 'rapidFire', chance: 0.15 },
            { type: 'multiShot', chance: 0.15 },
            { type: 'multiplier', chance: 0.25 }
        ];
        
        let random = Math.random();
        let cumulative = 0;
        
        for (let bonus of bonusTypes) {
            cumulative += bonus.chance;
            if (random <= cumulative) {
                this.bonusPickups.push(new BonusPickup(x, y, bonus.type));
                break;
            }
        }
    }
    
    collectBonus(bonus) {
        // PROFESSIONAL: Sound and vibration feedback
        this.soundManager.bonus();
        this.vibrationManager.bonus();
        
        // Create pickup effect
        for (let i = 0; i < 15; i++) {
            this.particles.push(new Particle(bonus.x, bonus.y, bonus.config.color, 'glow'));
        }
        
        // Apply bonus effect
        switch (bonus.type) {
            case 'shield':
                this.activeBonuses.shield = { startTime: Date.now(), duration: 15000 };
                break;
            case 'health':
                if (this.player.health < CONFIG.game.initialHealth) {
                    this.player.health++;
                    this.updateHUD();
                }
                break;
            case 'rapidFire':
                this.activeBonuses.rapidFire = { startTime: Date.now(), duration: 10000 };
                CONFIG.player.fireRate = 75;
                break;
            case 'multiShot':
                this.activeBonuses.multiShot = { startTime: Date.now(), duration: 10000 };
                break;
            case 'multiplier':
                this.activeBonuses.multiplier = { startTime: Date.now(), duration: 15000 };
                break;
        }
        
        this.updateActiveBonusesUI();
    }
    
    updateActiveBonuses() {
        const now = Date.now();
        let needsUpdate = false;
        
        // Check for expired bonuses
        for (let [type, data] of Object.entries(this.activeBonuses)) {
            if (data.duration && now - data.startTime >= data.duration) {
                delete this.activeBonuses[type];
                needsUpdate = true;
                
                // Reset effects
                if (type === 'rapidFire') {
                    CONFIG.player.fireRate = 150;
                }
            }
        }
        
        if (needsUpdate) {
            this.updateActiveBonusesUI();
        }
    }
    
    updateActiveBonusesUI() {
        const container = document.getElementById('bonuses-container');
        container.innerHTML = '';
        
        const now = Date.now();
        
        for (let [type, data] of Object.entries(this.activeBonuses)) {
            const bonusDiv = document.createElement('div');
            bonusDiv.className = `bonus-indicator ${type === 'rapidFire' ? 'rapid-fire' : type === 'multiShot' ? 'multi-shot' : type}`;
            
            const icons = {
                shield: '🛡️',
                rapidFire: '⚡',
                multiShot: '🔱',
                multiplier: '⭐'
            };
            
            const names = {
                shield: 'Shield',
                rapidFire: 'Rapid Fire',
                multiShot: 'Multi-Shot',
                multiplier: '2x Score'
            };
            
            bonusDiv.innerHTML = `
                <span class="bonus-icon">${icons[type] || '✨'}</span>
                ${data.duration ? `<span class="bonus-timer">${Math.ceil((data.duration - (now - data.startTime)) / 1000)}s</span>` : ''}
            `;
            
            container.appendChild(bonusDiv);
        }
    }

    updateProgressiveDifficulty() {
        // Level tied to wave number (wave 1 = level 1, wave 100 = level 100)
        const waveNum = Math.max(1, this.waveState.number);
        const idx = Math.min(waveNum - 1, PROGRESSIVE_DIFFICULTY.milestones.length - 1);
        const currentMilestone = PROGRESSIVE_DIFFICULTY.milestones[idx];
        
        // Check if difficulty level changed
        if (currentMilestone.level !== this.progressiveDifficulty.currentLevel) {
            this.progressiveDifficulty.currentLevel = currentMilestone.level;
            this.progressiveDifficulty.currentScaling = currentMilestone.scaling;
            this.progressiveDifficulty.currentMilestone = currentMilestone;
            
            // Play level up sound
            this.soundManager.levelUp();
            this.musicManager.updateForLevel(currentMilestone.level);
            this.spawnFloatingText(
                CONFIG.canvas.width / 2,
                CONFIG.canvas.height / 2,
                `LEVEL ${currentMilestone.level}!`,
                '#FFD700',
                28
            );

            // Update HUD
            this.updateDifficultyHUD();
        }
    }
    
    updateDifficultyHUD() {
        const indicator = document.getElementById('difficulty-indicator');
        const levelEl = document.getElementById('difficulty-level');
        const percentEl = document.getElementById('difficulty-percent');
        
        if (!indicator || !levelEl || !percentEl) return;
        
        const milestone = this.progressiveDifficulty.currentMilestone;
        
        // Update text with "X/100" format
        levelEl.textContent = `LEVEL ${milestone.level}/100`;
        percentEl.textContent = milestone.text;
        
        // Update color class
        indicator.className = 'hud-item difficulty-indicator ' + milestone.color;
    }
setupStoryModeListeners() {
    // Story button on start screen
    const storyBtn = document.getElementById('story-btn');
    if (storyBtn) {
        storyBtn.addEventListener('click', () => this.showStoryScreen());
    }

    // Close button in story screen
    const storyCloseBtn = document.getElementById('story-close-btn');
    if (storyCloseBtn) {
        storyCloseBtn.addEventListener('click', () => this.closeStoryScreen());
    }

    // Start button in story screen (transitions to game)
    const storyStartBtn = document.getElementById('story-start-btn');
    if (storyStartBtn) {
        storyStartBtn.addEventListener('click', () => {
            this.closeStoryScreen();
            this.startGame();
        });
    }
}

/**
 * Show the story screen
 */
showStoryScreen() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('story-screen').classList.remove('hidden');
    
    // Scroll to top of story
    const storyContent = document.querySelector('.story-content');
    if (storyContent) {
        storyContent.scrollTop = 0;
    }
    
    this.state = 'story';
}

/**
 * Close the story screen and return to start screen
 */
closeStoryScreen() {
    document.getElementById('story-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    this.state = 'menu';
}
    // ===== Online co-op — game-state sync (host-authoritative) =====
    // The Game IS the world adapter; the netcode calls the role-appropriate methods.
    makeCoopWorld(role) {
        return {
            getSnapshot: () => this.coopBuildSnapshot(),
            applySnapshot: (m) => this.coopApplySnapshot(m),
            getLocalInput: () => this.coopGetLocalInput(),
            applyRemoteInput: (m) => this.coopApplyRemoteInput(m),
        };
    }

    beginCoop(session, role, difficulty, code, names) {
        this.coopSession = session;
        this.coopRole = role;
        this.coopCode = code;
        this.coopDifficulty = difficulty;
        this.coopNames = names || 'Co-op';
        this.startCoopGame(role, difficulty);
        this._lastRecvAt = Date.now();
        this._coopEnded = false;
        if (this._coopTimer) clearInterval(this._coopTimer);
        this._coopTimer = setInterval(() => {
            try { session.tick(); } catch (e) { /* transport closed */ }
            // Watchdog: no message from the peer for 4s => treat as disconnected.
            if (this.state === 'playing' && Date.now() - this._lastRecvAt > 4000) this._coopDisconnected();
        }, 66);
    }

    _coopDisconnected() {
        if (this._coopEnded) return;
        this._coopEnded = true;
        const wasHost = this.mode === 'coopHost';
        if (this._coopTimer) { clearInterval(this._coopTimer); this._coopTimer = null; }
        if (this.coopSession) { try { this.coopSession.stop(); } catch (e) {} this.coopSession = null; }
        if (wasHost) {
            // Partner left — keep playing solo with the host ship.
            const local = this.roster.players[this.roster.localIndex];
            this.roster.players = [local];
            this.roster.localIndex = 0;
            this.mode = 'solo';
            this.spawnFloatingText(CONFIG.canvas.width / 2, CONFIG.canvas.height / 2, 'Ο συμπαίκτης αποσυνδέθηκε', '#FF6347', 22);
        } else {
            // Host left — the guest cannot continue (host owned the simulation).
            this.mode = 'solo';
            alert('Ο host αποσυνδέθηκε — τέλος co-op.');
            this.showMenu();
        }
    }

    startCoopGame(role, difficulty) {
        GAME_SETTINGS.difficulty = difficulty;
        this.startGame();                       // full reset + 1 local ship + HUD + loop + state='playing'
        this.mode = role === 'host' ? 'coopHost' : 'coopGuest';
        document.getElementById('coop-screen').classList.add('hidden');
        // 2-ship roster: index 0 = host ship, index 1 = guest ship.
        const ship0 = this.roster.players[0];
        const ship1 = new Player(CONFIG.canvas.width / 2, CONFIG.canvas.height - 100);
        ship0.x = CONFIG.canvas.width * 0.40;
        ship1.x = CONFIG.canvas.width * 0.60;
        this.roster.players = [ship0, ship1];
        this.roster.localIndex = role === 'host' ? 0 : 1;
        // Distinct ship colors so players never confuse them. Per-screen: your
        // ship stays the default teal ("you"), the partner is orange ("them").
        this.roster.players[this.roster.localIndex].color = CONFIG.player.color;   // you = teal
        this.coopRemoteShip.color = '#FF7A3D';                                     // partner = orange
    }

    get coopRemoteShip() {
        return this.roster.players[1 - this.roster.localIndex] || null;
    }

    stopCoop() {
        if (this._coopTimer) { clearInterval(this._coopTimer); this._coopTimer = null; }
        if (this.coopSession) { try { this.coopSession.stop(); } catch (e) {} this.coopSession = null; }
        this.mode = 'solo';
    }

    _fireRemoteShip() {
        const ship = this.coopRemoteShip;
        if (!ship || ship.health <= 0) return;
        const bullets = ship.shoot(this.currentTime, false);
        if (bullets) Array.isArray(bullets) ? this.bullets.push(...bullets) : this.bullets.push(bullets);
    }

    // Apply one hit to a ship (shield/invincibility/damage); ends the game only
    // when ALL ships are dead. Shared by the co-op remote-ship damage path.
    _hitShip(ship) {
        this.screenShake.intensity = Math.max(this.screenShake.intensity, 0.25);
        this.combo = 0;
        if (this.activeBonuses.shield) {
            delete this.activeBonuses.shield;
            this.updateActiveBonusesUI();
            for (let k = 0; k < 20; k++) this.particles.push(new Particle(ship.x, ship.y, '#00CCFF', 'glow'));
            return;
        }
        this.soundManager.damageTaken();
        if (GAME_SETTINGS.vibrationEnabled) this.vibrationManager.damage();
        for (let k = 0; k < 10; k++) this.particles.push(new Particle(ship.x, ship.y, '#FFD700'));
        ship.makeInvincible();
        if (ship.takeDamage()) {
            this.createExplosion(ship.x, ship.y, ship.size * 1.5, '#FF6347');   // ship destroyed -> spectates
        }
        this.updateHUD();
        if (this.roster.isGameOver()) this.gameOver();
    }

    // Host-authoritative damage for the remote (guest) ship. Additive: the
    // existing collision blocks already damage the local (host) ship.
    _damageRemoteShip() {
        const gs = this.coopRemoteShip;
        if (!gs || gs.health <= 0 || gs.invincible) return;
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            if (b.isPlayerBullet) continue;
            if (distance(b.x, b.y, gs.x, gs.y) < b.radius + gs.size) { this.bullets.splice(i, 1); return this._hitShip(gs); }
        }
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            if (distance(gs.x, gs.y, e.x, e.y) < gs.size + e.size) { this.enemies.splice(i, 1); this.createExplosion(e.x, e.y, e.size, '#FF6347'); return this._hitShip(gs); }
        }
        for (let i = this.homingBullets.length - 1; i >= 0; i--) {
            const h = this.homingBullets[i];
            if (distance(h.x, h.y, gs.x, gs.y) < h.radius + gs.size) { this.homingBullets.splice(i, 1); return this._hitShip(gs); }
        }
        if (this.boss && this.boss.collidesWith(gs.x, gs.y, gs.size)) { return this._hitShip(gs); }
    }

    coopGetLocalInput() {
        const s = this.player;
        return { x: s ? s.x : 0, y: s ? s.y : 0, firing: true, alive: !!(s && s.health > 0) };
    }

    coopApplyRemoteInput(msg) {
        this._lastRecvAt = Date.now();
        const ship = this.coopRemoteShip;   // host: the guest ship
        if (ship && typeof msg.x === 'number') { ship.x = msg.x; ship.y = msg.y; }
    }

    coopBuildSnapshot() {
        return {
            ships: this.roster.players.map((s, i) => ({ i, x: s.x, y: s.y, health: s.health, alive: s.health > 0 })),
            enemies: this.enemies.map(e => ({ type: e.typeName, x: e.x, y: e.y, hp: e.health })),
            bullets: this.bullets.map(b => ({ x: b.x, y: b.y, color: b.color, p: !!b.isPlayerBullet, et: b.enemyType })),
            homing: this.homingBullets.map(h => ({ x: h.x, y: h.y })),
            boss: this.boss ? { x: this.boss.x, y: this.boss.y, hp: this.boss.health, maxHp: this.boss.maxHealth, size: this.boss.size } : null,
            pickups: this.bonusPickups.map(p => ({ x: p.x, y: p.y, type: p.type })),
            hud: { score: this.score, level: this.progressiveDifficulty.currentLevel, combo: this.combo, kills: this.killCount, over: this.state === 'gameOver' },
            events: [],
        };
    }

    coopApplySnapshot(msg) {
        if (!msg) return;
        this._lastRecvAt = Date.now();
        this.enemies = (msg.enemies || []).map(e => { const en = new Enemy(e.x, e.y, e.type); en.health = e.hp; en.x = e.x; en.y = e.y; return en; });
        this.bullets = (msg.bullets || []).map(b => { const bu = new Bullet(b.x, b.y, 0, 0, b.color, b.p, b.et); bu.x = b.x; bu.y = b.y; return bu; });
        this.homingBullets = (msg.homing || []).map(h => { const hb = new HomingBullet(h.x, h.y, h.x, h.y); hb.x = h.x; hb.y = h.y; return hb; });
        if (msg.boss) { const bo = new Boss(CONFIG.canvas.width, CONFIG.canvas.height, 10); bo.x = msg.boss.x; bo.y = msg.boss.y; bo.health = msg.boss.hp; bo.maxHealth = msg.boss.maxHp; bo.size = msg.boss.size; bo.entranceComplete = true; this.boss = bo; } else { this.boss = null; }
        this.bonusPickups = (msg.pickups || []).map(p => new BonusPickup(p.x, p.y, p.type));
        const localIdx = this.roster.localIndex;
        (msg.ships || []).forEach(s => {
            const ship = this.roster.players[s.i];
            if (!ship) return;
            ship.health = s.health;
            if (s.i !== localIdx) { ship.x = s.x; ship.y = s.y; }   // remote ship pos from host; own ship stays local
        });
        if (msg.hud) { this.score = msg.hud.score; this.displayScore = msg.hud.score; this.combo = msg.hud.combo || 0; this.killCount = msg.hud.kills || 0; }
        this.updateHUD();
        if (msg.hud && msg.hud.over && this.state === 'playing') this.gameOver();
    }

    gameLoop() {
        this.handleInput();
        this.updateGame();
        // Only paint the game canvas while playing — menus/pause/game-over are
        // opaque screens on top, so rendering underneath wastes battery/GPU.
        if (this.state === 'playing') this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}