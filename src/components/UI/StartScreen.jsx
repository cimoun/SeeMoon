// Стартовый экран

import './StartScreen.css';

const StartScreen = ({ onStart, highScore }) => {
  return (
    <div className="start-screen">
      <div className="start-content">
        <h1 className="game-title">
          <span className="title-neon">NEON</span>
          <span className="title-breakout">BREAKOUT</span>
        </h1>

        <div className="subtitle">Аркадная игра в стиле киберпанк</div>

        {highScore > 0 && (
          <div className="high-score-display">
            Рекорд: <span>{highScore.toLocaleString()}</span>
          </div>
        )}

        <button className="start-button" onClick={onStart}>
          НАЧАТЬ ИГРУ
        </button>

        <div className="instructions">
          <h3>Управление</h3>
          <div className="instruction-grid">
            <div className="instruction-item">
              <span className="keys">← →</span>
              <span>или</span>
              <span className="keys">A D</span>
              <span className="instruction-desc">Движение</span>
            </div>
            <div className="instruction-item">
              <span className="keys">ПРОБЕЛ</span>
              <span className="instruction-desc">Запуск / Пауза</span>
            </div>
            <div className="instruction-item">
              <span className="keys">↑</span>
              <span>или</span>
              <span className="keys">W</span>
              <span className="instruction-desc">Стрельба лазером</span>
            </div>
          </div>
          <p className="mobile-hint">На мобильных: касание и свайп по экрану</p>
        </div>

        <div className="powerups-info">
          <h3>Бонусы</h3>
          <div className="powerup-list">
            <div className="powerup-item">
              <span className="powerup-icon" style={{ background: '#00ff00' }}>W</span>
              <span>Широкая платформа</span>
            </div>
            <div className="powerup-item">
              <span className="powerup-icon" style={{ background: '#ffff00' }}>M</span>
              <span>Мультибол</span>
            </div>
            <div className="powerup-item">
              <span className="powerup-icon" style={{ background: '#00aaff' }}>S</span>
              <span>Замедление</span>
            </div>
            <div className="powerup-item">
              <span className="powerup-icon" style={{ background: '#00ff88' }}>C</span>
              <span>Прилипание мяча</span>
            </div>
            <div className="powerup-item">
              <span className="powerup-icon" style={{ background: '#ff0000' }}>L</span>
              <span>Лазер</span>
            </div>
            <div className="powerup-item">
              <span className="powerup-icon" style={{ background: '#ff00ff' }}>+</span>
              <span>Доп. жизнь</span>
            </div>
            <div className="powerup-item">
              <span className="powerup-icon" style={{ background: '#ffffff', color: '#000000' }}>★</span>
              <span>Мега-мяч</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
