// Игровые константы для Neon Breakout

// Размеры игрового поля
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// Платформа (paddle)
export const PADDLE_WIDTH = 120;
export const PADDLE_HEIGHT = 16;
export const PADDLE_SPEED = 12;
export const PADDLE_Y_OFFSET = 40;

// Мяч
export const BALL_RADIUS = 10;
export const BALL_INITIAL_SPEED = 6;
export const BALL_MAX_SPEED = 12;
export const BALL_SPEED_INCREMENT = 0.2;

// Блоки
export const BLOCK_ROWS = 5;
export const BLOCK_COLS = 10;
export const BLOCK_WIDTH = 70;
export const BLOCK_HEIGHT = 25;
export const BLOCK_PADDING = 8;
export const BLOCK_OFFSET_TOP = 60;
export const BLOCK_OFFSET_LEFT = 35;

// Типы блоков
export const BLOCK_TYPES = {
  NORMAL: {
    health: 1,
    points: 10,
    color: '#00ffff',
    glowColor: 'rgba(0, 255, 255, 0.6)'
  },
  STRONG: {
    health: 2,
    points: 25,
    color: '#ff9900',
    glowColor: 'rgba(255, 153, 0, 0.6)'
  },
  SUPER: {
    health: 3,
    points: 50,
    color: '#ff0066',
    glowColor: 'rgba(255, 0, 102, 0.6)'
  },
  INDESTRUCTIBLE: {
    health: Infinity,
    points: 0,
    color: '#444455',
    glowColor: 'rgba(68, 68, 85, 0.4)',
    indestructible: true
  }
};

// Power-ups
export const POWERUP_TYPES = {
  WIDE_PADDLE: {
    id: 'wide',
    color: '#00ff00',
    duration: 10000,
    symbol: 'W'
  },
  MULTI_BALL: {
    id: 'multi',
    color: '#ffff00',
    duration: null,
    symbol: 'M'
  },
  SLOW_BALL: {
    id: 'slow',
    color: '#00aaff',
    duration: 8000,
    symbol: 'S'
  },
  CATCH: {
    id: 'catch',
    color: '#00ff88',
    duration: null,
    symbol: 'C'
  },
  LASER: {
    id: 'laser',
    color: '#ff0000',
    duration: 10000,
    symbol: 'L'
  },
  EXTRA_LIFE: {
    id: 'life',
    color: '#ff00ff',
    duration: null,
    symbol: '+'
  },
  MEGA_BALL: {
    id: 'mega',
    color: '#ffffff',
    duration: 5000,
    symbol: '★'
  }
};

export const POWERUP_SIZE = 24;
export const POWERUP_SPEED = 3;
export const POWERUP_DROP_CHANCE = 0.18;

// Лазер
export const LASER_WIDTH = 4;
export const LASER_HEIGHT = 20;
export const LASER_SPEED = 12;
export const LASER_COOLDOWN = 200;

// Игровые настройки
export const INITIAL_LIVES = 3;
export const COMBO_TIMEOUT = 2000;
export const COMBO_MULTIPLIER = 0.5;

// Цвета темы
export const COLORS = {
  background: '#0a0a0f',
  paddle: '#00ffff',
  paddleGlow: 'rgba(0, 255, 255, 0.5)',
  ball: '#ff00ff',
  ballGlow: 'rgba(255, 0, 255, 0.6)',
  text: '#ffffff',
  textGlow: 'rgba(255, 255, 255, 0.3)',
  border: '#1a1a2e',
  gridLine: 'rgba(255, 255, 255, 0.03)'
};

// Состояния игры
export const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  WIN: 'win'
};
