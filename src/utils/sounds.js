class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  playTone(frequency, duration, type = 'sine') {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch {
      // Silently ignore audio context errors
    }
  }

  playEatSound() {
    // Softer sound: lower frequency, sine wave, gentle envelope
    this.playTone(330, 0.05, 'sine'); 
    setTimeout(() => this.playTone(440, 0.05, 'sine'), 40);
  }

  playGameOverSound() {
    this.playTone(220, 0.3, 'triangle');
    setTimeout(() => this.playTone(196, 0.3, 'triangle'), 150);
    setTimeout(() => this.playTone(165, 0.4, 'triangle'), 300);
  }

  playPauseSound() {
    this.playTone(330, 0.15, 'sine');
  }

  toggle() {
    this.enabled = !this.enabled;
  }
}

export const soundManager = new SoundManager();

