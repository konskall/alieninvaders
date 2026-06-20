export class Shockwave {
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
