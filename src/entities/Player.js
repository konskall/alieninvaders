import { CONFIG } from '../config.js';
import { Bullet } from './Bullet.js';
export class Player {
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
