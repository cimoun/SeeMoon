// Главный игровой движок для Neon Breakout

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  GAME_STATES,
  INITIAL_LIVES,
  PADDLE_SPEED,
  CANVAS_WIDTH,
  POWERUP_TYPES,
  POWERUP_DROP_CHANCE,
  COMBO_TIMEOUT,
  COMBO_MULTIPLIER,
  LASER_COOLDOWN
} from '../utils/constants';
import {
  createPaddle,
  createBall,
  launchBall,
  updateBall,
  updatePowerUp,
  isPowerUpOutOfBounds,
  cloneBall,
  createPowerUp,
  createLaser,
  updateLaser,
  isLaserOutOfBounds,
  attachBallToPaddle
} from '../engine/entities';
import {
  checkWallCollision,
  checkBallFallen,
  checkPaddleCollision,
  checkBlockCollision,
  reflectBall,
  checkPowerUpCollision,
  checkLaserBlockCollision
} from '../engine/physics';
import { generateLevel, isLevelComplete, getTotalLevels } from '../engine/levels';
import { soundManager } from '../utils/sounds';

const HIGH_SCORE_KEY = 'neon-breakout-high-score';

const loadHighScore = () => {
  try {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      return !isNaN(parsed) && parsed >= 0 ? parsed : 0;
    }
  } catch {
    // localStorage недоступен
  }
  return 0;
};

const saveHighScore = (score) => {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, score.toString());
  } catch {
    // localStorage недоступен
  }
};

export const useGameEngine = () => {
  const [gameState, setGameState] = useState(GAME_STATES.MENU);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(loadHighScore);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);

  // Игровые объекты через ref для производительности
  const paddleRef = useRef(createPaddle());
  const ballsRef = useRef([createBall(paddleRef.current.x, paddleRef.current.width)]);
  const blocksRef = useRef([]);
  const powerUpsRef = useRef([]);
  const lasersRef = useRef([]);
  const activeEffectsRef = useRef({});

  // Управление
  const keysRef = useRef({ left: false, right: false, fire: false });
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const lastLaserTimeRef = useRef(0);
  const comboTimerRef = useRef(null);

  // Состояние для рендера
  const [renderTrigger, setRenderTrigger] = useState(0);

  const forceRender = useCallback(() => {
    setRenderTrigger(prev => prev + 1);
  }, []);

  // Инициализация уровня
  const initLevel = useCallback((levelNum) => {
    paddleRef.current = createPaddle();
    ballsRef.current = [createBall(paddleRef.current.x, paddleRef.current.width)];
    blocksRef.current = generateLevel(levelNum);
    powerUpsRef.current = [];
    lasersRef.current = [];
    activeEffectsRef.current = {};
    setCombo(0);
  }, []);

  // Старт игры
  const startGame = useCallback(() => {
    soundManager.init();
    soundManager.resume();
    setScore(0);
    setLives(INITIAL_LIVES);
    setLevel(1);
    initLevel(1);
    setGameState(GAME_STATES.PLAYING);
  }, [initLevel]);

  // Запуск мяча
  const launch = useCallback(() => {
    if (ballsRef.current.some(ball => ball.attached)) {
      ballsRef.current = ballsRef.current.map(ball => {
        if (ball.attached) {
          const launched = launchBall(ball);
          // При Catch после запуска деактивируем его
          paddleRef.current.hasCatch = false;
          return launched;
        }
        return ball;
      });
      soundManager.playLaunch();
    }
  }, []);

  // Стрельба лазером
  const fireLaser = useCallback(() => {
    const paddle = paddleRef.current;
    if (!paddle.hasLaser) return;

    const now = Date.now();
    if (now - lastLaserTimeRef.current < LASER_COOLDOWN) return;

    lastLaserTimeRef.current = now;
    lasersRef.current.push(createLaser(paddle));
    soundManager.playHitWall(); // Используем как звук выстрела
  }, []);

  // Пауза
  const togglePause = useCallback(() => {
    if (gameState === GAME_STATES.PLAYING) {
      setGameState(GAME_STATES.PAUSED);
    } else if (gameState === GAME_STATES.PAUSED) {
      setGameState(GAME_STATES.PLAYING);
    }
  }, [gameState]);

  // Возврат в меню
  const returnToMenu = useCallback(() => {
    setGameState(GAME_STATES.MENU);
  }, []);

  // Обработка уничтожения блока
  const handleBlockDestroyed = useCallback((block) => {
    // Очки с учётом комбо
    const comboBonus = Math.floor(combo * COMBO_MULTIPLIER);
    const points = block.points + comboBonus;

    setScore(prev => {
      const newScore = prev + points;
      if (newScore > highScore) {
        setHighScore(newScore);
        saveHighScore(newScore);
      }
      return newScore;
    });

    // Обновляем комбо
    setCombo(prev => prev + 1);
    if (comboTimerRef.current) {
      clearTimeout(comboTimerRef.current);
    }
    comboTimerRef.current = setTimeout(() => setCombo(0), COMBO_TIMEOUT);

    // Шанс дропа power-up
    if (Math.random() < POWERUP_DROP_CHANCE) {
      const types = Object.values(POWERUP_TYPES);
      const randomType = types[Math.floor(Math.random() * types.length)];
      powerUpsRef.current.push(createPowerUp(block.x + 23, block.y, randomType));
    }

    soundManager.playHitBlock();
  }, [combo, highScore]);

  // Применение power-up
  const applyPowerUp = useCallback((powerUp) => {
    soundManager.playPowerUp();

    switch (powerUp.type.id) {
      case 'wide':
        paddleRef.current.width = paddleRef.current.originalWidth * 1.5;
        if (activeEffectsRef.current.wide) {
          clearTimeout(activeEffectsRef.current.wide);
        }
        activeEffectsRef.current.wide = setTimeout(() => {
          paddleRef.current.width = paddleRef.current.originalWidth;
        }, powerUp.type.duration);
        break;

      case 'multi': {
        const currentBalls = ballsRef.current.filter(b => !b.attached);
        if (currentBalls.length > 0 && currentBalls.length < 5) {
          const newBalls = currentBalls.map(ball => cloneBall(ball));
          ballsRef.current = [...ballsRef.current, ...newBalls];
        }
        break;
      }

      case 'slow':
        ballsRef.current = ballsRef.current.map(ball => ({
          ...ball,
          dx: ball.dx * 0.7,
          dy: ball.dy * 0.7,
          speed: ball.speed * 0.7
        }));
        if (activeEffectsRef.current.slow) {
          clearTimeout(activeEffectsRef.current.slow);
        }
        activeEffectsRef.current.slow = setTimeout(() => {
          ballsRef.current = ballsRef.current.map(ball => ({
            ...ball,
            dx: ball.dx / 0.7,
            dy: ball.dy / 0.7,
            speed: ball.speed / 0.7
          }));
        }, powerUp.type.duration);
        break;

      case 'catch':
        paddleRef.current.hasCatch = true;
        break;

      case 'laser':
        paddleRef.current.hasLaser = true;
        if (activeEffectsRef.current.laser) {
          clearTimeout(activeEffectsRef.current.laser);
        }
        activeEffectsRef.current.laser = setTimeout(() => {
          paddleRef.current.hasLaser = false;
        }, powerUp.type.duration);
        break;

      case 'life':
        setLives(prev => prev + 1);
        break;

      case 'mega':
        ballsRef.current = ballsRef.current.map(ball => ({
          ...ball,
          isMega: true
        }));
        if (activeEffectsRef.current.mega) {
          clearTimeout(activeEffectsRef.current.mega);
        }
        activeEffectsRef.current.mega = setTimeout(() => {
          ballsRef.current = ballsRef.current.map(ball => ({
            ...ball,
            isMega: false
          }));
        }, powerUp.type.duration);
        break;
    }
  }, []);

  // Потеря жизни
  const loseLife = useCallback(() => {
    soundManager.playLoseLife();

    // Сбрасываем эффекты платформы
    paddleRef.current.hasCatch = false;
    paddleRef.current.hasLaser = false;
    paddleRef.current.width = paddleRef.current.originalWidth;

    // Очищаем таймеры эффектов
    Object.values(activeEffectsRef.current).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
    activeEffectsRef.current = {};

    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        soundManager.playGameOver();
        setGameState(GAME_STATES.GAME_OVER);
      } else {
        // Сброс мяча
        ballsRef.current = [createBall(paddleRef.current.x, paddleRef.current.width)];
        powerUpsRef.current = [];
        lasersRef.current = [];
      }
      return newLives;
    });
  }, []);

  // Переход на следующий уровень
  const nextLevel = useCallback(() => {
    const newLevel = level + 1;
    if (newLevel > getTotalLevels()) {
      soundManager.playWin();
      setGameState(GAME_STATES.WIN);
    } else {
      setLevel(newLevel);
      initLevel(newLevel);
    }
  }, [level, initLevel]);

  // Главный игровой цикл
  const gameLoop = useCallback((timestamp) => {
    if (gameState !== GAME_STATES.PLAYING) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = timestamp - lastTimeRef.current;
    if (deltaTime < 16) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    lastTimeRef.current = timestamp;

    const paddle = paddleRef.current;

    // Движение платформы
    if (keysRef.current.left && paddle.x > 0) {
      paddle.x = Math.max(0, paddle.x - PADDLE_SPEED);
    }
    if (keysRef.current.right && paddle.x + paddle.width < CANVAS_WIDTH) {
      paddle.x = Math.min(CANVAS_WIDTH - paddle.width, paddle.x + PADDLE_SPEED);
    }

    // Автоматическая стрельба лазером
    if (keysRef.current.fire && paddle.hasLaser) {
      fireLaser();
    }

    // Обновление лазеров
    lasersRef.current = lasersRef.current.filter(laser => {
      const updated = updateLaser(laser);
      laser.y = updated.y;

      if (isLaserOutOfBounds(laser)) {
        return false;
      }

      // Проверка столкновений лазера с блоками
      for (const block of blocksRef.current) {
        if (block.destroyed || block.indestructible) continue;

        if (checkLaserBlockCollision(laser, block)) {
          block.health--;
          if (block.health <= 0) {
            block.destroyed = true;
            handleBlockDestroyed(block);
          } else {
            soundManager.playHitBlock();
          }
          return false; // Удаляем лазер после попадания
        }
      }

      return true;
    });

    // Обновление мячей
    let ballsToRemove = [];
    ballsRef.current = ballsRef.current.map((ball, index) => {
      let updatedBall = updateBall(ball, paddle);

      if (ball.attached) return updatedBall;

      // Столкновение со стенами
      const wallResult = checkWallCollision(updatedBall);
      updatedBall = wallResult.ball;
      if (wallResult.hitWall) {
        soundManager.playHitWall();
      }

      // Проверка падения
      if (checkBallFallen(updatedBall)) {
        ballsToRemove.push(index);
        return updatedBall;
      }

      // Столкновение с платформой
      const paddleResult = checkPaddleCollision(updatedBall, paddle);
      if (paddleResult.hit) {
        soundManager.playHitPaddle();

        // Если активен Catch - прилепляем мяч
        if (paddle.hasCatch) {
          updatedBall = attachBallToPaddle(updatedBall, paddle);
        } else {
          updatedBall = paddleResult.ball;
        }
        return updatedBall;
      }

      // Столкновение с блоками
      for (const block of blocksRef.current) {
        if (block.destroyed) continue;

        const blockResult = checkBlockCollision(updatedBall, block);
        if (blockResult.hit) {
          // Mega Ball не отскакивает и проходит сквозь обычные блоки
          if (!updatedBall.isMega) {
            updatedBall = reflectBall(updatedBall, blockResult.side);
          }

          // Неразрушаемые блоки не получают урон
          if (!block.indestructible) {
            // Mega Ball уничтожает за 1 удар
            if (updatedBall.isMega) {
              block.health = 0;
            } else {
              block.health--;
            }

            if (block.health <= 0) {
              block.destroyed = true;
              handleBlockDestroyed(block);
            } else {
              soundManager.playHitBlock();
            }
          } else {
            // От неразрушаемых всегда отскакиваем
            if (updatedBall.isMega) {
              updatedBall = reflectBall(updatedBall, blockResult.side);
            }
            soundManager.playHitWall();
          }

          if (!updatedBall.isMega) {
            break; // Обычный мяч отскакивает после первого столкновения
          }
        }
      }

      return updatedBall;
    });

    // Удаление упавших мячей
    if (ballsToRemove.length > 0) {
      ballsRef.current = ballsRef.current.filter((_, i) => !ballsToRemove.includes(i));

      if (ballsRef.current.length === 0) {
        loseLife();
      }
    }

    // Обновление power-ups
    powerUpsRef.current = powerUpsRef.current.filter(powerUp => {
      const updated = updatePowerUp(powerUp);
      powerUp.y = updated.y;

      if (isPowerUpOutOfBounds(powerUp)) {
        return false;
      }

      if (checkPowerUpCollision(powerUp, paddle)) {
        applyPowerUp(powerUp);
        return false;
      }

      return true;
    });

    // Проверка завершения уровня
    if (isLevelComplete(blocksRef.current)) {
      nextLevel();
    }

    forceRender();
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, handleBlockDestroyed, applyPowerUp, loseLife, nextLevel, forceRender, fireLaser]);

  // Запуск игрового цикла
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameLoop]);

  // Обработка клавиатуры
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          keysRef.current.left = true;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          keysRef.current.right = true;
          break;
        case ' ':
          e.preventDefault();
          if (gameState === GAME_STATES.PLAYING) {
            const hasAttached = ballsRef.current.some(b => b.attached);
            if (hasAttached) {
              launch();
            } else {
              togglePause();
            }
          } else if (gameState === GAME_STATES.PAUSED) {
            togglePause();
          }
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          keysRef.current.fire = true;
          if (gameState === GAME_STATES.PLAYING && paddleRef.current.hasLaser) {
            fireLaser();
          }
          break;
        case 'Escape':
          if (gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.PAUSED) {
            togglePause();
          }
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          keysRef.current.left = false;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          keysRef.current.right = false;
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          keysRef.current.fire = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, launch, togglePause, fireLaser]);

  // Функция перемещения платформы для touch
  const movePaddle = useCallback((x) => {
    const paddle = paddleRef.current;
    const newX = x - paddle.width / 2;
    paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, newX));
  }, []);

  return {
    // Состояние
    gameState,
    score,
    highScore,
    lives,
    level,
    combo,

    // Геттеры для рендера
    getPaddle: () => paddleRef.current,
    getBalls: () => ballsRef.current,
    getBlocks: () => blocksRef.current,
    getPowerUps: () => powerUpsRef.current,
    getLasers: () => lasersRef.current,

    // Действия
    startGame,
    launch,
    togglePause,
    returnToMenu,
    movePaddle,
    fireLaser,

    // Для принудительного рендера
    renderTrigger
  };
};
