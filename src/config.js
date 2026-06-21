// Game Settings (user configurable)
export const GAME_SETTINGS = {
    difficulty: 'easy',
    soundEnabled: true,
    joystickVisible: true,
    vibrationEnabled: true,
    joystickSensitivity: 2.0,
    autoSensitivityMultiplier: 1.0,
    autoFire: true
};

// Difficulty Multipliers
export const DIFFICULTY_CONFIG = {
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
export function generateProgressiveDifficulty() {
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

export const PROGRESSIVE_DIFFICULTY = {
    milestones: generateProgressiveDifficulty(),
    maxScaling: 5.5
};

// Game Configuration
export const CONFIG = {
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
    // Fixed logical play-field for online co-op. Both devices simulate AND render
    // in these coordinates, then letterbox-fit ("contain") it to their own screen,
    // so a phone and a desktop see the exact same arena (no cropping / misalignment).
    coopArena: {
        width: 450,
        height: 800
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

export const WAVE_CONFIG = {
    SPAWN_INTERVAL: 500,
    BREAK_DURATION: 3000,
    ANNOUNCE_DURATION: 2000,
    BASE_ENEMIES: 6,
    ENEMIES_PER_WAVE: 2,
    MAX_ENEMIES: 20,
    CLEAR_BONUS_PER_WAVE: 500
};

export const SHADOW_OPTIMIZATION = {
    MAX_SHADOW_BLUR: 8,                    // Reduced from 40-60px
    MAX_ENEMIES_FOR_SHADOWS: 8,           // Disable shadows after this
    PROJECTILE_SHADOW_BLUR: 6,             // Bullets: reduced from 25-40px
    PLAYER_SHADOW_BLUR: 8,                 // Player: reduced from 12-28px
    BONUS_SHADOW_BLUR: 5,                  // Bonus: reduced from 10-30px
    ENABLE_SHADOW_OPTIMIZATION: true       // Master switch
};
