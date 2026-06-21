// Vibration Manager
export class VibrationManager {
    constructor() {
        this.enabled = true;
        this.supported = this.checkVibrationSupport();
    }

    checkVibrationSupport() {
        // Check for standard and webkit prefixed vibration
        return 'vibrate' in navigator || 'webkitVibrate' in navigator;
    }

    vibrate(pattern) {
        if (!this.enabled) {
            return;
        }

        if (!this.supported) {
            return;
        }

        try {
            // Convert to array if single number
            const vibratePattern = Array.isArray(pattern) ? pattern : [pattern];


            // Try standard vibration API
            if ('vibrate' in navigator) {
                const result = navigator.vibrate(vibratePattern);
                return;
            }

            // Try webkit prefixed version (older iOS)
            if ('webkitVibrate' in navigator) {
                const result = navigator.webkitVibrate(vibratePattern);
                return;
            }
        } catch (e) {
            console.warn('Vibration error:', e);
        }
    }

    shoot() {
        this.vibrate(50);
    }

    hit() {
        this.vibrate(200);
    }

    damage() {
        this.vibrate([300]);
    }

    superWeapon() {
        this.vibrate([100, 50, 100]);
    }

    explosion() {
        this.vibrate(150);
    }

    bonus() {
        this.vibrate([50, 50, 50]);
    }
}
