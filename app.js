// Game Settings (user configurable)
const GAME_SETTINGS = {
    difficulty: 'easy',
    soundEnabled: true,
    joystickVisible: true,
    vibrationEnabled: true,
    joystickSensitivity: 2.0,
    autoSensitivityMultiplier: 1.0,
    autoFire: true
};

// Difficulty Multipliers
const DIFFICULTY_CONFIG = {
    very_easy: {
        spawnRateMultiplier: 0.45,
        enemyHealthMultiplier: 0.35,
        enemyDamageMultiplier: 0.25,
        scoreMultiplier: 1,
        bossSpawnFrequency: 0.15,
        progressionSpeed: 0.4,
        fireRateMultiplier: 3.0
    },
    easy: {
        spawnRateMultiplier: 0.7,
        enemyHealthMultiplier: 0.6,
        enemyDamageMultiplier: 0.45,
        scoreMultiplier: 1,
        bossSpawnFrequency: 0.3,
        progressionSpeed: 0.6,
        fireRateMultiplier: 2.0
    },
    normal: {
        spawnRateMultiplier: 1.0,
        enemyHealthMultiplier: 1.0,
        enemyDamageMultiplier: 1.0,
        scoreMultiplier: 0.7,
        bossSpawnFrequency: 1.0,
        progressionSpeed: 1.0,
        fireRateMultiplier: 1.0
    },
    hard: {
        spawnRateMultiplier: 1.4,
        enemyHealthMultiplier: 1.3,
        enemyDamageMultiplier: 1.5,
        scoreMultiplier: 0.5,
        bossSpawnFrequency: 1.8,
        progressionSpeed: 1.3,
        fireRateMultiplier: 0.65
    }
};

// Progressive Difficulty Milestones - 100 LEVELS
function generateProgressiveDifficulty() {
    const milestones = [];
    const totalLevels = 100;
    const baseScaling = 1.0;
    const maxScaling = 5.5;
    
    // Score threshold calculation - exponential growth
    const calculateScore = (level) => {
        if (level === 1) return 0;
        // Exponential formula: score increases more rapidly at higher levels
        const base = 50;
        const exponent = 1.08;
        return Math.floor(base * (Math.pow(exponent, level - 1) - 1));
    };
    
    // Color mapping based on level ranges
    const getColorForLevel = (level) => {
        if (level <= 10) return `level-range-1`; // Green
        if (level <= 20) return `level-range-2`; // Light green to yellow
        if (level <= 30) return `level-range-3`; // Yellow to yellow-orange
        if (level <= 40) return `level-range-4`; // Orange
        if (level <= 50) return `level-range-5`; // Orange to dark orange
        if (level <= 60) return `level-range-6`; // Red
        if (level <= 70) return `level-range-7`; // Dark red
        if (level <= 80) return `level-range-8`; // Bright red
        if (level <= 90) return `level-range-9`; // Red/Pink
        return `level-range-10`; // Pink/Purple
    };
    
    // Generate all 100 levels
    for (let level = 1; level <= totalLevels; level++) {
        const progress = (level - 1) / (totalLevels - 1);
        const scaling = baseScaling + (maxScaling - baseScaling) * progress;
        const percentage = Math.round((scaling - 1.0) * 100);
        const score = calculateScore(level);
        
        milestones.push({
            score: score,
            level: level,
            scaling: Math.round(scaling * 100) / 100,
            text: `+${percentage}%`,
            color: getColorForLevel(level)
        });
    }
    
    return milestones;
}

const PROGRESSIVE_DIFFICULTY = {
    milestones: generateProgressiveDifficulty(),
    maxScaling: 5.5
};

// Game Configuration
const CONFIG = {
    touch: {
        joystickRadius: 60,
        joystickDeadZone: 10,
        dragEnabled: true,
        enabled: true
    },
    canvas: {
        width: 1200,
        height: 700
    },
    player: {
        speed: 5,
        size: 20,
        bulletSpeed: 7,
        fireRate: 150,
        color: '#32B8C6',
        glowIntensity: 0.8
    },
    enemy: {
        types: {
            scout_drone: {
                baseHealth: 2,
                speed: 4,
                size: 14,
                points: 10,
                color: '#00FFFF',
                spawnWeight: 1.0,
                levelRange: [1, 100]
            },
            fighter_wasp: {
                baseHealth: 3,
                speed: 3.5,
                size: 18,
                points: 25,
                color: '#FF6600',
                spawnWeight: 0.8,
                levelRange: [1, 100]
            },
            heavy_cruiser: {
                baseHealth: 5,
                speed: 2.5,
                size: 25,
                points: 50,
                color: '#9900FF',
                spawnWeight: 0.6,
                levelRange: [1, 100]
            },
            behemoth_dreadnought: {
                baseHealth: 25,
                speed: 2,
                size: 30,
                points: 100,
                color: '#CC00FF',
                spawnWeight: 0.55,
                levelRange: [8, 100]
            },
            alien_leviathan: {
                baseHealth: 20,
                speed: 1.5,
                size: 35,
                points: 200,
                color: '#FF00AA',
                spawnWeight: 0.45,
                levelRange: [6, 100]
            },
            void_entity: {
                baseHealth: 25,
                speed: 1,
                size: 35,
                points: 300,
                color: '#FF0066',
                spawnWeight: 0.35,
                levelRange: [12, 100]
            },
            elite_guardian: {
                baseHealth: 8,
                speed: 3,
                size: 32,
                points: 150,
                color: '#CCCCFF',
                spawnWeight: 0.45,
                levelRange: [5, 100]
            },
            swarm_commander: {
                baseHealth: 8,
                speed: 2.5,
                size: 35,
                points: 120,
                color: '#FFDD00',
                spawnWeight: 0.5,
                levelRange: [4, 100]
            }
        },
        bulletSpeed: 5,
        fireRateRange: [1000, 3000]
    },
    game: {
        initialHealth: 3,
        initialSpawnRate: 2000,
        minSpawnRate: 2000,
        difficultyIncreaseInterval: 50000
    },
    superWeapon: {
        threshold: 650,
        duration: 1000,
        shakeIntensity: 0.3
    },
    particles: {
        explosionCount: 15,
        debrisTrail: true,
        glowEffect: true
    }
};

const WAVE_CONFIG = {
    SPAWN_INTERVAL: 500,
    BREAK_DURATION: 3000,
    ANNOUNCE_DURATION: 2000,
    BASE_ENEMIES: 6,
    ENEMIES_PER_WAVE: 2,
    MAX_ENEMIES: 20,
    CLEAR_BONUS_PER_WAVE: 500
};

const SHADOW_OPTIMIZATION = {
    MAX_SHADOW_BLUR: 8,                    // Reduced from 40-60px
    MAX_ENEMIES_FOR_SHADOWS: 8,           // Disable shadows after this
    PROJECTILE_SHADOW_BLUR: 6,             // Bullets: reduced from 25-40px
    PLAYER_SHADOW_BLUR: 8,                 // Player: reduced from 12-28px
    BONUS_SHADOW_BLUR: 5,                  // Bonus: reduced from 10-30px
    ENABLE_SHADOW_OPTIMIZATION: true       // Master switch
};
class LeaderboardManager {
    constructor() {
        // Firebase Configuration - ΑΛΛΑΞΤΕ ΜΕ ΤΑ ΔΙΚΑ ΣΑΣ
        this.firebaseConfig = {
            apiKey: "AIzaSyBFXMiDJkpo9vFCzR6iFI3vHTWL2gKbDLU",
            authDomain: "alieninvaders-908a8.firebaseapp.com",
            databaseURL: "https://alieninvaders-908a8-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "alieninvaders-908a8",
            storageBucket: "alieninvaders-908a8.appspot.com",
            messagingSenderId: "255819258195",
            appId: "1:255819258195:web:13bcc6e025d09d506b29a6",
            measurementId: "G-P4RHJJF2G9"

        };
        
        this.scores = [];
        this.initialized = false;
        this.initFirebase();
    }

    initFirebase() {
        if (!window.firebase) {
            console.warn('Firebase SDK not loaded. Using localStorage fallback.');
            this.scores = this.loadScoresLocal();
            this.initialized = true;
            return;
        }

        if (!firebase.apps.length) {
            firebase.initializeApp(this.firebaseConfig);
        }

        this.db = firebase.database();
        this.loadScoresFromCloud();
    }

    loadScoresFromCloud() {
        const ref = this.db.ref('leaderboard');
        
        ref.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                this.scores = Object.values(data);
                this.scores.sort((a, b) => b.score - a.score);
                this.scores = this.scores.slice(0, 50);
            } else {
                this.scores = [];
            }
            this.initialized = true;
            console.log('Leaderboard loaded:', this.scores);
        }, (error) => {
            console.warn('Firebase error, using localStorage:', error);
            this.scores = this.loadScoresLocal();
            this.initialized = true;
        });
    }

    loadScoresLocal() {
        try {
            const stored = localStorage.getItem('spaceGameLeaderboard');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }

    addScore(playerName, score, level) {
        const entry = {
            name: playerName.trim() || 'Anonymous',
            score: Math.floor(score),
            level: level,
            date: new Date().toLocaleDateString('el-GR'),
            timestamp: Date.now(),
            id: Date.now().toString()
        };

        if (this.initialized && this.db) {
            // Προσπάθεια αποθήκευσης στο Firebase
            this.db.ref('leaderboard/' + entry.id).set(entry)
                .then(() => {
                    console.log('Score saved to Firebase:', entry);
                })
                .catch(error => {
                    console.warn('Firebase save failed, using localStorage:', error);
                    this.saveScoresLocal([...this.scores, entry]);
                });
        } else {
            // Fallback σε localStorage
            this.saveScoresLocal([...this.scores, entry]);
        }
        return entry;
    }

    saveScoresLocal(scores) {
        try {
            localStorage.setItem('spaceGameLeaderboard', JSON.stringify(scores));
            console.log('Score saved to localStorage');
        } catch (e) {
            console.warn('localStorage save failed:', e);
        }
    }

    getScores() {
        return this.scores;
    }

    clearScores() {
        this.scores = [];
        if (this.db) {
            this.db.ref('leaderboard').remove()
                .then(() => console.log('Leaderboard cleared'))
                .catch(error => console.warn('Error clearing leaderboard:', error));
        }
        localStorage.removeItem('spaceGameLeaderboard');
    }

    isTopScore(score) {
        if (this.scores.length < 50) return true;
        return score > this.scores[this.scores.length - 1].score;
    }
}

// Sound Manager
class SoundManager {
    constructor() {
        this.enabled = true;
        this.sounds = {};
        this.audioContext = null;
        this.initialized = false;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('AudioContext created, state:', this.audioContext.state);
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    ensureAudioContext() {
        if (!this.audioContext) return false;
        
        // Resume audio context if suspended (iOS requirement)
        if (this.audioContext.state === 'suspended') {
            console.log('Resuming suspended audio context...');
            this.audioContext.resume().then(() => {
                console.log('Audio context resumed successfully');
                this.initialized = true;
            }).catch(e => {
                console.warn('Failed to resume audio context:', e);
            });
            return false;
        }
        
        this.initialized = true;
        return true;
    }

    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.audioContext) return;

        if (!this.ensureAudioContext()) {
            console.log('Audio context not ready yet');
            return;
        }

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = type;
            oscillator.frequency.value = frequency;
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.warn('Audio playback error:', e);
        }
    }
    
    playLayeredSound(layers, duration) {
        if (!this.enabled || !this.audioContext || !this.ensureAudioContext()) return;
        
        try {
            const now = this.audioContext.currentTime;
            
            layers.forEach(layer => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                
                osc.type = layer.type || 'sine';
                
                // Frequency sweep if specified
                if (layer.freqStart && layer.freqEnd) {
                    osc.frequency.setValueAtTime(layer.freqStart, now);
                    osc.frequency.exponentialRampToValueAtTime(layer.freqEnd, now + duration);
                } else {
                    osc.frequency.value = layer.freq;
                }
                
                // ADSR envelope
                const attack = layer.attack || 0.01;
                const decay = layer.decay || 0.1;
                const sustain = layer.sustain || 0.3;
                const release = layer.release || 0.2;
                
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(layer.volume, now + attack);
                gain.gain.linearRampToValueAtTime(sustain, now + attack + decay);
                gain.gain.setValueAtTime(sustain, now + duration - release);
                gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
                
                osc.start(now);
                osc.stop(now + duration);
            });
        } catch (e) {
            console.warn('Layered audio error:', e);
        }
    }

   playerShoot() {
    // 8-BIT ARCADE BLIP BLIP
    const pitch = 700 + Math.random() * 120;
    this.playLayeredSound([
        { freq: pitch, type: 'square', volume: 0.25, attack: 0.002, decay: 0.03, sustain: 0.1, release: 0.04 },
        { freq: pitch * 0.8, type: 'square', volume: 0.12, attack: 0.001, decay: 0.04, sustain: 0.05, release: 0.03 },
        { freq: pitch * 2, type: 'triangle', volume: 0.1, attack: 0.002, decay: 0.06, sustain: 0.03, release: 0.02 },
        { freq: 0, type: 'noise', volume: 0.10, attack: 0.001, decay: 0.07, sustain: 0.01, release: 0.05 }
    ], 0.07);
}

    enemyShoot() {
        // PROFESSIONAL: Menacing alien weapon sound
        const pitch = 450 + Math.random() * 150;
        this.playLayeredSound([
            { freq: pitch, type: 'square', volume: 0.12, attack: 0.01, decay: 0.04, sustain: 0.08, release: 0.06 },
            { freq: pitch * 0.75, type: 'sawtooth', volume: 0.1, attack: 0.015, decay: 0.05, sustain: 0.06, release: 0.05 },
            { freqStart: pitch * 1.5, freqEnd: pitch * 1.2, type: 'sine', volume: 0.06, attack: 0.005, decay: 0.03, sustain: 0.04, release: 0.04 }
        ], 0.14);
    }

    hit() {
        // PROFESSIONAL: Alert tone with sharp attack
        this.playLayeredSound([
            { freq: 1000, type: 'square', volume: 0.18, attack: 0.002, decay: 0.03, sustain: 0.08, release: 0.05 },
            { freq: 500, type: 'sine', volume: 0.12, attack: 0.005, decay: 0.04, sustain: 0.06, release: 0.04 }
        ], 0.15);
    }

    explosion(size = 1) {
        if (!this.enabled || !this.audioContext) return;
        // PROFESSIONAL: Complex layered explosion with bass impact
        const duration = 0.3 + size * 0.1;
        const bassFreq = 80 - size * 10;
        const midFreq = 250 - size * 20;
        const highFreq = 700 - size * 50;
        
        this.playLayeredSound([
            // Deep bass impact
            { freqStart: bassFreq, freqEnd: bassFreq * 0.5, type: 'sine', volume: 0.4 * size, attack: 0.01, decay: 0.15, sustain: 0.1, release: 0.2 },
            // Mid-range crunch
            { freqStart: midFreq, freqEnd: midFreq * 0.6, type: 'sawtooth', volume: 0.3 * size, attack: 0.02, decay: 0.1, sustain: 0.08, release: 0.15 },
            // High sparkle debris
            { freqStart: highFreq, freqEnd: highFreq * 0.4, type: 'square', volume: 0.2 * size, attack: 0.005, decay: 0.08, sustain: 0.05, release: 0.1 }
        ], duration);
    }

    damageTaken() {
        // PROFESSIONAL: Sharp alarming damage sound
        this.playLayeredSound([
            { freqStart: 800, freqEnd: 200, type: 'square', volume: 0.25, attack: 0.002, decay: 0.05, sustain: 0.08, release: 0.08 },
            { freqStart: 400, freqEnd: 150, type: 'triangle', volume: 0.18, attack: 0.005, decay: 0.06, sustain: 0.06, release: 0.07 },
            { freq: 150, type: 'sine', volume: 0.15, attack: 0.01, decay: 0.08, sustain: 0.05, release: 0.06 }
        ], 0.18);
    }

    superWeapon() {
        if (!this.enabled || !this.audioContext) return;
        // PROFESSIONAL: Epic charging and release blast
        this.playLayeredSound([
            // Rising frequency sweep
            { freqStart: 200, freqEnd: 1200, type: 'sine', volume: 0.3, attack: 0.05, decay: 0.1, sustain: 0.25, release: 0.2 },
            { freqStart: 400, freqEnd: 1600, type: 'square', volume: 0.25, attack: 0.08, decay: 0.12, sustain: 0.2, release: 0.2 },
            // Bass impact
            { freqStart: 100, freqEnd: 50, type: 'sine', volume: 0.4, attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.15 },
            // High sparkle
            { freqStart: 2000, freqEnd: 1000, type: 'sine', volume: 0.2, attack: 0.02, decay: 0.15, sustain: 0.15, release: 0.25 }
        ], 0.6);
    }

    gameOver() {
        if (!this.enabled || !this.audioContext) return;
        // PROFESSIONAL: Melancholic dramatic game over
        this.playLayeredSound([
            { freqStart: 800, freqEnd: 300, type: 'sine', volume: 0.25, attack: 0.02, decay: 0.15, sustain: 0.2, release: 0.25 },
            { freqStart: 400, freqEnd: 200, type: 'sawtooth', volume: 0.2, attack: 0.03, decay: 0.2, sustain: 0.15, release: 0.2 },
            { freqStart: 200, freqEnd: 100, type: 'sine', volume: 0.18, attack: 0.05, decay: 0.25, sustain: 0.1, release: 0.15 }
        ], 0.5);
    }

    levelUp() {
        // PROFESSIONAL: Celebratory achievement fanfare
        this.playLayeredSound([
            { freq: 600, type: 'sine', volume: 0.15, attack: 0.01, decay: 0.03, sustain: 0.05, release: 0.03 },
            { freq: 900, type: 'sine', volume: 0.12, attack: 0.01, decay: 0.04, sustain: 0.04, release: 0.04 }
        ], 0.1);
        setTimeout(() => {
            this.playLayeredSound([
                { freq: 800, type: 'sine', volume: 0.15, attack: 0.01, decay: 0.03, sustain: 0.05, release: 0.03 },
                { freq: 1200, type: 'sine', volume: 0.12, attack: 0.01, decay: 0.04, sustain: 0.04, release: 0.04 }
            ], 0.1);
        }, 80);
        setTimeout(() => {
            this.playLayeredSound([
                { freq: 1000, type: 'sine', volume: 0.18, attack: 0.01, decay: 0.05, sustain: 0.08, release: 0.06 },
                { freq: 1500, type: 'sine', volume: 0.15, attack: 0.01, decay: 0.06, sustain: 0.07, release: 0.06 }
            ], 0.2);
        }, 160);
    }
    
    bonus() {
        // PROFESSIONAL: Cheerful success chime for bonus pickup
        this.playLayeredSound([
            { freqStart: 1000, freqEnd: 1400, type: 'sine', volume: 0.18, attack: 0.01, decay: 0.05, sustain: 0.08, release: 0.1 },
            { freqStart: 1500, freqEnd: 2000, type: 'sine', volume: 0.12, attack: 0.015, decay: 0.06, sustain: 0.06, release: 0.08 },
            { freq: 800, type: 'triangle', volume: 0.1, attack: 0.02, decay: 0.08, sustain: 0.05, release: 0.1 }
        ], 0.25);
    }
}

// Vibration Manager
class VibrationManager {
    constructor() {
        this.enabled = true;
        this.supported = this.checkVibrationSupport();
        console.log('Vibration supported:', this.supported);
    }

    checkVibrationSupport() {
        // Check for standard and webkit prefixed vibration
        return 'vibrate' in navigator || 'webkitVibrate' in navigator;
    }

    vibrate(pattern) {
        if (!this.enabled) {
            console.log('Vibration disabled in settings');
            return;
        }
        
        if (!this.supported) {
            console.log('Vibration not supported on this device');
            return;
        }
        
        try {
            // Convert to array if single number
            const vibratePattern = Array.isArray(pattern) ? pattern : [pattern];
            
            console.log('Attempting vibration with pattern:', vibratePattern);
            
            // Try standard vibration API
            if ('vibrate' in navigator) {
                const result = navigator.vibrate(vibratePattern);
                console.log('Vibration result:', result);
                return;
            }
            
            // Try webkit prefixed version (older iOS)
            if ('webkitVibrate' in navigator) {
                const result = navigator.webkitVibrate(vibratePattern);
                console.log('WebKit vibration result:', result);
                return;
            }
        } catch (e) {
            console.warn('Vibration error:', e);
        }
    }

    shoot() {
        this.vibrate(50);
    }

    hit() {
        this.vibrate(200);
    }

    damage() {
        console.log('Damage vibration triggered');
        this.vibrate([300]);
    }

    superWeapon() {
        console.log('Super weapon vibration triggered');
        this.vibrate([100, 50, 100]);
    }

    explosion() {
        this.vibrate(150);
    }

    bonus() {
        console.log('Bonus vibration triggered');
        this.vibrate([50, 50, 50]);
    }
}

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

// Bonus Pickup Class
class BonusPickup {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = 20;
        this.life = 1;
        this.birthTime = Date.now();
        this.lifetime = 8000;
        this.pulsePhase = 0;
        this.velocityY = 1;
        
        const configs = {
            shield: { color: '#00CCFF', icon: '🛡️' },
            health: { color: '#00FF00', icon: '❤️' },
            rapidFire: { color: '#FFFF00', icon: '⚡' },
            multiShot: { color: '#0099FF', icon: '🔱' },
            multiplier: { color: '#FFD700', icon: '⭐' }
        };
        
        this.config = configs[type] || configs.shield;
    }
    
    update(canvas, playerX, playerY) {
        this.pulsePhase += 0.1;
        this.y += this.velocityY;
        
        // Attraction to player
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
            this.x += (dx / dist) * 1.5;
            this.y += (dy / dist) * 1.5;
        }
        
        const age = Date.now() - this.birthTime;
        if (age > this.lifetime * 0.7) {
            this.life = Math.max(0, 1 - (age - this.lifetime * 0.7) / (this.lifetime * 0.3));
        }
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        
        const pulse = 1 + Math.sin(this.pulsePhase) * 0.2;
        const glowIntensity = 20 + Math.sin(this.pulsePhase) * 10;
        
        // Outer glow
        ctx.shadowBlur = glowIntensity;
        ctx.shadowColor = this.config.color;
        
        // Background circle
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * pulse);
        gradient.addColorStop(0, this.config.color);
        gradient.addColorStop(0.5, this.config.color + '80');
        gradient.addColorStop(1, this.config.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Icon
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#000000';
        ctx.fillText(this.config.icon, this.x, this.y);
        
        ctx.restore();
    }
    
    isDead() {
        return this.life <= 0 || Date.now() - this.birthTime > this.lifetime;
    }
    
    collidesWith(playerX, playerY, playerSize) {
        return distance(this.x, this.y, playerX, playerY) < this.size + playerSize;
    }
}


// Utility Functions
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Particle Class for Explosion Effects
class Particle {
    constructor(x, y, color, type = 'normal') {
        this.x = x;
        this.y = y;
        this.size = randomRange(2, 8);
        this.speedX = randomRange(-4, 4);
        this.speedY = randomRange(-4, 4);
        this.color = color;
        this.life = 1;
        this.decay = randomRange(0.015, 0.035);
        this.type = type;
        this.angle = Math.random() * Math.PI * 2;
        this.rotation = randomRange(-0.1, 0.1);
        this.gravity = type === 'debris' ? 0.1 : 0;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.life -= this.decay;
        this.size *= 0.96;
        this.angle += this.rotation;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        
        if (this.type === 'debris') {
            // Draw debris with trail
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
            
            // Trail effect
            ctx.globalAlpha = this.life * 0.3;
            ctx.fillRect(-this.size/2 - this.speedX, -this.size/2 - this.speedY, this.size * 0.7, this.size * 0.7);
        } else if (this.type === 'glow') {
            // Glowing particle
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Normal particle
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

// Shockwave Effect
class Shockwave {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 80;
        this.color = color;
        this.life = 1;
        this.speed = 4;
    }

    update() {
        this.radius += this.speed;
        this.life -= 0.03;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life * 0.5;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    isDead() {
        return this.life <= 0 || this.radius >= this.maxRadius;
    }
}

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

// Bullet Class
class Bullet {
    constructor(x, y, velocityX, velocityY, color, isPlayerBullet = true, enemyType = null) {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.radius = 4;
        this.color = color;
        this.isPlayerBullet = isPlayerBullet;
        this.enemyType = enemyType;
        this.trail = [];
        this.pulsePhase = 0;
    }

    update() {
        this.trail.push({ x: this.x, y: this.y, life: 1 });
        if (this.trail.length > 8) this.trail.shift();
        
        this.trail.forEach(t => t.life -= 0.15);
        this.trail = this.trail.filter(t => t.life > 0);
        
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.pulsePhase += 0.2;
    }

    draw(ctx) {
        if (this.isPlayerBullet) {
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else {
            this.drawEnemyProjectile(ctx);
        }
    }
    
    drawEnemyProjectile(ctx) {
        ctx.save();
        
        // Draw trail
        this.trail.forEach((t, i) => {
            ctx.globalAlpha = t.life * 0.4;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            ctx.fillStyle = this.color;
            const size = this.radius * 0.6 * t.life;
            ctx.beginPath();
            ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
        
        if (this.enemyType === 'scout_drone') {
            // Small energetic cyan dot with glow
            const pulse = 1 + Math.sin(this.pulsePhase) * 0.3;
            ctx.shadowBlur = 8 * pulse;
            ctx.shadowColor = '#00FFFF';
            
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 6 * pulse);
            gradient.addColorStop(0, '#FFFFFF');
            gradient.addColorStop(0.3, '#00FFFF');
            gradient.addColorStop(1, '#00CED1');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 6 * pulse, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.enemyType === 'fighter_wasp') {
            // Medium orange/red plasma bolt
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#FF6600';
            
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 8);
            gradient.addColorStop(0, '#FFFFFF');
            gradient.addColorStop(0.3, '#FFFF00');
            gradient.addColorStop(0.6, '#FF6600');
            gradient.addColorStop(1, '#CC0000');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - 10);
            ctx.lineTo(this.x + 4, this.y);
            ctx.lineTo(this.x, this.y + 10);
            ctx.lineTo(this.x - 4, this.y);
            ctx.closePath();
            ctx.fill();
            
            // Inner glow
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.enemyType === 'heavy_cruiser') {
            // Large heavy projectile with yellow core
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#FFFF00';
            
            // Outer dark layer
            const outerGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 12);
            outerGradient.addColorStop(0, '#FFFF00');
            outerGradient.addColorStop(0.4, '#CC00CC');
            outerGradient.addColorStop(1, '#660066');
            
            ctx.fillStyle = outerGradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 12, 0, Math.PI * 2);
            ctx.fill();
            
            // Yellow core
            const pulse = 0.7 + Math.sin(this.pulsePhase) * 0.3;
            ctx.fillStyle = '#FFFF00';
            ctx.shadowBlur = 40;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 5 * pulse, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.enemyType === 'behemoth_dreadnought' || this.enemyType === 'alien_leviathan' || this.enemyType === 'void_entity' || this.enemyType === 'elite_guardian' || this.enemyType === 'swarm_commander') {
            // Epic massive projectile
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#FF00FF';
            
            const pulse = 1 + Math.sin(this.pulsePhase) * 0.2;
            
            // Outer ring
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 15 * pulse, 0, Math.PI * 2);
            ctx.stroke();
            
            // Main body
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 15);
            gradient.addColorStop(0, '#FFFFFF');
            gradient.addColorStop(0.3, '#FF00FF');
            gradient.addColorStop(0.7, '#CC00CC');
            gradient.addColorStop(1, '#660066');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 13 * pulse, 0, Math.PI * 2);
            ctx.fill();
            
            // Cyan accents
            for (let i = 0; i < 4; i++) {
                const angle = (Math.PI * 2 / 4) * i + this.pulsePhase * 0.5;
                const x = this.x + Math.cos(angle) * 10;
                const y = this.y + Math.sin(angle) * 10;
                ctx.fillStyle = '#00FFFF';
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // Default enemy projectile
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    isOffScreen(canvas) {
        return (
            this.x < -20 ||
            this.x > canvas.width + 20 ||
            this.y < -20 ||
            this.y > canvas.height + 20
        );
    }
}

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
        this.dropThresholds = [0.75, 0.5, 0.25];

        const designs = [
            { name: 'VOID OVERLORD',    color: '#FF0066' },
            { name: 'XENOPHAGE PRIME',  color: '#AA00FF' },
            { name: 'LEVIATHAN KING',   color: '#00DDCC' },
            { name: 'DARK COMMANDER',   color: '#FF4400' },
            { name: 'OMEGA DESTROYER',  color: '#FFD700' },
        ];
        this.designIndex = (this.bossLevel - 1) % designs.length;
        this.color = designs[this.designIndex].color;
        this.name  = designs[this.designIndex].name;
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

    checkDropThreshold() {
        const pct = this.health / this.maxHealth;
        for (let i = this.dropThresholds.length - 1; i >= 0; i--) {
            if (pct <= this.dropThresholds[i]) {
                this.dropThresholds.splice(i, 1);
                if (pct <= 0.25) return ['health', 'shield', 'rapidFire'];
                if (pct <= 0.5)  return ['health', 'shield'];
                return ['rapidFire'];
            }
        }
        return null;
    }

    draw(ctx) {
        if (!Number.isFinite(this.x) || !Number.isFinite(this.y)) return;
        ctx.save();
        if (this.phase === 2) ctx.globalAlpha = 0.72 + Math.sin(this.pulsePhase * 6) * 0.28;
        ctx.shadowBlur = this.hitFlash > 0 ? 55 : 32;
        ctx.shadowColor = this.hitFlash > 0 ? '#FFFFFF' : this.color;
        const flash = this.hitFlash > 0;
        const p2 = this.phase === 2;
        const pp = this.pulsePhase;
        const s = this.size;
        const bx = this.x, by = this.y;

        switch (this.designIndex) {

            case 0: { // ── VOID OVERLORD ── magenta hexagon
                ctx.lineWidth = 3;
                ctx.strokeStyle = p2 ? '#FF66AA' : '#FF0066';
                ctx.fillStyle = flash ? '#FFF' : (p2 ? '#FF0066' : '#990044');
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const a = (Math.PI * 2 / 6) * i + pp * 0.4;
                    const v = 0.88 + Math.sin(pp + i * 1.1) * 0.12;
                    i === 0 ? ctx.moveTo(bx + Math.cos(a)*s*v, by + Math.sin(a)*s*v)
                            : ctx.lineTo(bx + Math.cos(a)*s*v, by + Math.sin(a)*s*v);
                }
                ctx.closePath(); ctx.fill(); ctx.stroke();
                ctx.globalAlpha = (p2 ? 1 : 0.55) + Math.sin(pp*2)*0.2;
                ctx.strokeStyle = '#FF88CC'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(bx, by, s*1.35, 0, Math.PI*2); ctx.stroke();
                ctx.globalAlpha = 1;
                ctx.fillStyle = `rgba(255,0,${p2?80:102},${0.5+Math.sin(pp*3)*0.5})`;
                ctx.shadowBlur = 20;
                ctx.beginPath(); ctx.arc(bx, by, s*0.32, 0, Math.PI*2); ctx.fill();
                break;
            }

            case 1: { // ── XENOPHAGE PRIME ── purple octopus
                // Tentacles
                ctx.lineWidth = 2;
                for (let i = 0; i < 6; i++) {
                    const ta = (Math.PI*2/6)*i + pp*0.25;
                    const tx = bx + Math.cos(ta)*s*0.7, ty = by + Math.sin(ta)*s*0.7;
                    const ex = bx + Math.cos(ta)*s*1.6, ey = by + Math.sin(ta)*s*1.6;
                    const cx1 = tx + Math.cos(ta + Math.sin(pp+i)*0.9)*s*0.6;
                    const cy1 = ty + Math.sin(ta + Math.sin(pp+i)*0.9)*s*0.6;
                    ctx.strokeStyle = flash ? '#FFF' : `rgba(170,0,255,${0.5+Math.sin(pp+i)*0.3})`;
                    ctx.beginPath(); ctx.moveTo(tx, ty);
                    ctx.quadraticCurveTo(cx1, cy1, ex, ey); ctx.stroke();
                }
                // Octagonal body
                ctx.fillStyle = flash ? '#FFF' : (p2 ? '#6600AA' : '#330066');
                ctx.strokeStyle = p2 ? '#DD44FF' : '#AA00FF'; ctx.lineWidth = 3;
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const a = (Math.PI*2/8)*i + pp*0.2;
                    const r = s*(0.88 + Math.sin(pp*2+i*0.7)*0.12);
                    i === 0 ? ctx.moveTo(bx+Math.cos(a)*r, by+Math.sin(a)*r)
                            : ctx.lineTo(bx+Math.cos(a)*r, by+Math.sin(a)*r);
                }
                ctx.closePath(); ctx.fill(); ctx.stroke();
                // Eye
                ctx.fillStyle = flash ? '#FFF' : '#FF00FF';
                ctx.shadowBlur = 18;
                ctx.beginPath(); ctx.arc(bx, by, s*0.28, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#1a001a';
                ctx.beginPath(); ctx.arc(bx, by, s*0.12, 0, Math.PI*2); ctx.fill();
                break;
            }

            case 2: { // ── LEVIATHAN KING ── teal elongated diamond + scales
                // Outer shimmer rings
                for (let r = 0; r < 2; r++) {
                    ctx.globalAlpha = (0.25 + r*0.15) + Math.sin(pp*2+r)*0.1;
                    ctx.strokeStyle = '#00FFDD'; ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.ellipse(bx, by, s*(1.1+r*0.25), s*(1.5+r*0.25), pp*0.15, 0, Math.PI*2);
                    ctx.stroke();
                }
                ctx.globalAlpha = this.phase === 2 ? 0.72 + Math.sin(pp*6)*0.28 : 1;
                // Main elongated diamond body
                ctx.fillStyle = flash ? '#FFF' : (p2 ? '#007766' : '#004455');
                ctx.strokeStyle = p2 ? '#44FFEE' : '#00DDCC'; ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(bx, by - s*1.25);
                ctx.lineTo(bx + s*0.65, by);
                ctx.lineTo(bx, by + s*1.25);
                ctx.lineTo(bx - s*0.65, by);
                ctx.closePath(); ctx.fill(); ctx.stroke();
                // Spine line
                ctx.strokeStyle = p2 ? '#88FFEE' : '#00FFCC'; ctx.lineWidth = 1.5;
                ctx.globalAlpha = 0.7;
                ctx.beginPath(); ctx.moveTo(bx, by-s*1.1); ctx.lineTo(bx, by+s*1.1); ctx.stroke();
                // Scale dots
                ctx.fillStyle = '#00FFCC'; ctx.globalAlpha = 0.6;
                for (let i = -3; i <= 3; i++) {
                    ctx.beginPath(); ctx.arc(bx, by + i*s*0.3, s*0.07, 0, Math.PI*2); ctx.fill();
                }
                // Core
                ctx.globalAlpha = 1;
                ctx.fillStyle = `rgba(0,255,200,${0.4+Math.sin(pp*3)*0.5})`;
                ctx.shadowBlur = 22;
                ctx.beginPath(); ctx.arc(bx, by, s*0.28, 0, Math.PI*2); ctx.fill();
                break;
            }

            case 3: { // ── DARK COMMANDER ── red crystal + 4 spikes
                // 4 crystal spikes
                ctx.lineWidth = 2.5;
                for (let i = 0; i < 4; i++) {
                    const sa = (Math.PI/2)*i + pp*0.08;
                    const len = s*(1.4 + Math.sin(pp*2+i)*0.15);
                    const wx = bx + Math.cos(sa)*len, wy = by + Math.sin(sa)*len;
                    const lx = bx + Math.cos(sa+0.25)*s*0.4, ly = by + Math.sin(sa+0.25)*s*0.4;
                    const rx = bx + Math.cos(sa-0.25)*s*0.4, ry = by + Math.sin(sa-0.25)*s*0.4;
                    ctx.fillStyle = flash ? '#FFF' : (p2 ? '#FF6622' : '#CC2200');
                    ctx.strokeStyle = p2 ? '#FF8844' : '#FF4400';
                    ctx.beginPath(); ctx.moveTo(wx,wy); ctx.lineTo(lx,ly); ctx.lineTo(rx,ry);
                    ctx.closePath(); ctx.fill(); ctx.stroke();
                }
                // Central diamond core
                ctx.fillStyle = flash ? '#FFF' : (p2 ? '#440000' : '#220000');
                ctx.strokeStyle = p2 ? '#FF8844' : '#FF4400'; ctx.lineWidth = 3;
                const cd = s*0.58;
                ctx.beginPath();
                ctx.moveTo(bx,     by-cd);
                ctx.lineTo(bx+cd,  by);
                ctx.lineTo(bx,     by+cd);
                ctx.lineTo(bx-cd,  by);
                ctx.closePath(); ctx.fill(); ctx.stroke();
                // Glowing center
                ctx.fillStyle = `rgba(255,${p2?100:30},0,${0.55+Math.sin(pp*3)*0.45})`;
                ctx.shadowBlur = 25;
                ctx.beginPath(); ctx.arc(bx, by, s*0.27, 0, Math.PI*2); ctx.fill();
                break;
            }

            case 4: { // ── OMEGA DESTROYER ── gold 8-point star + rotating ring
                // Outer rotating ring segments
                ctx.lineWidth = 2;
                for (let i = 0; i < 12; i++) {
                    const a1 = (Math.PI*2/12)*i + pp*0.5;
                    const a2 = a1 + 0.18;
                    ctx.strokeStyle = flash ? '#FFF' : `rgba(255,215,0,${0.4+Math.sin(pp+i*0.5)*0.4})`;
                    ctx.beginPath();
                    ctx.arc(bx, by, s*1.45, a1, a2); ctx.stroke();
                }
                // 8-point star body
                ctx.fillStyle = flash ? '#FFF' : (p2 ? '#AA8800' : '#664400');
                ctx.strokeStyle = p2 ? '#FFEE44' : '#FFD700'; ctx.lineWidth = 3;
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const outer = (Math.PI*2/8)*i - Math.PI/2;
                    const inner = outer + Math.PI/8;
                    const ro = s*(0.9+Math.sin(pp*2+i)*0.1);
                    const ri = s*0.42;
                    if (i===0) ctx.moveTo(bx+Math.cos(outer)*ro, by+Math.sin(outer)*ro);
                    else       ctx.lineTo(bx+Math.cos(outer)*ro, by+Math.sin(outer)*ro);
                    ctx.lineTo(bx+Math.cos(inner)*ri, by+Math.sin(inner)*ri);
                }
                ctx.closePath(); ctx.fill(); ctx.stroke();
                // Inner counter-rotating ring
                ctx.globalAlpha = 0.55 + Math.sin(pp*2)*0.3;
                ctx.strokeStyle = '#FFEE44'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(bx, by, s*0.55, -pp*0.8, -pp*0.8+Math.PI*1.6); ctx.stroke();
                // Blazing core
                ctx.globalAlpha = 1;
                ctx.fillStyle = `rgba(255,${p2?200:180},0,${0.6+Math.sin(pp*4)*0.4})`;
                ctx.shadowBlur = 30;
                ctx.beginPath(); ctx.arc(bx, by, s*0.3, 0, Math.PI*2); ctx.fill();
                break;
            }
        }

        ctx.restore();
    }

    isOffScreen(canvas) {
        return this.y > canvas.height + 120;
    }

    collidesWith(x, y, radius) {
        return distance(this.x, this.y, x, y) < this.size + radius;
    }
}

// Player Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = CONFIG.player.size;
        this.speed = CONFIG.player.speed;
        this.color = CONFIG.player.color;
        this.health = CONFIG.game.initialHealth;
        this.lastFireTime = 0;
        this.pulsePhase = 0;
        this.trailParticles = [];
        this.invincible = false;
        this.invincibleTimer = 0;
        this.INVINCIBLE_DURATION = 120;
    }

    move(dx, dy, canvas) {
        // Add trail particle
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            this.trailParticles.push({
                x: this.x,
                y: this.y + this.size * 0.5,
                life: 1,
                size: 3
            });
        }

        this.x += dx * this.speed;
        this.y += dy * this.speed;

        // Keep player within bounds
        this.x = Math.max(this.size * 1.5, Math.min(canvas.width - this.size * 1.5, this.x));
        this.y = Math.max(this.size * 1.5, Math.min(canvas.height - this.size * 1.5, this.y));
    }

    shoot(currentTime, hasMultiShot = false) {
        if (currentTime - this.lastFireTime >= CONFIG.player.fireRate) {
            this.lastFireTime = currentTime;
            
            if (hasMultiShot) {
                // Triple spread shot
                return [
                    new Bullet(this.x - this.size * 0.6, this.y - this.size * 0.5, -1, -CONFIG.player.bulletSpeed, '#32B8C6', true),
                    new Bullet(this.x, this.y - this.size * 0.5, 0, -CONFIG.player.bulletSpeed, '#32B8C6', true),
                    new Bullet(this.x + this.size * 0.6, this.y - this.size * 0.5, 1, -CONFIG.player.bulletSpeed, '#32B8C6', true)
                ];
            } else {
                // Dual bullets from wings
                return [
                    new Bullet(this.x - this.size * 0.4, this.y - this.size * 0.5, 0, -CONFIG.player.bulletSpeed, '#32B8C6', true),
                    new Bullet(this.x + this.size * 0.4, this.y - this.size * 0.5, 0, -CONFIG.player.bulletSpeed, '#32B8C6', true)
                ];
            }
        }
        return null;
    }

    update() {
        this.pulsePhase += 0.08;
        if (this.invincibleTimer > 0) {
            this.invincibleTimer--;
            if (this.invincibleTimer === 0) {
                this.invincible = false;
            }
        }
        
        // Update trail particles
        this.trailParticles = this.trailParticles.filter(p => {
            p.life -= 0.05;
            p.size *= 0.95;
            return p.life > 0;
        });
    }

    draw(ctx) {
        // Draw trail
        this.trailParticles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life * 0.6;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        if (this.invincible) {
            const blink = Math.sin(Date.now() * 0.025) > 0;
            if (!blink) return;
        }

        ctx.save();

        // Premium futuristic design with enhanced glow
        const glowIntensity = 20 + Math.sin(this.pulsePhase) * 8;
        ctx.shadowBlur = glowIntensity;
        ctx.shadowColor = this.color;
        
        // Advanced angular cockpit
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#E0FFFF';
        ctx.lineWidth = 2.5;
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size * 1.3);
        ctx.lineTo(this.x - this.size * 0.35, this.y - this.size * 0.6);
        ctx.lineTo(this.x - this.size * 0.25, this.y - this.size * 0.4);
        ctx.lineTo(this.x + this.size * 0.25, this.y - this.size * 0.4);
        ctx.lineTo(this.x + this.size * 0.35, this.y - this.size * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Sleek main hull with metallic edges
        ctx.fillStyle = '#29A3B0';
        ctx.beginPath();
        ctx.moveTo(this.x - this.size * 0.5, this.y - this.size * 0.4);
        ctx.lineTo(this.x - this.size * 0.35, this.y + this.size * 0.7);
        ctx.lineTo(this.x + this.size * 0.35, this.y + this.size * 0.7);
        ctx.lineTo(this.x + this.size * 0.5, this.y - this.size * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Advanced swept wings
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.moveTo(this.x - this.size * 0.5, this.y - this.size * 0.2);
        ctx.lineTo(this.x - this.size * 1.2, this.y + this.size * 0.1);
        ctx.lineTo(this.x - this.size * 1.1, this.y + this.size * 0.5);
        ctx.lineTo(this.x - this.size * 0.7, this.y + this.size * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(this.x + this.size * 0.5, this.y - this.size * 0.2);
        ctx.lineTo(this.x + this.size * 1.2, this.y + this.size * 0.1);
        ctx.lineTo(this.x + this.size * 1.1, this.y + this.size * 0.5);
        ctx.lineTo(this.x + this.size * 0.7, this.y + this.size * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Weapon mount accents
        ctx.fillStyle = '#00E5FF';
        ctx.shadowBlur = 15;
        ctx.fillRect(this.x - this.size * 0.45, this.y - this.size * 0.5, this.size * 0.1, this.size * 0.3);
        ctx.fillRect(this.x + this.size * 0.35, this.y - this.size * 0.5, this.size * 0.1, this.size * 0.3);
        
        // Pulsing engine cores
        const engineGlow = 0.5 + Math.sin(this.pulsePhase * 2) * 0.3;
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#FF6B35';
        ctx.fillStyle = `rgba(255, 107, 53, ${engineGlow})`;
        ctx.beginPath();
        ctx.arc(this.x - this.size * 0.28, this.y + this.size * 0.7, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + this.size * 0.28, this.y + this.size * 0.7, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Glowing weapon charge indicators
        ctx.fillStyle = '#00FFFF';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00FFFF';
        ctx.beginPath();
        ctx.arc(this.x - this.size * 0.4, this.y - this.size * 0.55, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + this.size * 0.4, this.y - this.size * 0.55, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Shield generator glow
        ctx.globalAlpha = 0.2 + Math.sin(this.pulsePhase) * 0.1;
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 1.4, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }

    takeDamage() {
        this.health--;
        return this.health <= 0;
    }

    makeInvincible() {
        this.invincible = true;
        this.invincibleTimer = this.INVINCIBLE_DURATION;
    }
}

// Enemy Class
class Enemy {
    constructor(x, y, typeName = 'scout') {
        this.x = x;
        this.y = y;
        this.typeName = typeName;
        const typeConfig = CONFIG.enemy.types[typeName];
        const diffConfig = DIFFICULTY_CONFIG[GAME_SETTINGS.difficulty];
        
        this.size = typeConfig.size;
        this.speed = typeConfig.speed;
        this.color = typeConfig.color;
        this.baseHealth = typeConfig.baseHealth;
        this.health = Math.ceil(typeConfig.baseHealth * diffConfig.enemyHealthMultiplier);
        this.maxHealth = this.health;
        this.points = Math.ceil(typeConfig.points * diffConfig.scoreMultiplier);
        this.lastFireTime = 0;
        this.fireRate = randomRange(CONFIG.enemy.fireRateRange[0], CONFIG.enemy.fireRateRange[1]) * (diffConfig.fireRateMultiplier || 1);
        this.angle = 0;
        this.movePattern = typeName === 'scout' ? 1 : (typeName === 'boss' ? 2 : Math.floor(Math.random() * 2));
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.hitFlash = 0;
    }

    update(playerX, playerY, canvas) {
        this.angle += 0.02;

        switch (this.movePattern) {
            case 0: // Move straight down
                this.y += this.speed;
                break;
            case 1: // Sine wave pattern
                this.y += this.speed * 0.8;
                this.x += Math.sin(this.angle * 2) * 2;
                break;
            case 2: // Move toward player
                const dx = playerX - this.x;
                const dy = playerY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0) {
                    this.x += (dx / dist) * this.speed * 0.5;
                    this.y += (dy / dist) * this.speed * 0.5;
                }
                break;
        }

        // Keep within horizontal bounds
        this.x = Math.max(this.size, Math.min(canvas.width - this.size, this.x));
    }

    shoot(currentTime, playerX, playerY) {
        if (currentTime - this.lastFireTime >= this.fireRate) {
            this.lastFireTime = currentTime;
            
            // Calculate direction to player
            const dx = playerX - this.x;
            const dy = playerY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                const bullets = [];
                const baseVelX = (dx / dist) * CONFIG.enemy.bulletSpeed * 0.7;
                const baseVelY = (dy / dist) * CONFIG.enemy.bulletSpeed;
                
                // Fighter fires spread pattern sometimes
                if (this.typeName === 'fighter_wasp' && Math.random() > 0.6) {
                    bullets.push(new Bullet(
                        this.x - 8, this.y + this.size,
                        baseVelX - 1, baseVelY,
                        '#FF6600', false, this.typeName
                    ));
                    bullets.push(new Bullet(
                        this.x + 8, this.y + this.size,
                        baseVelX + 1, baseVelY,
                        '#FF6600', false, this.typeName
                    ));
                } else {
                    bullets.push(new Bullet(
                        this.x, this.y + this.size,
                        baseVelX, baseVelY,
                        this.getProjectileColor(), false, this.typeName
                    ));
                }
                
                return bullets.length === 1 ? bullets[0] : bullets;
            }
        }
        return null;
    }
    
    getProjectileColor() {
        switch (this.typeName) {
            case 'scout_drone': return '#00FFFF';
            case 'fighter_wasp': return '#FF6600';
            case 'heavy_cruiser': return '#FFFF00';
            case 'behemoth_dreadnought': return '#FF00FF';
            case 'alien_leviathan': return '#FF00AA';
            case 'void_entity': return '#FF0066';
            case 'elite_guardian': return '#CCCCFF';
            case 'swarm_commander': return '#FFDD00';
            default: return '#FF5459';
        }
    }

    draw(ctx) {
        if (!Number.isFinite(this.x) || !Number.isFinite(this.y)) {
        console.warn(`⚠️ Invalid enemy at ${this.x}, ${this.y}`);
        return;  // ← ΔΕΝ σχεδιάζει τον εχθρό
    }
    
    if (this.x < -150 || this.x > 1350 || 
        this.y < -150 || this.y > 850) {
        return;  // ← ΔΕΝ σχεδιάζει τον εχθρό που είναι έξω από screen
    }
		this.pulsePhase += 0.05;
        
        ctx.save();
        ctx.shadowBlur = 15 + Math.sin(this.pulsePhase) * 5;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = this.typeName === 'boss' ? 3 : 2;

        // Different alien/futuristic designs based on type
        if (this.typeName === 'scout_drone') {
            // Insectoid sleek alien scout
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 1.5;
            
            // Main body
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.size * 0.8);
            ctx.lineTo(this.x - this.size * 0.5, this.y);
            ctx.lineTo(this.x - this.size * 0.3, this.y - this.size * 0.8);
            ctx.lineTo(this.x + this.size * 0.3, this.y - this.size * 0.8);
            ctx.lineTo(this.x + this.size * 0.5, this.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Antenna sensors
            ctx.strokeStyle = '#00CED1';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x - this.size * 0.2, this.y - this.size * 0.7);
            ctx.lineTo(this.x - this.size * 0.4, this.y - this.size * 1.1);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.x + this.size * 0.2, this.y - this.size * 0.7);
            ctx.lineTo(this.x + this.size * 0.4, this.y - this.size * 1.1);
            ctx.stroke();
            
            // Glowing core
            ctx.fillStyle = '#00FFFF';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.25, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.typeName === 'fighter_wasp') {
            // Aggressive combat alien fighter
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            
            // Sharp pointed front
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.size * 0.9);
            ctx.lineTo(this.x - this.size * 0.4, this.y + this.size * 0.4);
            ctx.lineTo(this.x - this.size * 0.6, this.y - this.size * 0.2);
            ctx.lineTo(this.x - this.size * 0.3, this.y - this.size * 0.9);
            ctx.lineTo(this.x + this.size * 0.3, this.y - this.size * 0.9);
            ctx.lineTo(this.x + this.size * 0.6, this.y - this.size * 0.2);
            ctx.lineTo(this.x + this.size * 0.4, this.y + this.size * 0.4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Weapon pods with glow
            ctx.fillStyle = '#CC0000';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#FF0000';
            ctx.fillRect(this.x - this.size * 0.7, this.y, this.size * 0.25, this.size * 0.45);
            ctx.fillRect(this.x + this.size * 0.45, this.y, this.size * 0.25, this.size * 0.45);
            
            // Red threat lights
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(this.x - this.size * 0.3, this.y, 3, 0, Math.PI * 2);
            ctx.arc(this.x + this.size * 0.3, this.y, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.typeName === 'heavy_cruiser') {
            // Imposing alien battleship with heavy armor
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            
            // Main armored hull
            ctx.fillRect(this.x - this.size * 0.6, this.y - this.size * 0.6, this.size * 1.2, this.size * 1.4);
            ctx.strokeRect(this.x - this.size * 0.6, this.y - this.size * 0.6, this.size * 1.2, this.size * 1.4);
            
            // Layered armor plates
            ctx.fillStyle = '#6B008B';
            ctx.shadowBlur = 10;
            ctx.fillRect(this.x - this.size * 0.5, this.y - this.size * 0.4, this.size * 0.45, this.size * 0.35);
            ctx.fillRect(this.x + this.size * 0.05, this.y - this.size * 0.4, this.size * 0.45, this.size * 0.35);
            ctx.fillRect(this.x - this.size * 0.3, this.y + this.size * 0.1, this.size * 0.6, this.size * 0.3);
            
            // Heavy weapon turrets
            ctx.fillStyle = '#4B0082';
            ctx.fillRect(this.x - this.size * 0.8, this.y + this.size * 0.1, this.size * 0.2, this.size * 0.6);
            ctx.fillRect(this.x + this.size * 0.6, this.y + this.size * 0.1, this.size * 0.2, this.size * 0.6);
            
            // Golden accent lights
            ctx.fillStyle = '#FFD700';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#FFD700';
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(this.x - this.size * 0.3 + i * this.size * 0.3, this.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.typeName === 'behemoth_dreadnought') {
            // Epic alien mega-structure
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 4;
            
            // Massive central core
            ctx.shadowBlur = 8;
            ctx.fillRect(this.x - this.size * 0.5, this.y - this.size * 0.4, this.size, this.size * 1.3);
            ctx.strokeRect(this.x - this.size * 0.5, this.y - this.size * 0.4, this.size, this.size * 1.3);
            
            // Complex wing structures
            ctx.fillStyle = '#CC00CC';
            ctx.beginPath();
            ctx.moveTo(this.x - this.size * 0.5, this.y - this.size * 0.2);
            ctx.lineTo(this.x - this.size * 1.3, this.y - this.size * 0.7);
            ctx.lineTo(this.x - this.size * 1.2, this.y);
            ctx.lineTo(this.x - this.size * 1.1, this.y + this.size * 0.6);
            ctx.lineTo(this.x - this.size * 0.7, this.y + this.size * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(this.x + this.size * 0.5, this.y - this.size * 0.2);
            ctx.lineTo(this.x + this.size * 1.3, this.y - this.size * 0.7);
            ctx.lineTo(this.x + this.size * 1.2, this.y);
            ctx.lineTo(this.x + this.size * 1.1, this.y + this.size * 0.6);
            ctx.lineTo(this.x + this.size * 0.7, this.y + this.size * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Pulsing energy core
            const coreGlow = 0.6 + Math.sin(this.pulsePhase) * 0.4;
            ctx.fillStyle = `rgba(255, 0, 255, ${coreGlow})`;
            ctx.shadowBlur = 40;
            ctx.shadowColor = '#FF00FF';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.35, 0, Math.PI * 2);
            ctx.fill();
            
            // Weak point indicators
            ctx.fillStyle = '#00FFFF';
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#00FFFF';
            for (let i = 0; i < 4; i++) {
                const angle = (Math.PI * 2 / 4) * i + this.pulsePhase;
                const x = this.x + Math.cos(angle) * this.size * 0.6;
                const y = this.y + Math.sin(angle) * this.size * 0.6;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.typeName === 'alien_leviathan') {
            // Tentacled organic alien — large pink/magenta creature
            ctx.strokeStyle = '#FF00AA';
            ctx.lineWidth = 2;

            // Central body (oval)
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, this.size * 0.55, this.size * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Tentacles
            ctx.strokeStyle = '#FF66CC';
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI / 4) * i - Math.PI / 8;
                const waveOffset = Math.sin(this.pulsePhase + i * 1.2) * this.size * 0.25;
                ctx.beginPath();
                ctx.moveTo(this.x + Math.cos(angle) * this.size * 0.5, this.y + Math.sin(angle) * this.size * 0.5);
                ctx.quadraticCurveTo(
                    this.x + Math.cos(angle + 0.3) * this.size * 0.9 + waveOffset,
                    this.y + Math.sin(angle + 0.3) * this.size * 0.9,
                    this.x + Math.cos(angle + 0.5) * this.size * 1.3 + waveOffset,
                    this.y + this.size * 1.1
                );
                ctx.stroke();
            }

            // Glowing eye
            const eyeGlow = 0.5 + Math.sin(this.pulsePhase * 2) * 0.5;
            ctx.fillStyle = `rgba(255, 200, 255, ${eyeGlow})`;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#FF00AA';
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.size * 0.1, this.size * 0.22, 0, Math.PI * 2);
            ctx.fill();

        } else if (this.typeName === 'void_entity') {
            // Dark shadowy entity — crimson/dark red
            ctx.strokeStyle = '#FF0066';
            ctx.lineWidth = 2;

            // Outer distortion ring (spinning)
            const spinAngle = this.pulsePhase * 1.5;
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const a = (Math.PI * 2 / 8) * i + spinAngle;
                const r = this.size * (0.9 + Math.sin(this.pulsePhase * 3 + i) * 0.2);
                i === 0 ? ctx.moveTo(this.x + Math.cos(a) * r, this.y + Math.sin(a) * r)
                        : ctx.lineTo(this.x + Math.cos(a) * r, this.y + Math.sin(a) * r);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Inner void core (darker)
            ctx.fillStyle = '#330011';
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2);
            ctx.fill();

            // Pulsing red core
            const coreAlpha = 0.6 + Math.sin(this.pulsePhase * 4) * 0.4;
            ctx.fillStyle = `rgba(255, 0, 102, ${coreAlpha})`;
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#FF0066';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.2, 0, Math.PI * 2);
            ctx.fill();

        } else if (this.typeName === 'elite_guardian') {
            // Armored fast guardian — light blue/silver
            ctx.strokeStyle = '#AAAAFF';
            ctx.lineWidth = 2;

            // Diamond-shaped armored body
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.size);
            ctx.lineTo(this.x + this.size * 0.65, this.y - this.size * 0.1);
            ctx.lineTo(this.x + this.size * 0.45, this.y + this.size * 0.8);
            ctx.lineTo(this.x - this.size * 0.45, this.y + this.size * 0.8);
            ctx.lineTo(this.x - this.size * 0.65, this.y - this.size * 0.1);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Wing fins
            ctx.fillStyle = '#9999EE';
            ctx.beginPath();
            ctx.moveTo(this.x - this.size * 0.65, this.y - this.size * 0.1);
            ctx.lineTo(this.x - this.size * 1.2, this.y + this.size * 0.3);
            ctx.lineTo(this.x - this.size * 0.45, this.y + this.size * 0.6);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(this.x + this.size * 0.65, this.y - this.size * 0.1);
            ctx.lineTo(this.x + this.size * 1.2, this.y + this.size * 0.3);
            ctx.lineTo(this.x + this.size * 0.45, this.y + this.size * 0.6);
            ctx.closePath();
            ctx.fill();

            // Bright energy core
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#CCCCFF';
            ctx.beginPath();
            ctx.arc(this.x, this.y + this.size * 0.1, this.size * 0.2, 0, Math.PI * 2);
            ctx.fill();

        } else if (this.typeName === 'swarm_commander') {
            // Command ship — golden/yellow hexagonal
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2.5;

            // Hexagonal body
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (Math.PI * 2 / 6) * i - Math.PI / 6;
                const r = this.size * 0.8;
                i === 0 ? ctx.moveTo(this.x + Math.cos(a) * r, this.y + Math.sin(a) * r)
                        : ctx.lineTo(this.x + Math.cos(a) * r, this.y + Math.sin(a) * r);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Command antenna
            ctx.strokeStyle = '#FFEE44';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.size * 0.8);
            ctx.lineTo(this.x, this.y - this.size * 1.3);
            ctx.stroke();
            ctx.fillStyle = '#FFEE44';
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.size * 1.3, 4, 0, Math.PI * 2);
            ctx.fill();

            // Swarm signal rings
            const ringAlpha = 0.3 + Math.sin(this.pulsePhase * 2) * 0.3;
            ctx.strokeStyle = `rgba(255, 215, 0, ${ringAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 1.2, 0, Math.PI * 2);
            ctx.stroke();

            // Golden core
            ctx.fillStyle = '#FFD700';
            ctx.shadowBlur = 18;
            ctx.shadowColor = '#FFAA00';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.28, 0, Math.PI * 2);
            ctx.fill();
        }

        // Health bar for all enemies with health > 1
        if (this.maxHealth > 1) {
            const healthPercent = this.health / this.maxHealth;
            const barWidth = this.size * 1.2;
            const barHeight = 3;
            const barY = this.y - this.size - 10;
            
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(this.x - barWidth / 2, barY, barWidth, barHeight);
            
            let healthColor = '#00FF00';
            if (healthPercent <= 0.25) healthColor = '#FF0000';
            else if (healthPercent <= 0.5) healthColor = '#FFFF00';
            
            ctx.fillStyle = healthColor;
            ctx.fillRect(this.x - barWidth / 2, barY, barWidth * healthPercent, barHeight);
        }

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

        ctx.restore();
    }

    isOffScreen(canvas) {
        return this.y > canvas.height + 50;
    }
}

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

class GradientCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 100;
    }
    
    getGradient(ctx, type, size, color) {
        const key = `${type}-${size}-${color}`;
        
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        let gradient;
        if (type === 'radial') {
            gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
            gradient.addColorStop(0, '#' + color);
            gradient.addColorStop(0.5, '#' + color + '80');
            gradient.addColorStop(1, '#' + color + '00');
        }
        
        if (this.cache.size > this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, gradient);
        return gradient;
    }
    
    clear() {
        this.cache.clear();
    }
}
// Gallery Data
const GALLERY_ITEMS = [
  {
    id: 1,
    title: "Nova Battleship",
    image: "https://konskall.github.io/alieninvaders/Gallery/nova_battle_ship.png",
    category: "enemies"
  },
  {
    id: 2,
    title: "Xenophages",
    image: "https://konskall.github.io/alieninvaders/Gallery/xenophages.png",
    category: "scenes"
  },
  {
    id: 3,
    title: "Assemble the Army",
    image: "https://konskall.github.io/alieninvaders/Gallery/assemble_the_army.png",
    category: "enemies"
  },
  {
    id: 4,
    title: "The Battle of the Singularity",
    image: "https://konskall.github.io/alieninvaders/Gallery/black_hole.png",
    category: "player"
  },
  {
    id: 5,
    title: "Ultimate Defence",
    image: "https://konskall.github.io/alieninvaders/Gallery/shileds_on.png",
    category: "backgrounds"
  },
  {
    id: 6,
    title: "Critical Hit",
    image: "https://konskall.github.io/alieninvaders/Gallery/critical_hit.png",
    category: "ui"
  },
   {
    id: 7,
    title: "Amalgama",
    image: "https://konskall.github.io/alieninvaders/Gallery/amalgama.png",
    category: "ui"
  },
  {
    id: 8,
    title: "Mothership",
    image: "https://konskall.github.io/alieninvaders/Gallery/mothership.png",
    category: "enemies"
  },
  {
    id: 9,
    title: "Yamato Gun",
    image: "https://konskall.github.io/alieninvaders/Gallery/yamato_gun.png",
    category: "scenes"
  },
  {
    id: 10,
    title: "The Headquarters Space Station",
    image: "https://konskall.github.io/alieninvaders/Gallery/the_station.png",
    category: "enemies"
  },
  {
    id: 11,
    title: "The Two Suns Battle",
    image: "https://konskall.github.io/alieninvaders/Gallery/two_suns.png",
    category: "player"
  },
  {
    id: 12,
    title: "The Hive",
    image: "https://konskall.github.io/alieninvaders/Gallery/the_hive.png",
    category: "backgrounds"
  },
  {
    id: 13,
    title: "Deadly Tentacles",
    image: "https://konskall.github.io/alieninvaders/Gallery/tentacles.png",
    category: "ui"
  },
   {
    id: 14,
    title: "Ultimate Attack",
    image: "https://konskall.github.io/alieninvaders/Gallery/super_weapon.png",
    category: "ui"
  },
  {
    id: 15,
    title: "Neutrino Laser Beam",
    image: "https://konskall.github.io/alieninvaders/Gallery/laser_beam.png",
    category: "ui"
  },
  // Προσθέστε περισσότερα artwork εδώ
];

// Gallery Manager Class
class GalleryManager {
  constructor() {
    this.items = GALLERY_ITEMS;
    this.init();
  }

  init() {
    this.renderGallery();
    this.setupEventListeners();
  }

  renderGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;

    galleryGrid.innerHTML = '';

    this.items.forEach(item => {
      const galleryItem = document.createElement('div');
      galleryItem.className = 'gallery-item';
      galleryItem.innerHTML = `
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <div class="gallery-item-overlay">
          <div class="gallery-item-overlay-text">${item.title}</div>
        </div>
      `;

      galleryItem.addEventListener('click', () => this.openLightbox(item));
      galleryGrid.appendChild(galleryItem);
    });
  }

  openLightbox(item) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxTitle = document.getElementById('lightbox-title');

    lightboxImage.src = item.image;
    lightboxTitle.textContent = item.title;
    lightbox.classList.remove('hidden');
  }

  closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.add('hidden');
  }

  setupEventListeners() {
    // Gallery open/close buttons
    const galleryBtn = document.getElementById('gallery-btn');
    const galleryCloseBtn = document.getElementById('gallery-close-btn');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightbox = document.getElementById('lightbox');
	

    if (galleryBtn) {
      galleryBtn.addEventListener('click', () => this.showGallery());
    }

    if (galleryCloseBtn) {
      galleryCloseBtn.addEventListener('click', () => this.hideGallery());
    }

    if (lightboxClose) {
      lightboxClose.addEventListener('click', () => this.closeLightbox());
    }

    // Close lightbox when clicking outside
    if (lightbox) {
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
          this.closeLightbox();
        }
      });
    }
  }

  showGallery() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('gallery-screen').classList.remove('hidden');
  }

  hideGallery() {
    document.getElementById('gallery-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
  }
}
// Main Game Class
class Game {
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
        this.score = 0;
        this.player = null;
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
        
        // Show credits splash screen, then auto-transition to settings
        setTimeout(() => {
            this.transitionFromCreditsToSettings();
        }, 10000);
        
        // Allow click to skip credits
        const creditsScreen = document.getElementById('credits-screen');
        creditsScreen.addEventListener('click', () => {
            if (this.state === 'credits') {
                this.transitionFromCreditsToSettings();
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
            
            document.getElementById('settings-screen').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
        });
		const difficultySelect = document.getElementById('difficulty-select')
  if (difficultySelect) {
    difficultySelect.value = GAME_SETTINGS.difficulty
  }
    }
    
    transitionFromCreditsToSettings() {
        if (this.state !== 'credits') return;
        
        this.state = 'settings';
        document.getElementById('credits-screen').classList.add('hidden');
        document.getElementById('settings-screen').classList.remove('hidden');
    }

    setupCanvas() {
        const isMobile = this.isMobileDevice || ('ontouchstart' in window && window.innerWidth <= 1024);
        let width = window.innerWidth;
        let height = window.innerHeight;

        if (!isMobile) {
            const maxW = 750;
            height = window.innerHeight;
            width = Math.min(width, maxW);
        }

        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = '50%';
        this.canvas.style.top = '50%';
        this.canvas.style.transform = 'translate(-50%, -50%)';

        CONFIG.canvas.width = width;
        CONFIG.canvas.height = height;
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
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
        
        console.log(`Screen: ${width}x${height}, Diagonal: ${diagonal.toFixed(0)}px`);
        console.log(`Auto sensitivity multiplier: ${autoMultiplier.toFixed(2)}x (OPTIMIZED)`);
        
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
            
            // Super weapon activation with S key
            // Super weapon activation with S key
            if ((e.key === 's' || e.key === 'S') && this.state === 'playing' && this.superWeapon.ready && !this.superWeapon.active) {
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
        
        // Prevent default touch behaviors
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
		 this.setupStoryModeListeners();
		 
		 document.getElementById('view-leaderboard-btn').addEventListener('click', () => {
    this.showLeaderboardModal();
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
                console.log('User interaction detected, initializing audio...');
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
            console.log('Start button clicked, ensuring audio context...');
            if (this.soundManager.audioContext) {
                this.soundManager.audioContext.resume().then(() => {
                    console.log('Audio context resumed on start');
                });
            }
        });
        
        settingsStartBtn.addEventListener('click', () => {
            console.log('Settings start button clicked, ensuring audio context...');
            if (this.soundManager.audioContext) {
                this.soundManager.audioContext.resume().then(() => {
                    console.log('Audio context resumed on settings start');
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
        });
        
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
        });
        
        superWeaponButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            superWeaponButton.classList.remove('active');
        });
        
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
        const canvasX = (touchX - rect.left) * (this.canvas.width / rect.width);
        const canvasY = (touchY - rect.top) * (this.canvas.height / rect.height);
        
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
            
            // OPTIMIZED: Higher clamp threshold for faster movement
            const magnitude = Math.sqrt(this.touchState.directionX ** 2 + this.touchState.directionY ** 2);
            if (magnitude > 2.5) {
                this.touchState.directionX = (this.touchState.directionX / magnitude) * 2.5;
                this.touchState.directionY = (this.touchState.directionY / magnitude) * 2.5;
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
        
        // OPTIMIZED: Higher clamp for faster movement
        const magnitude = Math.sqrt(this.touchState.directionX ** 2 + this.touchState.directionY ** 2);
        if (magnitude > 2.0) {
            this.touchState.directionX = (this.touchState.directionX / magnitude) * 2.0;
            this.touchState.directionY = (this.touchState.directionY / magnitude) * 2.0;
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
        
        this.player = new Player(
            this.canvas.width / 2,
            this.canvas.height - 100
        );

        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
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
        this.startGame();
    }
    
    goToSettings() {
        // Go to settings screen from game over
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('settings-screen').classList.remove('hidden');
        this.state = 'settings';
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
                    <h2><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#f1c40f" viewBox="0 0 24 24">
  <path d="M12 2l2.39 6.91L22 10l-5 3.64L17.78 22 12 18.27 6.22 22 7 13.64 2 10l7.61-1.09L12 2z"/>
</svg> Κοινοποίηση Σκορ <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#f1c40f" viewBox="0 0 24 24">
  <path d="M12 2l2.39 6.91L22 10l-5 3.64L17.78 22 12 18.27 6.22 22 7 13.64 2 10l7.61-1.09L12 2z"/>
</svg></h2>
                    <div class="share-message">${message}</div>
                    <div class="share-buttons">
                         <button class="share-btn" data-platform="facebook">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="4" fill="#1877F2"/>
  <path fill="#FFFFFF" d="M15.117 8.325h-1.5c-.319 0-.761.227-.761.86v1.02h2.288l-.298 2.207h-1.99v7.318h-2.301v-7.318H8.659v-2.207h1.5V9.362c0-1.498.91-2.292 2.156-2.292.39 0 .729.029 1.102.07v1.156z"/>
</svg> Facebook
                        </button>
						<button class="share-btn" data-platform="copy">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
  <path d="M9 2a2 2 0 012 2h1a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2v-.586l-2-2V6a2 2 0 012-2h2a2 2 0 011-2z"/>
</svg> Αντιγραφή
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
    
    shareScore(platform, message) {
        const url = window.location.href;
        const encodedMessage = encodeURIComponent(message);
        const encodedUrl = encodeURIComponent(url);
        
        switch (platform) {
            case 'copy':
                // Copy to clipboard
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(message).then(() => {
                        alert('Αντιγράφηκε στο clipboard! ✅');
                    }).catch(() => {
                        alert('Αποτυχία αντιγραφής');
                    });
                }
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`, '_blank');
                break;
        }
        
        // Close dialog after sharing
        const dialog = document.getElementById('share-dialog');
        if (dialog) {
            setTimeout(() => dialog.remove(), 500);
        }
    }

    gameOver() {
    this.state = 'gameOver';
    if (this.boss) {
        this.boss = null;
        this.homingBullets = [];
        this.updateBossHUD();
    }
    this.soundManager.gameOver();
    this.musicManager.stop();
    document.getElementById('final-score').textContent = this.score;
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('active-bonuses').classList.add('hidden');
    document.getElementById('touch-controls').classList.add('hidden');
    this.resetJoystick();
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
showLeaderboardModal() {
    const modal = document.getElementById('leaderboard-modal');
    const leaderboardList = document.getElementById('leaderboard-list');
    const playerNameInput = document.getElementById('player-name-input');
    const form = document.getElementById('score-entry-form');
    // Εμφανίστε το modal
    modal.classList.remove('hidden');
    
    // Ενημερώστε τη λίστα με τα τρέχοντα σκορ
    this.updateLeaderboardDisplay();
    
    // Καταχώριση σκορ κατά την υποβολή του form
    form.onsubmit = (e) => {
        e.preventDefault();
        const playerName = playerNameInput.value.trim();
        
        if (!playerName) {
            alert('Παρακαλώ εισάγετε ένα όνομα!');
            return;
        }
        
        // Προσθέστε το σκορ
        this.leaderboardManager.addScore(playerName, this.score, this.progressiveDifficulty.currentLevel);
        
        // Ενημερώστε τη λίστα
        this.updateLeaderboardDisplay();
        
        // Καθαρίστε το input
        playerNameInput.value = '';
        
        // Δείξτε ένα μήνυμα επιτυχίας
        const btn = form.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = '✓ Αποθηκεύτηκε!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    };
    
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

updateLeaderboardDisplay() {
    const leaderboardList = document.getElementById('leaderboard-list');
    const scores = this.leaderboardManager.getScores();
    
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
                <div class="leaderboard-name">${this.escapeHtml(entry.name)}</div>
                <div class="leaderboard-meta">
                    <span>📊 Level ${entry.level}</span>
                    <span>${entry.date}</span>
                </div>
            </div>
            <div class="leaderboard-score">${entry.score.toLocaleString()}</div>
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
    return text.replace(/[&<>"']/g, m => map[m]);
}
    spawnEnemy() {
        const x = randomRange(50, this.canvas.width - 50);
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
                            this.canvas.width / 2,
                            this.canvas.height * 0.35,
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
        this.boss = new Boss(this.canvas.width, this.canvas.height, this.waveState.number);
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
            maxRadius: Math.max(this.canvas.width, this.canvas.height) * 1.5,
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
                this.canvas.width / 2 + (i - 1) * 150,
                this.canvas.height / 2,
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
        
        // Reset super weapon after duration
        setTimeout(() => {
            this.superWeapon.active = false;
            this.screenShake.intensity = 0;
        }, CONFIG.superWeapon.duration);
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

        this.player.move(dx, dy, this.canvas);

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
        
        if (shouldFire) {
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

        // Spawn dynamic background elements
        this.updateBackgroundElements();

        // Wave-based enemy spawning
        this.updateWaveSystem();

        // Update player
        if (this.player) {
            this.player.update();
        }

        // Update stars
        this.stars.forEach(star => star.update(this.canvas));

        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            return !bullet.isOffScreen(this.canvas);
        });

        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(this.player.x, this.player.y, this.canvas);
            
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

        // Remove off-screen enemies
        this.enemies = this.enemies.filter(enemy => !enemy.isOffScreen(this.canvas));

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
                this.homingBullets = [];
            }
        }

        // Update homing bullets
        this.homingBullets = this.homingBullets.filter(hb => {
            hb.update(this.player.x, this.player.y);
            return !hb.isOffScreen(this.canvas);
        });

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

        // Update bonus pickups
        this.bonusPickups = this.bonusPickups.filter(bonus => {
            bonus.update(this.canvas, this.player.x, this.player.y);
            
            // Check collision with player
            if (bonus.collidesWith(this.player.x, this.player.y, this.player.size)) {
                this.collectBonus(bonus);
                return false;
            }
            
            return !bonus.isDead();
        });
        
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
    }

    draw() {
        // Apply screen shake
        this.ctx.save();
        this.ctx.translate(this.screenShake.x, this.screenShake.y);
        
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(-this.screenShake.x, -this.screenShake.y, this.canvas.width, this.canvas.height);

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

        // Draw stars
        this.stars.forEach(star => star.draw(this.ctx));
        
        // Background elements DISABLED - clean space background

        // Wave announcement banner
        const bannerElapsed = this.currentTime - (this.waveState.bannerStartTime || 0);
        const bannerRemaining = WAVE_CONFIG.ANNOUNCE_DURATION - bannerElapsed;
        if (bannerRemaining > 0) {
            const alpha = Math.min(1, bannerRemaining / 200);
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
        if (this.player && this.state === 'playing') {
            // Draw shield if active
            if (this.activeBonuses.shield) {
                this.ctx.save();
                const shieldPulse = 0.7 + Math.sin(Date.now() * 0.005) * 0.3;
                this.ctx.globalAlpha = shieldPulse;
                this.ctx.strokeStyle = '#00CCFF';
                this.ctx.lineWidth = 3;
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = '#00CCFF';
                this.ctx.beginPath();
                this.ctx.arc(this.player.x, this.player.y, this.player.size * 2, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.restore();
            }
            
            this.player.draw(this.ctx);
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
                this.canvas.width / 2,
                this.canvas.height / 2,
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
    gameLoop() {
        this.handleInput();
        this.updateGame();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}


// Global game reference for Enemy class
let game = null;

// Initialize game when page loads
window.addEventListener('load', () => {
    game = new Game();
});
