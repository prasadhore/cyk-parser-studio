class SoundController {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    const saved = localStorage.getItem('cyk_sound_enabled');
    if (saved !== null) {
      this.enabled = saved === 'true';
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    localStorage.setItem('cyk_sound_enabled', String(this.enabled));
    if (this.enabled) {
      this.play('cellSelected');
    }
    return this.enabled;
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public play(
    type:
      | 'click'
      | 'cellSelected'
      | 'productionSuccess'
      | 'stepCompleted'
      | 'accepted'
      | 'rejected'
      | 'demoCompleted'
  ) {
    if (!this.enabled || typeof window === 'undefined') return;

    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      switch (type) {
        case 'click': {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.start(now);
          osc.stop(now + 0.04);
          break;
        }

        case 'cellSelected': {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(680, now + 0.08);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }

        case 'productionSuccess': {
          // Play a sweet dual harmonic fifth
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(660, now + 0.07);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.start(now);
          osc.stop(now + 0.18);
          break;
        }

        case 'stepCompleted': {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }

        case 'accepted': {
          // Warm harmonic major chord
          const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
          freqs.forEach((freq, idx) => {
            const chordOsc = this.ctx!.createOscillator();
            const chordGain = this.ctx!.createGain();
            chordOsc.type = 'sine';
            chordOsc.frequency.setValueAtTime(freq, now + idx * 0.08);
            chordGain.gain.setValueAtTime(0.05, now + idx * 0.08);
            chordGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.5);
            chordOsc.connect(chordGain);
            chordGain.connect(this.ctx!.destination);
            chordOsc.start(now + idx * 0.08);
            chordOsc.stop(now + idx * 0.08 + 0.5);
          });
          break;
        }

        case 'rejected': {
          // Gentle low descent
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(220, now + 0.25);
          gain.gain.setValueAtTime(0.07, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
          break;
        }

        case 'demoCompleted': {
          const notes = [440, 554.37, 659.25, 880];
          notes.forEach((f, i) => {
            const o = this.ctx!.createOscillator();
            const g = this.ctx!.createGain();
            o.type = 'triangle';
            o.frequency.setValueAtTime(f, now + i * 0.09);
            g.gain.setValueAtTime(0.04, now + i * 0.09);
            g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.4);
            o.connect(g);
            g.connect(this.ctx!.destination);
            o.start(now + i * 0.09);
            o.stop(now + i * 0.09 + 0.4);
          });
          break;
        }
      }
    } catch {
      // Audio autoplay policy or device fallback
    }
  }
}

export const sound = new SoundController();
