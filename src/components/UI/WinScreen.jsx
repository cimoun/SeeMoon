// Экран победы

import './WinScreen.css';

const WinScreen = ({ score, highScore, isNewRecord, onRestart, onMenu }) => {
  return (
    <div className="win-overlay">
      <div className="win-modal">
        <div className="win-celebration">
          <span className="star">★</span>
          <span className="star">★</span>
          <span className="star">★</span>
        </div>

        <h2 className="win-title">ПОБЕДА!</h2>
        <p className="win-subtitle">Все уровни пройдены!</p>

        {isNewRecord && (
          <div className="new-record-win">
            НОВЫЙ РЕКОРД!
          </div>
        )}

        <div className="win-stats">
          <div className="win-stat">
            <span className="win-stat-label">Финальный счёт</span>
            <span className="win-stat-value">{score.toLocaleString()}</span>
          </div>
          <div className="win-stat">
            <span className="win-stat-label">Лучший результат</span>
            <span className="win-stat-value high">{highScore.toLocaleString()}</span>
          </div>
        </div>

        <div className="win-buttons">
          <button className="play-again-button" onClick={onRestart}>
            ИГРАТЬ СНОВА
          </button>
          <button className="win-menu-button" onClick={onMenu}>
            В МЕНЮ
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinScreen;
