
// A simple Web Audio API wrapper for 8-bit retro sounds
// No external assets required.

class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentBgm: 'TITLE' | 'MAP' | 'BATTLE' | null = null;
  private intervalId: number | null = null;

  // Browser policy requires user interaction before audio context runs
  async init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  // --- Sound Effects (SFX) ---

  playSfx(type: 'SELECT' | 'CONFIRM' | 'CANCEL' | 'ATTACK' | 'HIT' | 'HEAL' | 'WIN' | 'LOSE') {
    if (!this.ctx || this.isMuted) return;
    
    // Attempt to resume if suspended (though usually requires direct user event)
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    switch (type) {
      case 'SELECT': // Short blip
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'CONFIRM': // Coin-like sound
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1760, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      case 'CANCEL': // Low buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.15);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      case 'ATTACK': // Noise-ish slide
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      case 'HIT': // Low thud
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      case 'HEAL': // Rising chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.2);
        osc.frequency.linearRampToValueAtTime(1760, now + 0.4);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
        break;
      case 'WIN': // Fanfare part 1
        this.playMelody([523.25, 523.25, 523.25, 659.25, 783.99, 1046.50], 0.12, 'square');
        break;
      case 'LOSE': // Sad slide
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(220, now + 0.6);
        osc.frequency.linearRampToValueAtTime(110, now + 1.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 1.2);
        osc.start(now);
        osc.stop(now + 1.2);
        break;
    }
  }

  private playMelody(freqs: number[], duration: number, type: OscillatorType) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    freqs.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = type;
      osc.frequency.value = f;
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      
      const startTime = now + i * duration;
      gain.gain.setValueAtTime(0.05, startTime);
      gain.gain.setValueAtTime(0, startTime + duration - 0.02);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  // --- Background Music (BGM) Sequencer ---

  stopBgm() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.currentBgm = null;
  }

  playBgm(type: 'TITLE' | 'MAP' | 'BATTLE') {
    if (this.currentBgm === type) return;
    this.stopBgm();
    this.currentBgm = type;
    
    if (this.isMuted) return;

    // Initialize context if it hasn't been done
    this.init().catch(() => {});

    let noteIndex = 0;
    let sequence: number[] = [];
    let speed = 200;
    let waveform: OscillatorType = 'triangle';

    // DQ inspired minimal loops
    if (type === 'TITLE') {
      // Overture-ish intro loop
      sequence = [392, 0, 392, 0, 392, 440, 493, 392, 523, 0, 0, 0]; 
      speed = 250;
      waveform = 'square';
    } else if (type === 'MAP') {
      // Gentle walking theme
      sequence = [261, 329, 392, 329, 440, 392, 349, 329]; 
      speed = 400;
      waveform = 'triangle';
    } else if (type === 'BATTLE') {
      // Tense fast loop
      sequence = [110, 110, 116, 110, 123, 110, 130, 110]; 
      speed = 120;
      waveform = 'sawtooth';
    }

    this.intervalId = window.setInterval(() => {
        if (!this.ctx || this.isMuted || this.ctx.state === 'suspended') return;
        
        const freq = sequence[noteIndex];
        
        if (freq > 0) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = waveform;
            osc.frequency.value = freq;
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            const now = this.ctx.currentTime;
            gain.gain.setValueAtTime(0.03, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + (speed/1000));
            
            osc.start(now);
            osc.stop(now + (speed/1000));
        }

        noteIndex = (noteIndex + 1) % sequence.length;
    }, speed);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
        this.stopBgm();
    } else {
        const resumeType = this.currentBgm;
        this.currentBgm = null; // force logic reset
        if (resumeType) this.playBgm(resumeType);
    }
    return this.isMuted;
  }
}

export const audioService = new AudioService();
