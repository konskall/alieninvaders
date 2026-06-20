export class Star {
    constructor(x, y, size, speed, layer = 1) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.layer = layer;
        this.opacity = layer === 0
            ? Math.random() * 0.2 + 0.3
            : layer === 1
                ? Math.random() * 0.2 + 0.5
                : Math.random() * 0.2 + 0.8;
    }

    update(canvas) {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * canvas.width;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
