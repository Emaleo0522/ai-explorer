class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.isStarted = false;
    this.droneOscillators = [];
    this.volume = 0.15;
  }

  init() {
    // Defer creation until user interaction (autoplay policy)
    this._startOnInteraction = () => {
      if (this.isStarted) return;
      this.start();
      window.removeEventListener('click', this._startOnInteraction);
      window.removeEventListener('touchstart', this._startOnInteraction);
    };
    window.addEventListener('click', this._startOnInteraction);
    window.addEventListener('touchstart', this._startOnInteraction);
  }

  start() {
    if (this.isStarted) return;
    this.isStarted = true;

    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.ctx.destination);

    this.startDrone();
  }

  startDrone() {
    if (!this.ctx) return;

    // Low drone: two slightly detuned oscillators for warm pad sound
    const freqs = [55, 55.5, 110, 82.5]; // A1 variations + E2
    const types = ['sine', 'sine', 'triangle', 'sine'];
    const gains = [0.3, 0.25, 0.1, 0.15];

    for (let i = 0; i < freqs.length; i++) {
      const osc = this.ctx.createOscillator();
      osc.type = types[i];
      osc.frequency.value = freqs[i];

      const gain = this.ctx.createGain();
      gain.gain.value = gains[i];

      // Slow LFO on volume for evolving texture
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.05 + Math.random() * 0.1;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = gains[i] * 0.3;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();

      this.droneOscillators.push({ osc, gain, lfo, lfoGain });
    }
  }

  playTransition() {
    if (!this.ctx || this.isMuted) return;

    // Short whoosh sound
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  playHover() {
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 440;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(
        muted ? 0 : this.volume,
        this.ctx.currentTime + 0.3
      );
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  dispose() {
    for (const d of this.droneOscillators) {
      d.osc.stop();
      d.lfo.stop();
    }
    this.droneOscillators = [];
    if (this.ctx) {
      this.ctx.close();
    }
  }
}

const audioManager = new AudioManager();
export default audioManager;
