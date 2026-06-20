// Vibration Manager
export class VibrationManager {
    constructor() {
        this.enabled = true;
        this.supported = this.checkVibrationSupport();
        console.log('Vibration supported:', this.supported);
    }

    checkVibrationSupport() {
        // Check for standard and webkit prefixed vibration
        return 'vibrate' in navigator || 'webkitVibrate' in navigator;
    }

    vibrate(pattern) {
        if (!this.enabled) {
            console.log('Vibration disabled in settings');
            return;
        }

        if (!this.supported) {
            console.log('Vibration not supported on this device');
            return;
        }

        try {
            // Convert to array if single number
            const vibratePattern = Array.isArray(pattern) ? pattern : [pattern];

            console.log('Attempting vibration with pattern:', vibratePattern);

            // Try standard vibration API
            if ('vibrate' in navigator) {
                const result = navigator.vibrate(vibratePattern);
                console.log('Vibration result:', result);
                return;
            }

            // Try webkit prefixed version (older iOS)
            if ('webkitVibrate' in navigator) {
                const result = navigator.webkitVibrate(vibratePattern);
                console.log('WebKit vibration result:', result);
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
        console.log('Damage vibration triggered');
        this.vibrate([300]);
    }

    superWeapon() {
        console.log('Super weapon vibration triggered');
        this.vibrate([100, 50, 100]);
    }

    explosion() {
        this.vibrate(150);
    }

    bonus() {
        console.log('Bonus vibration triggered');
        this.vibrate([50, 50, 50]);
    }
}
