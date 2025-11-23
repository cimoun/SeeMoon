import './Controls.css';

const Controls = ({ isPlaying, isPaused, gameOver, onStart, onPause, difficulty, onDifficultyChange, onSwipe }) => {
  const handleDirectionClick = (direction) => {
    if (onSwipe && isPlaying && !gameOver) {
      onSwipe(direction);
    }
  };

  return (
    <div className="controls">
      {!isPlaying && !gameOver && (
        <button className="start-button" onClick={onStart}>
          Начать игру
        </button>
      )}
      
      {isPlaying && !gameOver && (
        <button className="pause-button" onClick={onPause} title={isPaused ? 'Продолжить' : 'Пауза'}>
          {isPaused ? '▶' : '⏸'}
        </button>
      )}

      {!isPlaying && (
        <div className="difficulty-selector">
          <label className="difficulty-label">Уровень сложности:</label>
          <select 
            className="difficulty-select" 
            value={difficulty} 
            onChange={(e) => onDifficultyChange(e.target.value)}
            disabled={isPlaying}
          >
            <option value="easy">Легкий</option>
            <option value="medium">Средний</option>
            <option value="hard">Сложный</option>
          </select>
        </div>
      )}

      {isPlaying && (
        <div className="mobile-controls">
          <div className="mobile-controls-row">
            <button 
              className="direction-button direction-up"
              onClick={() => handleDirectionClick('up')}
              aria-label="Вверх"
            >
              ↑
            </button>
          </div>
          <div className="mobile-controls-row">
            <button 
              className="direction-button direction-left"
              onClick={() => handleDirectionClick('left')}
              aria-label="Влево"
            >
              ←
            </button>
            <button 
              className="direction-button direction-down"
              onClick={() => handleDirectionClick('down')}
              aria-label="Вниз"
            >
              ↓
            </button>
            <button 
              className="direction-button direction-right"
              onClick={() => handleDirectionClick('right')}
              aria-label="Вправо"
            >
              →
            </button>
          </div>
        </div>
      )}

      <div className="instructions">
        <p className="instructions-title">Управление:</p>
        <div className="instructions-grid">
          <div className="instruction-item desktop-only">
            <span className="key">↑ ↓ ← →</span>
            <span className="instruction-text">или</span>
            <span className="key">W A S D</span>
          </div>
          <div className="instruction-item mobile-only">
            <span className="instruction-text">Свайп по экрану или кнопки ниже</span>
          </div>
          <div className="instruction-item">
            <span className="key">Пробел</span>
            <span className="instruction-text">Пауза</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;

