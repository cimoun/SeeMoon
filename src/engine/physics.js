// Физика столкновений для Neon Breakout

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BLOCK_WIDTH,
  BLOCK_HEIGHT,
  BALL_MAX_SPEED,
  BALL_SPEED_INCREMENT
} from '../utils/constants';

// Столкновение мяча со стенами
export const checkWallCollision = (ball) => {
  let hitWall = false;
  let newDx = ball.dx;
  let newDy = ball.dy;
  let newX = ball.x;
  let newY = ball.y;

  // Левая стена
  if (ball.x - ball.radius <= 0) {
    newX = ball.radius;
    newDx = Math.abs(ball.dx);
    hitWall = true;
  }

  // Правая стена
  if (ball.x + ball.radius >= CANVAS_WIDTH) {
    newX = CANVAS_WIDTH - ball.radius;
    newDx = -Math.abs(ball.dx);
    hitWall = true;
  }

  // Верхняя стена
  if (ball.y - ball.radius <= 0) {
    newY = ball.radius;
    newDy = Math.abs(ball.dy);
    hitWall = true;
  }

  return {
    ball: { ...ball, x: newX, y: newY, dx: newDx, dy: newDy },
    hitWall
  };
};

// Проверка падения мяча
export const checkBallFallen = (ball) => {
  return ball.y + ball.radius >= CANVAS_HEIGHT;
};

// Столкновение мяча с платформой
export const checkPaddleCollision = (ball, paddle) => {
  if (
    ball.y + ball.radius >= paddle.y &&
    ball.y - ball.radius <= paddle.y + paddle.height &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.width &&
    ball.dy > 0
  ) {
    // Вычисляем точку попадания относительно центра платформы (-1 до 1)
    const hitPoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);

    // Угол отскока зависит от точки попадания
    const maxAngle = Math.PI / 3; // 60 градусов
    const angle = hitPoint * maxAngle;

    // Новое направление мяча
    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    const newDx = Math.sin(angle) * speed;
    const newDy = -Math.cos(angle) * speed;

    return {
      ball: {
        ...ball,
        y: paddle.y - ball.radius,
        dx: newDx,
        dy: newDy
      },
      hit: true
    };
  }

  return { ball, hit: false };
};

// Столкновение мяча с блоком (AABB)
export const checkBlockCollision = (ball, block) => {
  if (block.destroyed) return { hit: false, side: null };

  const blockLeft = block.x;
  const blockRight = block.x + BLOCK_WIDTH;
  const blockTop = block.y;
  const blockBottom = block.y + BLOCK_HEIGHT;

  // Ближайшая точка на блоке к центру мяча
  const closestX = Math.max(blockLeft, Math.min(ball.x, blockRight));
  const closestY = Math.max(blockTop, Math.min(ball.y, blockBottom));

  // Расстояние от центра мяча до ближайшей точки
  const distanceX = ball.x - closestX;
  const distanceY = ball.y - closestY;
  const distanceSquared = distanceX * distanceX + distanceY * distanceY;

  if (distanceSquared <= ball.radius * ball.radius) {
    // Определяем сторону столкновения
    const overlapLeft = ball.x + ball.radius - blockLeft;
    const overlapRight = blockRight - (ball.x - ball.radius);
    const overlapTop = ball.y + ball.radius - blockTop;
    const overlapBottom = blockBottom - (ball.y - ball.radius);

    const minOverlapX = Math.min(overlapLeft, overlapRight);
    const minOverlapY = Math.min(overlapTop, overlapBottom);

    let side;
    if (minOverlapX < minOverlapY) {
      side = overlapLeft < overlapRight ? 'left' : 'right';
    } else {
      side = overlapTop < overlapBottom ? 'top' : 'bottom';
    }

    return { hit: true, side };
  }

  return { hit: false, side: null };
};

// Отскок мяча от блока
export const reflectBall = (ball, side) => {
  let newDx = ball.dx;
  let newDy = ball.dy;

  switch (side) {
    case 'left':
    case 'right':
      newDx = -ball.dx;
      break;
    case 'top':
    case 'bottom':
      newDy = -ball.dy;
      break;
  }

  // Увеличиваем скорость немного
  const currentSpeed = Math.sqrt(newDx * newDx + newDy * newDy);
  const newSpeed = Math.min(currentSpeed + BALL_SPEED_INCREMENT, BALL_MAX_SPEED);
  const speedRatio = newSpeed / currentSpeed;

  return {
    ...ball,
    dx: newDx * speedRatio,
    dy: newDy * speedRatio,
    speed: newSpeed
  };
};

// Столкновение power-up с платформой
export const checkPowerUpCollision = (powerUp, paddle) => {
  return (
    !powerUp.collected &&
    powerUp.y + powerUp.height >= paddle.y &&
    powerUp.y <= paddle.y + paddle.height &&
    powerUp.x + powerUp.width >= paddle.x &&
    powerUp.x <= paddle.x + paddle.width
  );
};

// Столкновение лазера с блоком
export const checkLaserBlockCollision = (laser, block) => {
  if (block.destroyed) return false;

  return (
    laser.x < block.x + BLOCK_WIDTH &&
    laser.x + laser.width > block.x &&
    laser.y < block.y + BLOCK_HEIGHT &&
    laser.y + laser.height > block.y
  );
};
