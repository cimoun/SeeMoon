import { useEffect, useState } from 'react';
import { useGame } from '../hooks/useGame';
import GameBoard from './GameBoard';
import ScoreBoard from './ScoreBoard';
import GameOver from './GameOver';
import Controls from './Controls';
import { handleTouchStart, handleTouchMove, handleTouchEnd } from '../utils/touchControls';
import './Game.css';

const Game = () => {
  const [difficulty, setDifficulty] = useState('medium');
  const [touchStart, setTouchStart] = useState(null);
  const {
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
  } = useGame(difficulty);

  useEffect(() => {
    const handleKeyDown = (e) => {
      handleKeyPress(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyPress]);

  const handleSwipe = (direction) => {
    if (!isPlaying || gameOver) return;
    
    const directionMap = {
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight'
    };
    
    handleKeyPress(directionMap[direction]);
  };

  const onTouchStart = (e) => {
    if (isPlaying && !gameOver && !isPaused) {
      e.preventDefault();
      e.stopPropagation();
      handleTouchStart(e, setTouchStart);
    }
  };

  const onTouchMove = (e) => {
    if (touchStart && isPlaying && !gameOver && !isPaused) {
      e.preventDefault();
      e.stopPropagation();
      handleTouchMove(e, touchStart, handleSwipe, setTouchStart);
    }
  };

  const onTouchEnd = (e) => {
    if (touchStart) {
      e.preventDefault();
      e.stopPropagation();
      handleTouchEnd(touchStart, handleSwipe, setTouchStart);
    }
  };

  const handleStart = () => {
    startGame();
  };

  const handleRestart = () => {
    resetGame();
  };

  const handleDifficultyChange = (newDifficulty) => {
    if (!isPlaying) {
      setDifficulty(newDifficulty);
    }
  };

  return (
    <div className="game-container">
      <div className="game-wrapper">
        <h1 className="game-title">Змейка</h1>
        <ScoreBoard 
          score={score} 
          highScore={highScore} 
          difficulty={difficulty}
          isPaused={isPaused}
        />
        <div 
          className="game-area-wrapper"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="game-area">
            <GameBoard snake={snake} food={food} direction={direction} />
            {gameOver && (
              <GameOver 
                score={score} 
                highScore={highScore} 
                onRestart={handleRestart} 
              />
            )}
          </div>
        </div>
        <Controls
          isPlaying={isPlaying}
          isPaused={isPaused}
          gameOver={gameOver}
          onStart={handleStart}
          onPause={togglePause}
          difficulty={difficulty}
          onDifficultyChange={handleDifficultyChange}
        />
      </div>
    </div>
  );
};

export default Game;

