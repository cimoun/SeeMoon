// Главный игровой компонент

import { useCallback, useRef } from 'react';
import { useGameEngine } from '../../hooks/useGameEngine';
import { GAME_STATES, CANVAS_WIDTH } from '../../utils/constants';
import GameCanvas from '../Canvas/GameCanvas';
import HUD from '../UI/HUD';
import StartScreen from '../UI/StartScreen';
import GameOver from '../UI/GameOver';
import WinScreen from '../UI/WinScreen';
import './Game.css';

const Game = () => {
  const {
    gameState,
    score,
    highScore,
    lives,
    level,
    combo,
    getPaddle,
    getBalls,
    getBlocks,
    getPowerUps,
    getLasers,
    startGame,
    launch,
    togglePause,
    returnToMenu,
    movePaddle,
    renderTrigger
  } = useGameEngine();

  const gameAreaRef = useRef(null);
  const touchStartRef = useRef(null);

  // Обработка touch для мобильных устройств
  const handleTouchStart = useCallback((e) => {
    if (gameState !== GAME_STATES.PLAYING) return;

    const touch = e.touches[0];
    const rect = e.target.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const x = (touch.clientX - rect.left) * scaleX;

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    // Если мяч прикреплён - запускаем его тапом
    const balls = getBalls();
    if (balls.some(b => b.attached)) {
      launch();
      return;
    }

    movePaddle(x);
  }, [gameState, getBalls, launch, movePaddle]);

  const handleTouchMove = useCallback((e) => {
    if (gameState !== GAME_STATES.PLAYING) return;
    e.preventDefault();

    const touch = e.touches[0];
    const rect = e.target.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const x = (touch.clientX - rect.left) * scaleX;

    movePaddle(x);
  }, [gameState, movePaddle]);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  const isNewRecord = score > 0 && score >= highScore;

  return (
    <div className="game" ref={gameAreaRef}>
      {gameState === GAME_STATES.MENU && (
        <StartScreen onStart={startGame} highScore={highScore} />
      )}

      {gameState !== GAME_STATES.MENU && (
        <>
          <HUD
            score={score}
            highScore={highScore}
            lives={lives}
            level={level}
            combo={combo}
            isPaused={gameState === GAME_STATES.PAUSED}
          />

          <div className="game-canvas-container">
            <GameCanvas
              key={renderTrigger}
              paddle={getPaddle()}
              balls={getBalls()}
              blocks={getBlocks()}
              powerUps={getPowerUps()}
              lasers={getLasers()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />

            {gameState === GAME_STATES.PAUSED && (
              <div className="pause-overlay" onClick={togglePause}>
                <div className="pause-content">
                  <span className="pause-icon">⏸</span>
                  <span className="pause-text">ПАУЗА</span>
                  <span className="pause-hint">Нажмите чтобы продолжить</span>
                </div>
              </div>
            )}
          </div>

          <div className="game-controls-hint">
            <span className="desktop-hint">← → / A D - движение | ПРОБЕЛ - запуск/пауза | ↑ / W - лазер</span>
            <span className="mobile-hint">Касайтесь экрана для управления</span>
          </div>
        </>
      )}

      {gameState === GAME_STATES.GAME_OVER && (
        <GameOver
          score={score}
          highScore={highScore}
          isNewRecord={isNewRecord}
          onRestart={startGame}
          onMenu={returnToMenu}
        />
      )}

      {gameState === GAME_STATES.WIN && (
        <WinScreen
          score={score}
          highScore={highScore}
          isNewRecord={isNewRecord}
          onRestart={startGame}
          onMenu={returnToMenu}
        />
      )}
    </div>
  );
};

export default Game;
