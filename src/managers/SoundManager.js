// Sound Manager
export class SoundManager {
    constructor() {
        this.enabled = true;
        this.sounds = {};
        this.audioContext = null;
        this.initialized = false;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    ensureAudioContext() {
        if (!this.audioContext) return false;

        // Resume audio context if suspended (iOS requirement)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                this.initialized = true;
            }).catch(e => {
                console.warn('Failed to resume audio context:', e);
            });
            return false;
        }

        this.initialized = true;
        return true;
    }

    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.audioContext) return;

        if (!this.ensureAudioContext()) {
            return;
        }

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = type;
            oscillator.frequency.value = frequency;
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.warn('Audio playback error:', e);
        }
    }

   playLayeredSound(layers, duration) {
        if (!this.enabled || !this.audioContext || !this.ensureAudioContext()) return;

        try {
            const now = this.audioContext.currentTime;

            layers.forEach(layer => {
                const gain = this.audioContext.createGain();
                gain.connect(this.audioContext.destination);

                // 'noise' is not a valid OscillatorNode type — use a noise BufferSource.
                let source;
                if (layer.type === 'noise') {
                    source = this.audioContext.createBufferSource();
                    source.buffer = this._getNoiseBuffer();
                    source.loop = true;
                } else {
                    source = this.audioContext.createOscillator();
                    source.type = layer.type || 'sine';
                    if (layer.freqStart && layer.freqEnd) {
                        source.frequency.setValueAtTime(layer.freqStart, now);
                        source.frequency.exponentialRampToValueAtTime(layer.freqEnd, now + duration);
                    } else {
                        source.frequency.value = layer.freq;
                    }
                }
                source.connect(gain);

                // ADSR envelope
                const attack = layer.attack || 0.01;
                const decay = layer.decay || 0.1;
                const sustain = layer.sustain || 0.3;
                const release = layer.release || 0.2;

                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(layer.volume, now + attack);
                gain.gain.linearRampToValueAtTime(sustain, now + attack + decay);
                gain.gain.setValueAtTime(sustain, now + duration - release);
                gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

                source.start(now);
                source.stop(now + duration);
            });
        } catch (e) {
            console.warn('Layered audio error:', e);
        }
    }

    // Cached 1s white-noise buffer (created once, reused for every noise layer).
    _getNoiseBuffer() {
        if (this._noiseBuffer) return this._noiseBuffer;
        const sr = this.audioContext.sampleRate;
        const buf = this.audioContext.createBuffer(1, sr, sr);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        this._noiseBuffer = buf;
        return buf;
    }

   playerShoot() {
    // 8-BIT ARCADE BLIP BLIP
    const pitch = 700 + Math.random() * 120;
    this.playLayeredSound([
        { freq: pitch, type: 'square', volume: 0.25, attack: 0.002, decay: 0.03, sustain: 0.1, release: 0.04 },
        { freq: pitch * 0.8, type: 'square', volume: 0.12, attack: 0.001, decay: 0.04, sustain: 0.05, release: 0.03 },
        { freq: pitch * 2, type: 'triangle', volume: 0.1, attack: 0.002, decay: 0.06, sustain: 0.03, release: 0.02 },
        { freq: 0, type: 'noise', volume: 0.10, attack: 0.001, decay: 0.07, sustain: 0.01, release: 0.05 }
    ], 0.07);
}

    enemyShoot() {
        // PROFESSIONAL: Menacing alien weapon sound
        const pitch = 450 + Math.random() * 150;
        this.playLayeredSound([
            { freq: pitch, type: 'square', volume: 0.12, attack: 0.01, decay: 0.04, sustain: 0.08, release: 0.06 },
            { freq: pitch * 0.75, type: 'sawtooth', volume: 0.1, attack: 0.015, decay: 0.05, sustain: 0.06, release: 0.05 },
            { freqStart: pitch * 1.5, freqEnd: pitch * 1.2, type: 'sine', volume: 0.06, attack: 0.005, decay: 0.03, sustain: 0.04, release: 0.04 }
        ], 0.14);
    }

    hit() {
        // PROFESSIONAL: Alert tone with sharp attack
        this.playLayeredSound([
            { freq: 1000, type: 'square', volume: 0.18, attack: 0.002, decay: 0.03, sustain: 0.08, release: 0.05 },
            { freq: 500, type: 'sine', volume: 0.12, attack: 0.005, decay: 0.04, sustain: 0.06, release: 0.04 }
        ], 0.15);
    }

    explosion(size = 1) {
        if (!this.enabled || !this.audioContext) return;
        // PROFESSIONAL: Complex layered explosion with bass impact
        const duration = 0.3 + size * 0.1;
        const bassFreq = 80 - size * 10;
        const midFreq = 250 - size * 20;
        const highFreq = 700 - size * 50;

        this.playLayeredSound([
            // Deep bass impact
            { freqStart: bassFreq, freqEnd: bassFreq * 0.5, type: 'sine', volume: 0.4 * size, attack: 0.01, decay: 0.15, sustain: 0.1, release: 0.2 },
            // Mid-range crunch
            { freqStart: midFreq, freqEnd: midFreq * 0.6, type: 'sawtooth', volume: 0.3 * size, attack: 0.02, decay: 0.1, sustain: 0.08, release: 0.15 },
            // High sparkle debris
            { freqStart: highFreq, freqEnd: highFreq * 0.4, type: 'square', volume: 0.2 * size, attack: 0.005, decay: 0.08, sustain: 0.05, release: 0.1 }
        ], duration);
    }

    damageTaken() {
        // PROFESSIONAL: Sharp alarming damage sound
        this.playLayeredSound([
            { freqStart: 800, freqEnd: 200, type: 'square', volume: 0.25, attack: 0.002, decay: 0.05, sustain: 0.08, release: 0.08 },
            { freqStart: 400, freqEnd: 150, type: 'triangle', volume: 0.18, attack: 0.005, decay: 0.06, sustain: 0.06, release: 0.07 },
            { freq: 150, type: 'sine', volume: 0.15, attack: 0.01, decay: 0.08, sustain: 0.05, release: 0.06 }
        ], 0.18);
    }

    superWeapon() {
        if (!this.enabled || !this.audioContext) return;
        // PROFESSIONAL: Epic charging and release blast
        this.playLayeredSound([
            // Rising frequency sweep
            { freqStart: 200, freqEnd: 1200, type: 'sine', volume: 0.3, attack: 0.05, decay: 0.1, sustain: 0.25, release: 0.2 },
            { freqStart: 400, freqEnd: 1600, type: 'square', volume: 0.25, attack: 0.08, decay: 0.12, sustain: 0.2, release: 0.2 },
            // Bass impact
            { freqStart: 100, freqEnd: 50, type: 'sine', volume: 0.4, attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.15 },
            // High sparkle
            { freqStart: 2000, freqEnd: 1000, type: 'sine', volume: 0.2, attack: 0.02, decay: 0.15, sustain: 0.15, release: 0.25 }
        ], 0.6);
    }

    gameOver() {
        if (!this.enabled || !this.audioContext) return;
        // PROFESSIONAL: Melancholic dramatic game over
        this.playLayeredSound([
            { freqStart: 800, freqEnd: 300, type: 'sine', volume: 0.25, attack: 0.02, decay: 0.15, sustain: 0.2, release: 0.25 },
            { freqStart: 400, freqEnd: 200, type: 'sawtooth', volume: 0.2, attack: 0.03, decay: 0.2, sustain: 0.15, release: 0.2 },
            { freqStart: 200, freqEnd: 100, type: 'sine', volume: 0.18, attack: 0.05, decay: 0.25, sustain: 0.1, release: 0.15 }
        ], 0.5);
    }

    levelUp() {
        // PROFESSIONAL: Celebratory achievement fanfare
        this.playLayeredSound([
            { freq: 600, type: 'sine', volume: 0.15, attack: 0.01, decay: 0.03, sustain: 0.05, release: 0.03 },
            { freq: 900, type: 'sine', volume: 0.12, attack: 0.01, decay: 0.04, sustain: 0.04, release: 0.04 }
        ], 0.1);
        setTimeout(() => {
            this.playLayeredSound([
                { freq: 800, type: 'sine', volume: 0.15, attack: 0.01, decay: 0.03, sustain: 0.05, release: 0.03 },
                { freq: 1200, type: 'sine', volume: 0.12, attack: 0.01, decay: 0.04, sustain: 0.04, release: 0.04 }
            ], 0.1);
        }, 80);
        setTimeout(() => {
            this.playLayeredSound([
                { freq: 1000, type: 'sine', volume: 0.18, attack: 0.01, decay: 0.05, sustain: 0.08, release: 0.06 },
                { freq: 1500, type: 'sine', volume: 0.15, attack: 0.01, decay: 0.06, sustain: 0.07, release: 0.06 }
            ], 0.2);
        }, 160);
    }

    bonus() {
        // PROFESSIONAL: Cheerful success chime for bonus pickup
        this.playLayeredSound([
            { freqStart: 1000, freqEnd: 1400, type: 'sine', volume: 0.18, attack: 0.01, decay: 0.05, sustain: 0.08, release: 0.1 },
            { freqStart: 1500, freqEnd: 2000, type: 'sine', volume: 0.12, attack: 0.015, decay: 0.06, sustain: 0.06, release: 0.08 },
            { freq: 800, type: 'triangle', volume: 0.1, attack: 0.02, decay: 0.08, sustain: 0.05, release: 0.1 }
        ], 0.25);
    }
}
