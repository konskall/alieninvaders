import { distance } from '../utils.js';

export class BonusPickup {
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

        // Icon — center on the glyph's ACTUAL ink box, not the font 'middle'
        // baseline. Emoji glyphs sit off-centre within their line box, so
        // 'middle' renders them visibly offset from the (centered) glow — most
        // obviously the heart. measureText lets us correct both axes.
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#000000';
        const m = ctx.measureText(this.config.icon);
        const dx = ((m.actualBoundingBoxLeft || 0) - (m.actualBoundingBoxRight || 0)) / 2;
        const dy = ((m.actualBoundingBoxAscent || 0) - (m.actualBoundingBoxDescent || 0)) / 2;
        ctx.fillText(this.config.icon, this.x + dx, this.y + dy);

        ctx.restore();
    }

    isDead() {
        return this.life <= 0 || Date.now() - this.birthTime > this.lifetime;
    }

    collidesWith(playerX, playerY, playerSize) {
        return distance(this.x, this.y, playerX, playerY) < this.size + playerSize;
    }
}
