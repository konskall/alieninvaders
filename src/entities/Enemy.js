import { CONFIG, DIFFICULTY_CONFIG, GAME_SETTINGS } from '../config.js';
import { randomRange } from '../utils.js';
import { Bullet } from './Bullet.js';
export class Enemy {
    constructor(x, y, typeName = 'scout', scaling = 1) {
        this.x = x;
        this.y = y;
        this.typeName = typeName;
        const typeConfig = CONFIG.enemy.types[typeName];
        const diffConfig = DIFFICULTY_CONFIG[GAME_SETTINGS.difficulty];

        this.size = typeConfig.size;
        this.speed = typeConfig.speed;
        this.color = typeConfig.color;
        this.baseHealth = typeConfig.baseHealth;
        // Progressive toughness ramp (softened): the 100-level progression scaling
        // (1.0..5.5) raises enemy HP as you climb, so deep runs actually get harder.
        const progScale = 1 + (Math.max(1, scaling) - 1) * 0.5;
        this.health = Math.ceil(typeConfig.baseHealth * diffConfig.enemyHealthMultiplier * progScale);
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

    if (this.x < -150 || this.x > CONFIG.canvas.width + 150 ||
        this.y < -150 || this.y > CONFIG.canvas.height + 150) {
        return;  // ← ΔΕΝ σχεδιάζει τον εχθρό που είναι έξω από screen
    }
		this.pulsePhase += 0.05;

        ctx.save();
        ctx.shadowBlur = CONFIG.lowFX ? 0 : 15 + Math.sin(this.pulsePhase) * 5;
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
            ctx.shadowBlur = CONFIG.lowFX ? 0 : 20;
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
            ctx.shadowBlur = CONFIG.lowFX ? 0 : 15;
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
            ctx.shadowBlur = CONFIG.lowFX ? 0 : 10;
            ctx.fillRect(this.x - this.size * 0.5, this.y - this.size * 0.4, this.size * 0.45, this.size * 0.35);
            ctx.fillRect(this.x + this.size * 0.05, this.y - this.size * 0.4, this.size * 0.45, this.size * 0.35);
            ctx.fillRect(this.x - this.size * 0.3, this.y + this.size * 0.1, this.size * 0.6, this.size * 0.3);

            // Heavy weapon turrets
            ctx.fillStyle = '#4B0082';
            ctx.fillRect(this.x - this.size * 0.8, this.y + this.size * 0.1, this.size * 0.2, this.size * 0.6);
            ctx.fillRect(this.x + this.size * 0.6, this.y + this.size * 0.1, this.size * 0.2, this.size * 0.6);

            // Golden accent lights
            ctx.fillStyle = '#FFD700';
            ctx.shadowBlur = CONFIG.lowFX ? 0 : 20;
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
            ctx.shadowBlur = CONFIG.lowFX ? 0 : 8;
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
            ctx.shadowBlur = CONFIG.lowFX ? 0 : 40;
            ctx.shadowColor = '#FF00FF';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.35, 0, Math.PI * 2);
            ctx.fill();

            // Weak point indicators
            ctx.fillStyle = '#00FFFF';
            ctx.shadowBlur = CONFIG.lowFX ? 0 : 25;
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
            ctx.shadowBlur = CONFIG.lowFX ? 0 : 20;
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
            ctx.shadowBlur = CONFIG.lowFX ? 0 : 0;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2);
            ctx.fill();

            // Pulsing red core
            const coreAlpha = 0.6 + Math.sin(this.pulsePhase * 4) * 0.4;
            ctx.fillStyle = `rgba(255, 0, 102, ${coreAlpha})`;
            ctx.shadowBlur = CONFIG.lowFX ? 0 : 30;
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
            ctx.shadowBlur = CONFIG.lowFX ? 0 : 20;
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
            ctx.shadowBlur = CONFIG.lowFX ? 0 : 18;
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

            ctx.shadowBlur = CONFIG.lowFX ? 0 : 0;
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
            ctx.shadowBlur = CONFIG.lowFX ? 0 : 0;
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
