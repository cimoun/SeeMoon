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
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [nextDirection, setNextDirection] = useState(INITIAL_DIRECTION);
  
  const gameLoopRef = useRef(null);
  const directionRef = useRef(INITIAL_DIRECTION);

  // Update direction ref when direction changes
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  // Save high score to localStorage
  const saveHighScore = useCallback((newScore) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem(HIGH_SCORE_KEY, newScore.toString());
    }
  }, [highScore]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (isPaused || !isPlaying || gameOver) return;

    setSnake(prevSnake => {
      // Update direction from nextDirection
      const newDirection = nextDirection;
      setDirection(newDirection);
      directionRef.current = newDirection;

      // Move snake
      const newSnake = moveSnake(prevSnake, newDirection);
      const head = newSnake[0];

      // Check collisions
      if (isOutOfBounds(head) || checkSelfCollision(newSnake)) {
        setGameOver(true);
        setIsPlaying(false);
        soundManager.playGameOverSound();
        return prevSnake;
      }

      // Check food collision
      if (checkFoodCollision(newSnake, food)) {
        soundManager.playEatSound();
        setScore(prevScore => {
          const newScore = prevScore + 10;
          saveHighScore(newScore);
          return newScore;
        });
        setFood(generateFood(newSnake));
        return newSnake; // Don't remove tail when eating
      }

      // Remove tail if not eating
      return newSnake.slice(0, -1);
    });
  }, [isPaused, isPlaying, gameOver, food, nextDirection, saveHighScore]);

  // Start game loop
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

  // Handle keyboard input
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

    if (newDirection && isValidDirection(newDirection, directionRef.current)) {
      setNextDirection(newDirection);
    }
  }, [gameOver, isPlaying]);

  // Start game
  const startGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood(INITIAL_SNAKE));
    setDirection(INITIAL_DIRECTION);
    setNextDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood(INITIAL_SNAKE));
    setDirection(INITIAL_DIRECTION);
    setNextDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setIsPlaying(false);
  }, []);

  // Toggle pause
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

