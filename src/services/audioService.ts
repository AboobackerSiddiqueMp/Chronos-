import { AmbientSound, ChimeSound } from '../types';

class AudioService {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioBufferSourceNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private crackleInterval: number | null = null;
  private isAmbientPlaying = false;
  private currentAmbientType: AmbientSound = 'off';
  private masterChimeVolume = 0.8;
  private masterAmbientVolume = 0.5;

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setChimeVolume(vol: number) {
    this.masterChimeVolume = Math.max(0, Math.min(1, vol));
  }

  public setAmbientVolume(vol: number) {
    this.masterAmbientVolume = Math.max(0, Math.min(1, vol));
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.masterAmbientVolume * 0.4, this.ctx.currentTime);
    }
  }

  public getChimeVolume(): number {
    return this.masterChimeVolume;
  }

  public getAmbientVolume(): number {
    return this.masterAmbientVolume;
  }

  public getCurrentAmbientType(): AmbientSound {
    return this.currentAmbientType;
  }

  public isAmbientActive(): boolean {
    return this.isAmbientPlaying;
  }

  // --- Procedural Chimes ---
  public playChime(sound: ChimeSound = 'bell') {
    if (this.masterChimeVolume <= 0) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(this.masterChimeVolume, now);
      master.connect(ctx.destination);

      if (sound === 'bell') {
        // Multi-harmonic crystalline meditation bell
        const freqs = [528, 1056, 1584, 2112];
        const gains = [0.4, 0.25, 0.15, 0.08];

        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(gains[i], now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

          osc.connect(gain);
          gain.connect(master);

          osc.start(now);
          osc.stop(now + 3.2);
        });
      } else if (sound === 'gong') {
        // Deep resonance bowl
        const freqs = [146.83, 293.66, 440.0, 587.33];
        const decays = [4.5, 3.8, 2.8, 2.0];

        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = idx === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.3 / (idx + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + decays[idx]);

          osc.connect(gain);
          gain.connect(master);

          osc.start(now);
          osc.stop(now + decays[idx]);
        });
      } else if (sound === 'marimba') {
        // Wooden melodic chime
        const notes = [440, 554.37, 659.25];
        notes.forEach((note, idx) => {
          const noteTime = now + idx * 0.12;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(note, noteTime);

          gain.gain.setValueAtTime(0.35, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.2);

          osc.connect(gain);
          gain.connect(master);

          osc.start(noteTime);
          osc.stop(noteTime + 1.2);
        });
      } else if (sound === 'beep') {
        // Modern soft electronic pulse
        [0, 0.18, 0.36].forEach((offset) => {
          const t = now + offset;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, t);

          gain.gain.setValueAtTime(0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

          osc.connect(gain);
          gain.connect(master);

          osc.start(t);
          osc.stop(t + 0.12);
        });
      }
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // --- Ambient Procedural Sound Generator ---
  public startAmbient(type: AmbientSound) {
    if (type === 'off') {
      this.stopAmbient();
      return;
    }

    try {
      this.stopAmbient();
      const ctx = this.getAudioContext();
      this.currentAmbientType = type;

      // 5-second buffer of generated noise
      const bufferSize = ctx.sampleRate * 5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      if (type === 'whitenoise') {
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
      } else if (type === 'rain' || type === 'cafe' || type === 'forest') {
        // Pink / filtered noise algorithm
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, ctx.currentTime);
      } else if (type === 'cafe') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, ctx.currentTime);
        filter.Q.setValueAtTime(0.7, ctx.currentTime);
      } else if (type === 'forest') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, ctx.currentTime);
      } else {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, ctx.currentTime);
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(this.masterAmbientVolume * 0.35, ctx.currentTime + 1.2);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start(0);

      this.ambientSource = source;
      this.ambientGain = gain;
      this.ambientFilter = filter;
      this.isAmbientPlaying = true;

      // For cafe or rain, add periodic organic soft crackle/drop transients
      if (type === 'cafe' || type === 'rain') {
        this.crackleInterval = window.setInterval(() => {
          if (!this.isAmbientPlaying || !this.ctx) return;
          if (Math.random() > 0.4) {
            this.playMicroSpatter(type);
          }
        }, 320);
      }
    } catch (e) {
      console.warn('Ambient start error:', e);
    }
  }

  private playMicroSpatter(type: 'cafe' | 'rain') {
    if (!this.ctx || this.ctx.state !== 'running') return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (type === 'rain') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200 + Math.random() * 800, now);
        gain.gain.setValueAtTime(this.masterAmbientVolume * 0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.05);
      } else {
        // Cafe soft vinyl pop
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(250 + Math.random() * 120, now);
        gain.gain.setValueAtTime(this.masterAmbientVolume * 0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.03);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignored transient error
    }
  }

  public stopAmbient() {
    if (this.crackleInterval) {
      clearInterval(this.crackleInterval);
      this.crackleInterval = null;
    }

    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
      } catch {
        // ignore
      }
    }

    setTimeout(() => {
      if (this.ambientSource) {
        try {
          this.ambientSource.stop();
          this.ambientSource.disconnect();
        } catch {
          // ignore
        }
        this.ambientSource = null;
      }
      this.ambientGain = null;
      this.ambientFilter = null;
    }, 550);

    this.isAmbientPlaying = false;
    this.currentAmbientType = 'off';
  }

  public toggleAmbient(type: AmbientSound = 'rain') {
    if (this.isAmbientPlaying && (this.currentAmbientType === type || type === 'off')) {
      this.stopAmbient();
    } else {
      this.startAmbient(type === 'off' ? 'rain' : type);
    }
  }
}

export const audioService = new AudioService();
