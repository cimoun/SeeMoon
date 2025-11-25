// Canvas компонент для отрисовки игры

import { useRef, useEffect } from 'react';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BLOCK_WIDTH,
  BLOCK_HEIGHT,
  COLORS
} from '../../utils/constants';
import './GameCanvas.css';

const GameCanvas = ({
  paddle,
  balls,
  blocks,
  powerUps,
  onTouchStart,
  onTouchMove,
  onTouchEnd
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Очистка
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Сетка фона
    ctx.strokeStyle = COLORS.gridLine;
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Отрисовка блоков
    blocks.forEach(block => {
      if (block.destroyed) return;

      // Glow эффект
      ctx.shadowColor = block.glowColor;
      ctx.shadowBlur = 15;

      // Основной блок
      const healthRatio = block.health / block.maxHealth;
      ctx.fillStyle = block.color;
      ctx.globalAlpha = 0.3 + healthRatio * 0.7;

      ctx.beginPath();
      ctx.roundRect(block.x, block.y, BLOCK_WIDTH, BLOCK_HEIGHT, 4);
      ctx.fill();

      // Граница
      ctx.strokeStyle = block.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Индикатор прочности
      if (block.maxHealth > 1) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          block.health.toString(),
          block.x + BLOCK_WIDTH / 2,
          block.y + BLOCK_HEIGHT / 2 + 4
        );
      }
    });

    // Отрисовка power-ups
    powerUps.forEach(powerUp => {
      ctx.shadowColor = powerUp.type.color;
      ctx.shadowBlur = 10;

      ctx.fillStyle = powerUp.type.color;
      ctx.beginPath();
      ctx.roundRect(
        powerUp.x,
        powerUp.y,
        powerUp.width,
        powerUp.height,
        6
      );
      ctx.fill();

      ctx.shadowBlur = 0;

      // Символ
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        powerUp.type.symbol,
        powerUp.x + powerUp.width / 2,
        powerUp.y + powerUp.height / 2 + 5
      );
    });

    // Отрисовка платформы
    ctx.shadowColor = COLORS.paddleGlow;
    ctx.shadowBlur = 20;

    const gradient = ctx.createLinearGradient(
      paddle.x,
      paddle.y,
      paddle.x,
      paddle.y + paddle.height
    );
    gradient.addColorStop(0, '#00ffff');
    gradient.addColorStop(1, '#0088aa');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 8);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Отрисовка мячей
    balls.forEach(ball => {
      ctx.shadowColor = COLORS.ballGlow;
      ctx.shadowBlur = 15;

      const ballGradient = ctx.createRadialGradient(
        ball.x - ball.radius / 3,
        ball.y - ball.radius / 3,
        0,
        ball.x,
        ball.y,
        ball.radius
      );
      ballGradient.addColorStop(0, '#ffffff');
      ballGradient.addColorStop(0.5, '#ff00ff');
      ballGradient.addColorStop(1, '#aa0066');

      ctx.fillStyle = ballGradient;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
    });

    // Границы поля
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, CANVAS_WIDTH - 2, CANVAS_HEIGHT - 2);

  }, [paddle, balls, blocks, powerUps]);

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    />
  );
};

export default GameCanvas;
