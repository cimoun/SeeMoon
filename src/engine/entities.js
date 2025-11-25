// Игровые сущности для Neon Breakout

import {
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_Y_OFFSET,
  BALL_RADIUS,
  BALL_INITIAL_SPEED,
  BLOCK_TYPES,
  POWERUP_SIZE,
  POWERUP_SPEED,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  LASER_WIDTH,
  LASER_HEIGHT,
  LASER_SPEED
} from '../utils/constants';

// Создание платформы
export const createPaddle = () => ({
  x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
  y: CANVAS_HEIGHT - PADDLE_Y_OFFSET,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  originalWidth: PADDLE_WIDTH,
  hasLaser: false,
  hasCatch: false
});

// Создание мяча
export const createBall = (paddleX, paddleWidth) => ({
  x: paddleX + paddleWidth / 2,
  y: CANVAS_HEIGHT - PADDLE_Y_OFFSET - BALL_RADIUS - 2,
  radius: BALL_RADIUS,
  dx: 0,
  dy: 0,
  speed: BALL_INITIAL_SPEED,
  attached: true,
  isMega: false
});

// Запуск мяча
export const launchBall = (ball) => {
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 4);
  return {
    ...ball,
    dx: Math.cos(angle) * ball.speed,
    dy: Math.sin(angle) * ball.speed,
    attached: false
  };
};

// Создание блока
export const createBlock = (x, y, type) => {
  const blockType = BLOCK_TYPES[type];
  return {
    x,
    y,
    type,
    health: blockType.health,
    maxHealth: blockType.health,
    points: blockType.points,
    color: blockType.color,
    glowColor: blockType.glowColor,
    indestructible: blockType.indestructible || false,
    destroyed: false
  };
};

// Создание power-up
export const createPowerUp = (x, y, type) => ({
  x,
  y,
  type,
  width: POWERUP_SIZE,
  height: POWERUP_SIZE,
  dy: POWERUP_SPEED,
  collected: false
});

// Создание лазера
export const createLaser = (paddle) => ({
  x: paddle.x + paddle.width / 2 - LASER_WIDTH / 2,
  y: paddle.y - LASER_HEIGHT,
  width: LASER_WIDTH,
  height: LASER_HEIGHT,
  dy: -LASER_SPEED
});

// Обновление позиции мяча
export const updateBall = (ball, paddle) => {
  if (ball.attached) {
    return {
      ...ball,
      x: paddle.x + paddle.width / 2,
      y: CANVAS_HEIGHT - PADDLE_Y_OFFSET - ball.radius - 2
    };
  }

  return {
    ...ball,
    x: ball.x + ball.dx,
    y: ball.y + ball.dy
  };
};

// Обновление позиции power-up
export const updatePowerUp = (powerUp) => ({
  ...powerUp,
  y: powerUp.y + powerUp.dy
});

// Обновление позиции лазера
export const updateLaser = (laser) => ({
  ...laser,
  y: laser.y + laser.dy
});

// Проверка выхода power-up за границы
export const isPowerUpOutOfBounds = (powerUp) => {
  return powerUp.y > CANVAS_HEIGHT;
};

// Проверка выхода лазера за границы
export const isLaserOutOfBounds = (laser) => {
  return laser.y + laser.height < 0;
};

// Клонирование мяча для мультибола
export const cloneBall = (ball) => {
  const angleOffset = (Math.random() - 0.5) * Math.PI / 3;
  const currentAngle = Math.atan2(ball.dy, ball.dx);
  const newAngle = currentAngle + angleOffset;

  return {
    ...ball,
    dx: Math.cos(newAngle) * ball.speed,
    dy: Math.sin(newAngle) * ball.speed,
    isMega: ball.isMega
  };
};

// Присоединение мяча к платформе (для Catch)
export const attachBallToPaddle = (ball, paddle) => ({
  ...ball,
  x: paddle.x + paddle.width / 2,
  y: paddle.y - ball.radius - 2,
  dx: 0,
  dy: 0,
  attached: true
});
