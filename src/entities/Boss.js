import { CONFIG, DIFFICULTY_CONFIG, GAME_SETTINGS } from '../config.js';
import { distance } from '../utils.js';
import { Bullet } from './Bullet.js';
import { HomingBullet } from './HomingBullet.js';
export class Boss {
    constructor(canvasWidth, canvasHeight, waveNumber) {
        this.x = canvasWidth / 2;
        this.y = -80;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.waveNumber = waveNumber;
        this.bossLevel = Math.max(1, Math.floor(waveNumber / 10));   // >=1 so a boss spawned before wave 10 (high boss-frequency difficulties) still has HP

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
