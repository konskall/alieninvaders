import { CONFIG } from '../config.js';

// HomingBullet Class
export class HomingBullet {
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
        ctx.shadowBlur = CONFIG.lowFX ? 0 : 15;
        ctx.shadowColor = '#FF00AA';
        const pulse = 1 + Math.sin(this.pulsePhase) * 0.25;
        ctx.fillStyle = '#FF00AA';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = CONFIG.lowFX ? 0 : 4;
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
