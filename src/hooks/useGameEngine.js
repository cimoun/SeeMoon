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
  COMBO_MULTIPLIER
} from '../utils/constants';
import {
  createPaddle,
  createBall,
  launchBall,
  updateBall,
  updatePowerUp,
  isPowerUpOutOfBounds,
  cloneBall,
  createPowerUp
} from '../engine/entities';
import {
  checkWallCollision,
  checkBallFallen,
  checkPaddleCollision,
  checkBlockCollision,
  reflectBall,
  checkPowerUpCollision
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
  const activeEffectsRef = useRef({});

  // Управление
  const keysRef = useRef({ left: false, right: false });
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
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
      ballsRef.current = ballsRef.current.map(ball =>
        ball.attached ? launchBall(ball) : ball
      );
      soundManager.playLaunch();
    }
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
    }
  }, []);

  // Потеря жизни
  const loseLife = useCallback(() => {
    soundManager.playLoseLife();
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        soundManager.playGameOver();
        setGameState(GAME_STATES.GAME_OVER);
      } else {
        // Сброс мяча
        ballsRef.current = [createBall(paddleRef.current.x, paddleRef.current.width)];
        powerUpsRef.current = [];
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
      updatedBall = paddleResult.ball;
      if (paddleResult.hit) {
        soundManager.playHitPaddle();
      }

      // Столкновение с блоками
      for (const block of blocksRef.current) {
        if (block.destroyed) continue;

        const blockResult = checkBlockCollision(updatedBall, block);
        if (blockResult.hit) {
          updatedBall = reflectBall(updatedBall, blockResult.side);
          block.health--;

          if (block.health <= 0) {
            block.destroyed = true;
            handleBlockDestroyed(block);
          } else {
            soundManager.playHitBlock();
          }
          break;
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
  }, [gameState, handleBlockDestroyed, applyPowerUp, loseLife, nextLevel, forceRender]);

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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, launch, togglePause]);

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

    // Действия
    startGame,
    launch,
    togglePause,
    returnToMenu,
    movePaddle,

    // Для принудительного рендера
    renderTrigger
  };
};
