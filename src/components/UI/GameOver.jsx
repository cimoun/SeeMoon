// Экран Game Over

import './GameOver.css';

const GameOver = ({ score, highScore, isNewRecord, onRestart, onMenu }) => {
  return (
    <div className="game-over-overlay">
      <div className="game-over-modal">
        <h2 className="game-over-title">GAME OVER</h2>

        {isNewRecord && (
          <div className="new-record">
            НОВЫЙ РЕКОРД!
          </div>
        )}

        <div className="final-stats">
          <div className="stat-item">
            <span className="stat-label">Ваш счёт</span>
            <span className="stat-value score">{score.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Лучший результат</span>
            <span className="stat-value high-score">{highScore.toLocaleString()}</span>
          </div>
        </div>

        <div className="game-over-buttons">
          <button className="retry-button" onClick={onRestart}>
            ИГРАТЬ СНОВА
          </button>
          <button className="menu-button" onClick={onMenu}>
            В МЕНЮ
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
