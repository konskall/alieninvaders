import { randomRange } from '../utils.js';
import { CONFIG } from '../config.js';

export class Particle {
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
            ctx.shadowBlur = CONFIG.lowFX ? 0 : 20;
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
