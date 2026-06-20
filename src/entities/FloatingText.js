export class FloatingText {
    constructor(x, y, text, color, size = 16) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.size = size;
        this.velocityY = -1.5;
        this.life = 1;
        this.decay = 0.02;
    }

    update() {
        this.y += this.velocityY;
        this.life -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.font = `bold ${this.size}px Orbitron, monospace`;
        ctx.fillStyle = this.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}
