import { useEffect, useState } from 'react';
import { useGame } from '../hooks/useGame';
import GameBoard from './GameBoard';
import ScoreBoard from './ScoreBoard';
import GameOver from './GameOver';
import Controls from './Controls';
import './Game.css';

const Game = () => {
  const [difficulty, setDifficulty] = useState('medium');
  const {
    snake,
    food,
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

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      handleKeyPress(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyPress]);

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
        <div className="game-area">
          <GameBoard snake={snake} food={food} />
          {gameOver && (
            <GameOver 
              score={score} 
              highScore={highScore} 
              onRestart={handleRestart} 
            />
          )}
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

