// Music Manager
export class MusicManager {
    constructor(audioContext) {
        this.ctx = audioContext;
        this.playing = false;
        this.currentBPM = 110;
        this.beat = 0;
        this.melodyBeat = 0;
        this.nextNoteTime = 0;
        this.schedulerTimer = null;
        this.masterGain = null;
        this.scale = [130.81, 155.56, 174.61, 196.00, 233.08];
        this.melodyPattern = [0, 2, 4, 2, 1, 3, 4, 3];

        if (this.ctx) {
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.22;
            this.masterGain.connect(this.ctx.destination);
        }
    }

    get beatInterval() {
        return 60 / this.currentBPM;
    }

    start() {
        if (!this.ctx || this.playing) return;
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().then(() => this._doStart());
        } else {
            this._doStart();
        }
    }

    _doStart() {
        this.playing = true;
        this.nextNoteTime = this.ctx.currentTime + 0.1;
        this._schedule();
    }

    stop() {
        this.playing = false;
        if (this.schedulerTimer) {
            clearTimeout(this.schedulerTimer);
            this.schedulerTimer = null;
        }
    }

    toggle() {
        if (this.playing) { this.stop(); } else { this.start(); }
        return this.playing;
    }

    setTempo(bpm) {
        this.currentBPM = bpm;
    }

    updateForLevel(level) {
        if (level <= 20) this.setTempo(110);
        else if (level <= 50) this.setTempo(130);
        else this.setTempo(155);
    }

    _schedule() {
        if (!this.playing) return;
        while (this.nextNoteTime < this.ctx.currentTime + 0.12) {
            this._scheduleBeat(this.nextNoteTime);
            this.beat = (this.beat + 1) % 8;
            this.nextNoteTime += this.beatInterval / 2;
        }
        this.schedulerTimer = setTimeout(() => this._schedule(), 25);
    }

    _scheduleBeat(time) {
        if (this.beat === 0 || this.beat === 4) this._kick(time);
        this._hihat(time, this.beat % 2 === 0 ? 0.14 : 0.07);
        if (this.beat === 0 || this.beat === 5) this._bass(time, this.scale[0]);
        if (this.beat % 2 === 0) {
            this._melody(time, this.scale[this.melodyPattern[this.melodyBeat % this.melodyPattern.length]] * 2);
            this.melodyBeat++;
        }
    }

    _kick(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.frequency.setValueAtTime(80, time);
        osc.frequency.exponentialRampToValueAtTime(30, time + 0.15);
        gain.gain.setValueAtTime(0.75, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
        osc.start(time); osc.stop(time + 0.2);
    }

    _hihat(time, vol) {
        // Build the noise buffer once and reuse it (avoids per-beat GC churn).
        if (!this._hihatBuffer) {
            const bufSize = Math.floor(this.ctx.sampleRate * 0.05);
            const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
            this._hihatBuffer = buf;
        }
        const src = this.ctx.createBufferSource();
        src.buffer = this._hihatBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        src.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
        src.start(time); src.stop(time + 0.05);
    }

    _bass(time, freq) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.connect(gain); gain.connect(this.masterGain);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.14, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + this.beatInterval * 0.85);
        osc.start(time); osc.stop(time + this.beatInterval);
    }

    _melody(time, freq) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.connect(gain); gain.connect(this.masterGain);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.07, time + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, time + this.beatInterval * 0.75);
        osc.start(time); osc.stop(time + this.beatInterval);
    }
}
