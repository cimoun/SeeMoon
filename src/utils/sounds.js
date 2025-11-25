// Звуковая система для Neon Breakout

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch {
      console.warn('Web Audio API не поддерживается');
      this.enabled = false;
    }
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(volume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch {
      // Игнорируем ошибки аудио
    }
  }

  playHitPaddle() {
    this.playTone(440, 0.08, 'sine', 0.2);
  }

  playHitBlock() {
    this.playTone(587, 0.06, 'square', 0.15);
    setTimeout(() => this.playTone(698, 0.06, 'square', 0.1), 30);
  }

  playHitWall() {
    this.playTone(330, 0.05, 'triangle', 0.1);
  }

  playPowerUp() {
    this.playTone(523, 0.1, 'sine', 0.25);
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.2), 80);
    setTimeout(() => this.playTone(784, 0.15, 'sine', 0.15), 160);
  }

  playLoseLife() {
    this.playTone(294, 0.2, 'sawtooth', 0.3);
    setTimeout(() => this.playTone(220, 0.3, 'sawtooth', 0.25), 150);
  }

  playGameOver() {
    this.playTone(262, 0.25, 'triangle', 0.3);
    setTimeout(() => this.playTone(220, 0.25, 'triangle', 0.25), 200);
    setTimeout(() => this.playTone(196, 0.25, 'triangle', 0.2), 400);
    setTimeout(() => this.playTone(165, 0.4, 'triangle', 0.15), 600);
  }

  playWin() {
    const notes = [523, 587, 659, 784, 880, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'sine', 0.2), i * 100);
    });
  }

  playLaunch() {
    this.playTone(392, 0.1, 'sine', 0.2);
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

export const soundManager = new SoundManager();
