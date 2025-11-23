import { useState, useEffect, useCallback, useRef } from 'react';
import {
  INITIAL_SNAKE,
  INITIAL_DIRECTION,
  GRID_SIZE,
  generateFood,
  isOutOfBounds,
  checkSelfCollision,
  moveSnake,
  checkFoodCollision,
  isValidDirection,
  DIFFICULTY_LEVELS
} from '../utils/gameLogic';
import { soundManager } from '../utils/sounds';

const HIGH_SCORE_KEY = 'snake-game-high-score';

export const useGame = (difficulty = 'medium') => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(() => generateFood(INITIAL_SNAKE));
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem(HIGH_SCORE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        return !isNaN(parsed) && parsed >= 0 ? parsed : 0;
      }
    } catch {
      // localStorage might not be available or accessible
    }
    return 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [nextDirection, setNextDirection] = useState(INITIAL_DIRECTION);
  
  const gameLoopRef = useRef(null);
  const directionRef = useRef(INITIAL_DIRECTION);
  const inputBufferRef = useRef([]);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const saveHighScore = useCallback((newScore) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      try {
        localStorage.setItem(HIGH_SCORE_KEY, newScore.toString());
      } catch {
        // localStorage might not be available or accessible
      }
    }
  }, [highScore]);

  const gameLoop = useCallback(() => {
    if (isPaused || !isPlaying || gameOver) return;

    let newDirection = directionRef.current;
    
    // Handle start of game - wait for initial direction
    if (newDirection.x === 0 && newDirection.y === 0) {
      if (inputBufferRef.current.length > 0) {
        newDirection = inputBufferRef.current.shift();
        directionRef.current = newDirection;
        setDirection(newDirection);
        setNextDirection(newDirection);
      } else {
        return; // Don't move until first input
      }
    } else if (inputBufferRef.current.length > 0) {
      // Process next buffered input
      const bufferedDirection = inputBufferRef.current[0];
      if (isValidDirection(bufferedDirection, directionRef.current)) {
        newDirection = bufferedDirection;
        inputBufferRef.current.shift();
        directionRef.current = newDirection;
        setDirection(newDirection);
        setNextDirection(newDirection);
      } else {
        // Invalid direction in buffer (e.g. 180 turn), discard it
        inputBufferRef.current.shift();
      }
    } else if (nextDirection.x !== directionRef.current.x || nextDirection.y !== directionRef.current.y) {
      if (isValidDirection(nextDirection, directionRef.current)) {
        newDirection = nextDirection;
        directionRef.current = newDirection;
        setDirection(newDirection);
      }
    }

    setSnake(prevSnake => {
      const newSnake = moveSnake(prevSnake, newDirection);
      const head = newSnake[0];

      if (isOutOfBounds(head) || checkSelfCollision(newSnake)) {
        setGameOver(true);
        setIsPlaying(false);
        soundManager.playGameOverSound();
        return prevSnake;
      }

      if (checkFoodCollision(newSnake, food)) {
        soundManager.playEatSound();
        setScore(prevScore => {
          const newScore = prevScore + 10;
          saveHighScore(newScore);
          return newScore;
        });
        setFood(generateFood(newSnake));
        return newSnake;
      }

      return newSnake.slice(0, -1);
    });
  }, [isPaused, isPlaying, gameOver, food, nextDirection, saveHighScore]);

  useEffect(() => {
    if (isPlaying && !gameOver && !isPaused) {
      const speed = DIFFICULTY_LEVELS[difficulty].speed;
      gameLoopRef.current = setInterval(gameLoop, speed);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver, isPaused, gameLoop, difficulty]);

  const handleKeyPress = useCallback((key) => {
    if (gameOver) return;

    let newDirection = null;

    switch (key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        newDirection = { x: 0, y: -1 };
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        newDirection = { x: 0, y: 1 };
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        newDirection = { x: -1, y: 0 };
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        newDirection = { x: 1, y: 0 };
        break;
      case ' ':
        if (isPlaying) {
          setIsPaused(prev => {
            if (!prev) {
              soundManager.playPauseSound();
            }
            return !prev;
          });
        }
        break;
      default:
        return;
    }

    if (newDirection) {
      // Allow setting direction even if currently not moving (start of game)
      const isStationary = directionRef.current.x === 0 && directionRef.current.y === 0;
      
      if (isStationary || isValidDirection(newDirection, directionRef.current)) {
        // If stationary, just take the first input
        if (isStationary) {
           // Only add to buffer if buffer is empty to avoid double start issue
           if (inputBufferRef.current.length === 0) {
             inputBufferRef.current.push(newDirection);
           }
        } else {
          // Standard buffering logic
          if (inputBufferRef.current.length === 0) {
             if (newDirection.x !== directionRef.current.x || newDirection.y !== directionRef.current.y) {
                setNextDirection(newDirection);
                // Also push to buffer to ensure it's picked up by game loop
                inputBufferRef.current.push(newDirection);
             }
          } else if (inputBufferRef.current.length < 2) {
            const lastBuffered = inputBufferRef.current[inputBufferRef.current.length - 1];
            if (!lastBuffered || (lastBuffered.x !== newDirection.x || lastBuffered.y !== newDirection.y)) {
              inputBufferRef.current.push(newDirection);
            }
          }
        }
      }
    }
  }, [gameOver, isPlaying, nextDirection]);

  const startGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood(INITIAL_SNAKE));
    setDirection(INITIAL_DIRECTION);
    setNextDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    inputBufferRef.current = [];
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
  }, []);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood(INITIAL_SNAKE));
    setDirection(INITIAL_DIRECTION);
    setNextDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    inputBufferRef.current = [];
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setIsPlaying(false);
  }, []);

  const togglePause = useCallback(() => {
    if (isPlaying && !gameOver) {
      setIsPaused(prev => {
        if (!prev) {
          soundManager.playPauseSound();
        }
        return !prev;
      });
    }
  }, [isPlaying, gameOver]);

  return {
    snake,
    food,
    direction,
    score,
    highScore,
    gameOver,
    isPaused,
    isPlaying,
    startGame,
    resetGame,
    togglePause,
    handleKeyPress
  };
};

