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
  lasers = [],
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

      // Особая отрисовка для неразрушаемых блоков
      if (block.indestructible) {
        // Металлический стиль
        const metalGradient = ctx.createLinearGradient(
          block.x, block.y,
          block.x, block.y + BLOCK_HEIGHT
        );
        metalGradient.addColorStop(0, '#666677');
        metalGradient.addColorStop(0.3, '#444455');
        metalGradient.addColorStop(0.5, '#555566');
        metalGradient.addColorStop(0.7, '#333344');
        metalGradient.addColorStop(1, '#444455');

        ctx.shadowColor = 'rgba(100, 100, 120, 0.5)';
        ctx.shadowBlur = 8;

        ctx.fillStyle = metalGradient;
        ctx.beginPath();
        ctx.roundRect(block.x, block.y, BLOCK_WIDTH, BLOCK_HEIGHT, 4);
        ctx.fill();

        // Металлическая граница
        ctx.strokeStyle = '#888899';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Болты в углах
        ctx.fillStyle = '#999999';
        ctx.beginPath();
        ctx.arc(block.x + 6, block.y + 6, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(block.x + BLOCK_WIDTH - 6, block.y + 6, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        return;
      }

      // Glow эффект для обычных блоков
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

    // Отрисовка лазеров
    lasers.forEach(laser => {
      // Красное свечение
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 15;

      // Основной лазер
      const laserGradient = ctx.createLinearGradient(
        laser.x, laser.y,
        laser.x + laser.width, laser.y
      );
      laserGradient.addColorStop(0, '#ff4400');
      laserGradient.addColorStop(0.5, '#ff0000');
      laserGradient.addColorStop(1, '#ff4400');

      ctx.fillStyle = laserGradient;
      ctx.fillRect(laser.x, laser.y, laser.width, laser.height);

      // Яркий центр
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(laser.x + 1, laser.y, laser.width - 2, laser.height);

      ctx.shadowBlur = 0;
    });

    // Отрисовка платформы
    ctx.shadowColor = paddle.hasLaser ? '#ff0000' : COLORS.paddleGlow;
    ctx.shadowBlur = 20;

    const gradient = ctx.createLinearGradient(
      paddle.x,
      paddle.y,
      paddle.x,
      paddle.y + paddle.height
    );

    if (paddle.hasLaser) {
      // Красный оттенок при активном лазере
      gradient.addColorStop(0, '#ff6666');
      gradient.addColorStop(1, '#aa2222');
    } else if (paddle.hasCatch) {
      // Зелёный оттенок при активном catch
      gradient.addColorStop(0, '#66ff88');
      gradient.addColorStop(1, '#22aa44');
    } else {
      gradient.addColorStop(0, '#00ffff');
      gradient.addColorStop(1, '#0088aa');
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 8);
    ctx.fill();

    // Лазерные пушки на платформе
    if (paddle.hasLaser) {
      ctx.fillStyle = '#ff0000';
      // Левая пушка
      ctx.fillRect(paddle.x + 5, paddle.y - 8, 6, 10);
      // Правая пушка
      ctx.fillRect(paddle.x + paddle.width - 11, paddle.y - 8, 6, 10);

      // Свечение пушек
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 5;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(paddle.x + 6, paddle.y - 6, 4, 4);
      ctx.fillRect(paddle.x + paddle.width - 10, paddle.y - 6, 4, 4);
    }

    ctx.shadowBlur = 0;

    // Отрисовка мячей
    balls.forEach(ball => {
      if (ball.isMega) {
        // Mega Ball - белое сияние, проходит сквозь блоки
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 25;

        const megaGradient = ctx.createRadialGradient(
          ball.x - ball.radius / 3,
          ball.y - ball.radius / 3,
          0,
          ball.x,
          ball.y,
          ball.radius
        );
        megaGradient.addColorStop(0, '#ffffff');
        megaGradient.addColorStop(0.4, '#ffff88');
        megaGradient.addColorStop(0.7, '#ffaa00');
        megaGradient.addColorStop(1, '#ff6600');

        ctx.fillStyle = megaGradient;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Внешнее кольцо
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 1.5, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Обычный мяч
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
      }

      ctx.shadowBlur = 0;
    });

    // Границы поля
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, CANVAS_WIDTH - 2, CANVAS_HEIGHT - 2);

  }, [paddle, balls, blocks, powerUps, lasers]);

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
