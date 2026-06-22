import { CONFIG } from '../config.js';

// Bullet Class
export class Bullet {
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
            ctx.shadowBlur = CONFIG.lowFX ? 0 : 10;
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
            ctx.shadowBlur = CONFIG.lowFX ? 0 : 8;
            ctx.shadowColor = this.color;
            ctx.fillStyle = this.color;
            const size = this.radius * 0.6 * t.life;
            ctx.beginPath();
            ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1;

        // Mobile fast path: skip the per-frame createRadialGradient + addColorStop
        // allocations (heavy GC churn at 60fps with many bullets on the weaker co-op
        // guest). Glow is already disabled under lowFX, so a flat fill looks nearly
        // identical. Keeps the per-type size/colour for readability.
        if (CONFIG.lowFX) {
            let r = this.radius || 6, c = this.color || '#FF6600';
            if (this.enemyType === 'scout_drone') { r = 6; c = '#00FFFF'; }
            else if (this.enemyType === 'fighter_wasp') { r = 7; c = '#FF8800'; }
            else if (this.enemyType === 'heavy_cruiser') { r = 11; c = '#CC33CC'; }
            else if (this.enemyType === 'behemoth_dreadnought' || this.enemyType === 'alien_leviathan' || this.enemyType === 'void_entity' || this.enemyType === 'elite_guardian' || this.enemyType === 'swarm_commander') { r = 13; c = '#FF22FF'; }
            ctx.fillStyle = c;
            ctx.beginPath();
            ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }

        if (this.enemyType === 'scout_drone') {
            // Small energetic cyan dot with glow
            const pulse = 1 + Math.sin(this.pulsePhase) * 0.3;
            ctx.shadowBlur = CONFIG.lowFX ? 0 : 8 * pulse;
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
            ctx.shadowBlur = CONFIG.lowFX ? 0 : 8;
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
            ctx.shadowBlur = CONFIG.lowFX ? 0 : 6;
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
            ctx.shadowBlur = CONFIG.lowFX ? 0 : 40;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 5 * pulse, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.enemyType === 'behemoth_dreadnought' || this.enemyType === 'alien_leviathan' || this.enemyType === 'void_entity' || this.enemyType === 'elite_guardian' || this.enemyType === 'swarm_commander') {
            // Epic massive projectile
            ctx.shadowBlur = CONFIG.lowFX ? 0 : 5;
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
            ctx.shadowBlur = CONFIG.lowFX ? 0 : 15;
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
