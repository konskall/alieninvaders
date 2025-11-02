// Game Settings (user configurable)
const GAME_SETTINGS = {
    difficulty: 'normal',
    soundEnabled: true,
    joystickVisible: true,
    vibrationEnabled: true,
    joystickSensitivity: 2.0,
    autoSensitivityMultiplier: 1.0,
    autoFire: true
};

// Difficulty Multipliers
const DIFFICULTY_CONFIG = {
    easy: {
        spawnRateMultiplier: 0.7,
        enemyHealthMultiplier: 0.8,
        enemyDamageMultiplier: 0.6,
        scoreMultiplier: 1.5,
        bossSpawnFrequency: 0.3,
        progressionSpeed: 0.7
    },
    normal: {
        spawnRateMultiplier: 1.0,
        enemyHealthMultiplier: 1.0,
        enemyDamageMultiplier: 1.0,
        scoreMultiplier: 1.0,
        bossSpawnFrequency: 1.0,
        progressionSpeed: 1.0
    },
    hard: {
        spawnRateMultiplier: 1.4,
        enemyHealthMultiplier: 1.3,
        enemyDamageMultiplier: 1.5,
        scoreMultiplier: 0.7,
        bossSpawnFrequency: 1.8,
        progressionSpeed: 1.3
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
                levelRange: [1, 15]
            },
            fighter_wasp: {
                baseHealth: 3,
                speed: 3.5,
                size: 18,
                points: 25,
                color: '#FF6600',
                spawnWeight: 0.8,
                levelRange: [11, 30]
            },
            heavy_cruiser: {
                baseHealth: 5,
                speed: 2.5,
                size: 28,
                points: 50,
                color: '#9900FF',
                spawnWeight: 0.6,
                levelRange: [21, 50]
            },
            behemoth_dreadnought: {
                baseHealth: 10,
                speed: 2,
                size: 40,
                points: 100,
                color: '#CC00FF',
                spawnWeight: 0.3,
                levelRange: [40, 70]
            },
            alien_leviathan: {
                baseHealth: 15,
                speed: 1.5,
                size: 50,
                points: 200,
                color: '#FF00AA',
                spawnWeight: 0.2,
                levelRange: [60, 85]
            },
            void_entity: {
                baseHealth: 20,
                speed: 1,
                size: 60,
                points: 300,
                color: '#FF0066',
                spawnWeight: 0.15,
                levelRange: [75, 100]
            },
            elite_guardian: {
                baseHealth: 8,
                speed: 3,
                size: 32,
                points: 150,
                color: '#CCCCFF',
                spawnWeight: 0.25,
                levelRange: [70, 100]
            },
            swarm_commander: {
                baseHealth: 8,
                speed: 2.5,
                size: 35,
                points: 120,
                color: '#FFDD00',
                spawnWeight: 0.3,
                levelRange: [50, 100]
            }
        },
        bulletSpeed: 5,
        fireRateRange: [1000, 3000]
    },
    game: {
        initialHealth: 3,
        initialSpawnRate: 2000,
        minSpawnRate: 400,
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

const SHADOW_OPTIMIZATION = {
    MAX_SHADOW_BLUR: 8,                    // Reduced from 40-60px
    MAX_ENEMIES_FOR_SHADOWS: 12,           // Disable shadows after this
    PROJECTILE_SHADOW_BLUR: 6,             // Bullets: reduced from 25-40px
    PLAYER_SHADOW_BLUR: 8,                 // Player: reduced from 12-28px
    BONUS_SHADOW_BLUR: 5,                  // Bonus: reduced from 10-30px
    ENABLE_SHADOW_OPTIMIZATION: true       // Master switch
};

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

// Background Element Classes (DISABLED - NOT USED)
class BackgroundPlanet {
    constructor(canvas) {
        this.x = Math.random() * canvas.width;
        this.y = -100;
        this.size = randomRange(40, 120);
        this.speed = randomRange(0.3, 0.8);
        this.rotation = 0;
        this.rotationSpeed = randomRange(-0.005, 0.005);
        this.colors = [
            ['#FF6B35', '#F7931E', '#C1502E'],
            ['#4A90E2', '#357ABD', '#2C5F8D'],
            ['#9B59B6', '#8E44AD', '#6C3483'],
            ['#E74C3C', '#C0392B', '#922B21'],
            ['#1ABC9C', '#16A085', '#138D75']
        ];
        this.colorScheme = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.life = 1;
        this.maxLife = randomRange(15000, 25000);
        this.birthTime = Date.now();
    }

    update(canvas) {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
        const age = Date.now() - this.birthTime;
        if (age > this.maxLife * 0.8) {
            this.life = Math.max(0, 1 - (age - this.maxLife * 0.8) / (this.maxLife * 0.2));
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life * 0.6;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, this.colorScheme[0]);
        gradient.addColorStop(0.5, this.colorScheme[1]);
        gradient.addColorStop(1, this.colorScheme[2]);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    isDead(canvas) {
        return this.y > canvas.height + 200 || this.life <= 0;
    }
}

class BackgroundNebula {
    constructor(canvas) {
        this.x = Math.random() * canvas.width;
        this.y = -200;
        this.width = randomRange(150, 300);
        this.height = randomRange(100, 200);
        this.speed = randomRange(0.2, 0.5);
        this.colors = [
            ['#FF00FF', '#8B00FF'],
            ['#00FFFF', '#0080FF'],
            ['#FF1493', '#FF69B4'],
            ['#00FF00', '#32CD32']
        ];
        this.colorScheme = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.life = 1;
        this.maxLife = randomRange(25000, 35000);
        this.birthTime = Date.now();
    }

    update(canvas) {
        this.y += this.speed;
        const age = Date.now() - this.birthTime;
        if (age > this.maxLife * 0.7) {
            this.life = Math.max(0, 1 - (age - this.maxLife * 0.7) / (this.maxLife * 0.3));
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life * 0.3;
        
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.width
        );
        gradient.addColorStop(0, this.colorScheme[0]);
        gradient.addColorStop(1, this.colorScheme[1]);

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        ctx.restore();
    }

    isDead(canvas) {
        return this.y > canvas.height + 300 || this.life <= 0;
    }
}

class BackgroundAsteroid {
    constructor(canvas) {
        this.x = Math.random() * canvas.width;
        this.y = -50;
        this.size = randomRange(5, 20);
        this.speed = randomRange(1, 2.5);
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = randomRange(-0.05, 0.05);
        this.life = 1;
        this.maxLife = randomRange(12000, 18000);
        this.birthTime = Date.now();
    }

    update(canvas) {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
        const age = Date.now() - this.birthTime;
        if (age > this.maxLife * 0.8) {
            this.life = Math.max(0, 1 - (age - this.maxLife * 0.8) / (this.maxLife * 0.2));
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life * 0.7;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = '#8B7355';
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            const radius = this.size * (0.8 + Math.random() * 0.4);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    isDead(canvas) {
        return this.y > canvas.height + 100 || this.life <= 0;
    }
}

class BackgroundComet {
    constructor(canvas) {
        this.x = Math.random() * canvas.width;
        this.y = -100;
        this.size = randomRange(8, 15);
        this.speed = randomRange(3, 5);
        this.angle = randomRange(Math.PI / 6, Math.PI / 3);
        this.life = 1;
        this.maxLife = randomRange(20000, 28000);
        this.birthTime = Date.now();
    }

    update(canvas) {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        const age = Date.now() - this.birthTime;
        if (age > this.maxLife * 0.7) {
            this.life = Math.max(0, 1 - (age - this.maxLife * 0.7) / (this.maxLife * 0.3));
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        
        // Tail
        const gradient = ctx.createLinearGradient(
            this.x, this.y,
            this.x - Math.cos(this.angle) * 50, this.y - Math.sin(this.angle) * 50
        );
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.5, '#87CEEB');
        gradient.addColorStop(1, 'rgba(135, 206, 235, 0)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
            this.x - Math.cos(this.angle) * 40,
            this.y - Math.sin(this.angle) * 40
        );
        ctx.stroke();
        
        // Head
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FFFFFF';
        ctx.fillStyle = '#F0F8FF';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    isDead(canvas) {
        return this.x > canvas.width + 100 || this.y > canvas.height + 100 || this.life <= 0;
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
        } else if (this.typeName === 'alien_leviathan') {
			
            // Bio-mechanical terror with tentacles
            ctx.strokeStyle = '#FF00FF';
            ctx.lineWidth = 4;
			
			if (Math.abs(this.x) > this.size * 5 || Math.abs(this.y) > this.size * 5) {
        return; // Skip off-screen rendering
    }
    
    // ✅ FIX 2: Get enemy count
    const enemyCount = (typeof game !== 'undefined' && game.enemies) 
        ? game.enemies.length 
        : 8;
    
    // ✅ FIX 3: Simplify if lagging
    if (enemyCount > 20) {
        ctx.save();
        ctx.shadowBlur = 0;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Show outline
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Health bar
        if (this.maxHealth > 1) {
            const hp = this.health / this.maxHealth;
            ctx.fillStyle = hp > 0.5 ? '#00FF00' : (hp > 0.25 ? '#FFFF00' : '#FF0000');
            ctx.fillRect(this.x - this.size * 0.6, this.y - this.size - 8, 
                        this.size * 1.2 * hp, 3);
        }
        
        ctx.restore();
        return; // ← CRITICAL: Exit here, don't draw complex version
    }
    
    // Continue with existing detailed drawing code...
    // But add validation for coordinates in the complex code
            
            // Main bio-organic hull
            ctx.shadowBlur = 40;
            const bioGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            bioGradient.addColorStop(0, '#FF00AA');
            bioGradient.addColorStop(0.5, '#CC0088');
            bioGradient.addColorStop(1, '#990066');
            ctx.fillStyle = bioGradient;
            
            // Organic main body
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                const variance = 0.85 + Math.sin(this.pulsePhase + i) * 0.15;
                const x = this.x + Math.cos(angle) * this.size * variance;
                const y = this.y + Math.sin(angle) * this.size * variance;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Tentacle appendages
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 6;
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2 / 6) * i + this.pulsePhase * 0.3;
                const tentacleLength = this.size * 1.5;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                for (let j = 0; j <= 3; j++) {
                    const dist = (tentacleLength / 3) * j;
                    const wave = Math.sin(this.pulsePhase * 2 + j) * 15;
                    const x = this.x + Math.cos(angle) * dist + Math.cos(angle + Math.PI/2) * wave;
                    const y = this.y + Math.sin(angle) * dist + Math.sin(angle + Math.PI/2) * wave;
                    ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
            
            // Pulsing bio-core
            const coreGlow = 0.6 + Math.sin(this.pulsePhase * 3) * 0.4;
            ctx.fillStyle = `rgba(255, 0, 255, ${coreGlow})`;
            ctx.shadowBlur = 50;
            ctx.shadowColor = '#FF00FF';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
            
        } else if (this.typeName === 'void_entity') {
            // Incomprehensible dark matter entity
            ctx.strokeStyle = '#FF0066';
            ctx.lineWidth = 5;
            
            // Corruption aura
            const auraGlow = 0.3 + Math.sin(this.pulsePhase) * 0.2;
            ctx.save();
            ctx.globalAlpha = auraGlow;
            const corruptionGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 1.8);
            corruptionGradient.addColorStop(0, '#FF0066');
            corruptionGradient.addColorStop(0.5, '#CC0055');
            corruptionGradient.addColorStop(1, 'rgba(255, 0, 102, 0)');
            ctx.fillStyle = corruptionGradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 1.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            
            // Shifting void form
            ctx.shadowBlur = 60;
            ctx.shadowColor = '#FF0066';
            for (let layer = 0; layer < 3; layer++) {
                const layerPhase = this.pulsePhase + layer * Math.PI / 3;
                const layerSize = this.size * (0.6 + layer * 0.2);
                const layerAlpha = 0.4 - layer * 0.1;
                
                ctx.save();
                ctx.globalAlpha = layerAlpha + Math.sin(layerPhase) * 0.2;
                ctx.fillStyle = layer === 0 ? '#FF0066' : (layer === 1 ? '#CC0055' : '#990044');
                
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI * 2 / 6) * i + layerPhase;
                    const distort = Math.sin(layerPhase * 2 + i) * 0.3;
                    const radius = layerSize * (1 + distort);
                    const x = this.x + Math.cos(angle) * radius;
                    const y = this.y + Math.sin(angle) * radius;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
            
            // Reality tear effects
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 3;
            for (let i = 0; i < 4; i++) {
                const angle = (Math.PI * 2 / 4) * i + this.pulsePhase * 0.7;
                const tearLength = this.size * 0.8;
                ctx.save();
                ctx.globalAlpha = 0.7 + Math.sin(this.pulsePhase * 3 + i) * 0.3;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(
                    this.x + Math.cos(angle) * tearLength,
                    this.y + Math.sin(angle) * tearLength
                );
                ctx.stroke();
                ctx.restore();
            }
            
        } else if (this.typeName === 'elite_guardian') {
            // Advanced sleek warrior design
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;
            
            // Chrome futuristic hull
            const chromeGradient = ctx.createLinearGradient(
                this.x - this.size, this.y - this.size,
                this.x + this.size, this.y + this.size
            );
            chromeGradient.addColorStop(0, '#CCCCFF');
            chromeGradient.addColorStop(0.5, '#FFFFFF');
            chromeGradient.addColorStop(1, '#9999CC');
            ctx.fillStyle = chromeGradient;
            
            // Sharp angular geometry
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#CCCCFF';
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.size * 1.2);
            ctx.lineTo(this.x - this.size * 0.7, this.y - this.size * 0.3);
            ctx.lineTo(this.x - this.size * 0.5, this.y + this.size * 0.8);
            ctx.lineTo(this.x + this.size * 0.5, this.y + this.size * 0.8);
            ctx.lineTo(this.x + this.size * 0.7, this.y - this.size * 0.3);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Advanced weapon systems
            ctx.fillStyle = '#0099FF';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#0099FF';
            ctx.fillRect(this.x - this.size * 0.8, this.y - this.size * 0.2, this.size * 0.15, this.size * 0.8);
            ctx.fillRect(this.x + this.size * 0.65, this.y - this.size * 0.2, this.size * 0.15, this.size * 0.8);
            
            // Energy core indicators
            for (let i = 0; i < 3; i++) {
                const coreY = this.y - this.size * 0.5 + i * this.size * 0.35;
                const pulse = 0.5 + Math.sin(this.pulsePhase * 2 + i * Math.PI / 3) * 0.5;
                ctx.fillStyle = `rgba(0, 255, 255, ${pulse})`;
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#00FFFF';
                ctx.beginPath();
                ctx.arc(this.x, coreY, 4, 0, Math.PI * 2);
                ctx.fill();
            }
            
        } else if (this.typeName === 'swarm_commander') {
            // Command ship with strategic appearance
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            
            // Golden command hull
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#FFDD00';
            ctx.fillStyle = '#FFDD00';
            
            // Central command module
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.size * 0.9);
            ctx.lineTo(this.x - this.size * 0.6, this.y - this.size * 0.2);
            ctx.lineTo(this.x - this.size * 0.7, this.y + this.size * 0.6);
            ctx.lineTo(this.x + this.size * 0.7, this.y + this.size * 0.6);
            ctx.lineTo(this.x + this.size * 0.6, this.y - this.size * 0.2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Command wings
            ctx.fillStyle = '#CC9900';
            ctx.beginPath();
            ctx.moveTo(this.x - this.size * 0.6, this.y);
            ctx.lineTo(this.x - this.size * 1.1, this.y - this.size * 0.3);
            ctx.lineTo(this.x - this.size * 1.0, this.y + this.size * 0.4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(this.x + this.size * 0.6, this.y);
            ctx.lineTo(this.x + this.size * 1.1, this.y - this.size * 0.3);
            ctx.lineTo(this.x + this.size * 1.0, this.y + this.size * 0.4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Navigation systems visible
            const navPulse = 0.6 + Math.sin(this.pulsePhase * 3) * 0.4;
            ctx.fillStyle = `rgba(0, 255, 0, ${navPulse})`;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00FF00';
            for (let i = 0; i < 4; i++) {
                const angle = (Math.PI * 2 / 4) * i;
                const x = this.x + Math.cos(angle) * this.size * 0.4;
                const y = this.y + Math.sin(angle) * this.size * 0.4;
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Command beacon
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.size * 0.5, 5, 0, Math.PI * 2);
            ctx.fill();
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
        this.fireRate = randomRange(CONFIG.enemy.fireRateRange[0], CONFIG.enemy.fireRateRange[1]);
        this.angle = 0;
        this.movePattern = typeName === 'scout' ? 1 : (typeName === 'boss' ? 2 : Math.floor(Math.random() * 2));
        this.pulsePhase = Math.random() * Math.PI * 2;
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
                if (this.typeName === 'fighter' && Math.random() > 0.6) {
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
            case 'scout': return '#00FFFF';
            case 'fighter': return '#FF6600';
            case 'destroyer': return '#FFFF00';
            case 'boss': return '#FF00FF';
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
        
        ctx.restore();
    }

    isOffScreen(canvas) {
        return this.y > canvas.height + 50;
    }
}

// Star Background Class
class Star {
    constructor(x, y, size, speed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.opacity = Math.random() * 0.5 + 0.5;
    }

    update(canvas) {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * canvas.width;
        }
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
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

// Main Game Class
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        // Initialize gradient cache
        this.gradientCache = new GradientCache();
        // Initialize managers
        this.soundManager = new SoundManager();
        this.vibrationManager = new VibrationManager();
        
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
        this.lastEnemySpawn = 0;
        this.spawnRate = CONFIG.game.initialSpawnRate;
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
    }
    
    transitionFromCreditsToSettings() {
        if (this.state !== 'credits') return;
        
        this.state = 'settings';
        document.getElementById('credits-screen').classList.add('hidden');
        document.getElementById('settings-screen').classList.remove('hidden');
    }

    setupCanvas() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Make canvas fill viewport while maintaining reasonable aspect ratio
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Update canvas config for responsive gameplay area
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
        for (let i = 0; i < 150; i++) {
            this.stars.push(
                new Star(
                    Math.random() * this.canvas.width,
                    Math.random() * this.canvas.height,
                    Math.random() * 2,
                    Math.random() * 0.5 + 0.1
                )
            );
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
        this.bonusPickups = [];
        this.activeBonuses = {};
        this.lastEnemySpawn = 0;
        this.lastBonusSpawn = 0;
        
        // Apply difficulty to spawn rate
        const diffConfig = DIFFICULTY_CONFIG[GAME_SETTINGS.difficulty];
        this.spawnRate = CONFIG.game.initialSpawnRate / diffConfig.spawnRateMultiplier;
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
                window.open("https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fkonskall-ai.github.io%2Falieninvaders%2Findex.html&quote=I%20survived%20Level%203%2F100%20in%20Space%20Battle!%20%F0%9F%9A%80",
                       '_blank');
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
        this.soundManager.gameOver();
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over-screen').classList.remove('hidden');
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('active-bonuses').classList.add('hidden');
        document.getElementById('touch-controls').classList.add('hidden');
        this.resetJoystick();
    }

    updateHUD() {
        const scoreElement = document.getElementById('score');
        scoreElement.textContent = this.score;
        
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
        
        // Destroy all enemies on screen
        this.enemies.forEach(enemy => {
            this.score += enemy.points;
            this.createExplosion(enemy.x, enemy.y, enemy.size, enemy.color);
        });
        this.enemies = [];
        
        this.updateHUD();
        this.updateSuperWeaponUI();
        
        // Reset super weapon after duration
        setTimeout(() => {
            this.superWeapon.active = false;
            this.screenShake.intensity = 0;
        }, CONFIG.superWeapon.duration);
    }
    
    createExplosion(x, y, size, color) {
        const particleCount = Math.floor(size / 2) + CONFIG.particles.explosionCount;
        
        // Shockwave
        this.shockwaves.push(new Shockwave(x, y, color));
        
        // Glow particles
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle(x, y, color, 'glow'));
        }
        
        // Debris particles
        for (let i = 0; i < particleCount / 2; i++) {
            this.particles.push(new Particle(x, y, color, 'debris'));
        }
        
        // Bright flash particles
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(x, y, '#FFFFFF', 'glow'));
        }
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
        const elapsedTime = this.currentTime - this.gameStartTime;

        // Increase difficulty over time with progressive difficulty scaling
        const diffConfig = DIFFICULTY_CONFIG[GAME_SETTINGS.difficulty];
        const progressiveScaling = this.progressiveDifficulty.currentScaling;
        const difficultyLevel = Math.floor(elapsedTime / CONFIG.game.difficultyIncreaseInterval);
        
        // Apply both time-based and score-based difficulty
        const baseSpawnRate = CONFIG.game.initialSpawnRate - difficultyLevel * 200;
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

        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.update();
            return !particle.isDead();
        });
		if (this.particles.length > 800) {
        const excess = this.particles.length - 800;
        this.particles.splice(0, excess);
}
        
        // Update shockwaves
        this.shockwaves = this.shockwaves.filter(wave => {
            wave.radius += wave.speed;
            wave.life -= 0.02;
            return !wave.life <= 0 && wave.radius < wave.maxRadius;
        });
        
        // Update screen shake
        if (this.screenShake.intensity > 0) {
            this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity * 20;
            this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity * 20;
            this.screenShake.intensity *= 0.9;
        } else {
            this.screenShake.x = 0;
            this.screenShake.y = 0;
        }

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
                
                console.log('Player hit by enemy bullet');
                    enemy.health--;
                    
                    if (enemy.health <= 0) {
                        // Enemy destroyed
                        const enemyX = enemy.x;
                        const enemyY = enemy.y;
                        this.enemies.splice(j, 1);
                        
                        // Apply score multiplier if active
                        const points = this.activeBonuses.multiplier ? enemy.points * 2 : enemy.points;
                        this.score += points;
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
                } else if (this.player.takeDamage()) {
                    this.gameOver();
                } else {
                    this.updateHUD();
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

        // Draw stars
        this.stars.forEach(star => star.draw(this.ctx));
        
        // Background elements DISABLED - clean space background
        
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

        // Draw bullets
        this.bullets.forEach(bullet => bullet.draw(this.ctx));

        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx));

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
        
        this.ctx.restore();
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
        // Find current milestone based on score
        let currentMilestone = PROGRESSIVE_DIFFICULTY.milestones[0];
        
        for (let i = PROGRESSIVE_DIFFICULTY.milestones.length - 1; i >= 0; i--) {
            if (this.score >= PROGRESSIVE_DIFFICULTY.milestones[i].score) {
                currentMilestone = PROGRESSIVE_DIFFICULTY.milestones[i];
                break;
            }
        }
        
        // Check if difficulty level changed
        if (currentMilestone.level !== this.progressiveDifficulty.currentLevel) {
            this.progressiveDifficulty.currentLevel = currentMilestone.level;
            this.progressiveDifficulty.currentScaling = currentMilestone.scaling;
            this.progressiveDifficulty.currentMilestone = currentMilestone;
            
            // Play level up sound
            this.soundManager.levelUp();
            
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