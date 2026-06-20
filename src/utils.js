// Utility Functions
export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

export function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export class GradientCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 100;
    }

    getGradient(ctx, type, size, color) {
        const key = `${type}-${size}-${color}`;

        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        let gradient;
        if (type === 'radial') {
            gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
            gradient.addColorStop(0, '#' + color);
            gradient.addColorStop(0.5, '#' + color + '80');
            gradient.addColorStop(1, '#' + color + '00');
        }

        if (this.cache.size > this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, gradient);
        return gradient;
    }

    clear() {
        this.cache.clear();
    }
}
