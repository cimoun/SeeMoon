class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
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
    } catch (e) {
    }
  }

  playEatSound() {
    this.playTone(440, 0.1, 'sine');
    setTimeout(() => this.playTone(554, 0.1, 'sine'), 50);
  }

  playGameOverSound() {
    this.playTone(440, 0.2, 'sine');
    setTimeout(() => this.playTone(330, 0.2, 'sine'), 100);
    setTimeout(() => this.playTone(220, 0.3, 'sine'), 200);
  }

  playPauseSound() {
    this.playTone(330, 0.15, 'sine');
  }

  toggle() {
    this.enabled = !this.enabled;
  }
}

export const soundManager = new SoundManager();

