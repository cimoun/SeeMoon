// HUD - интерфейс с информацией об игре

import './HUD.css';

const HUD = ({ score, highScore, lives, level, combo, isPaused }) => {
  return (
    <div className="hud">
      <div className="hud-left">
        <div className="hud-item">
          <span className="hud-label">Уровень</span>
          <span className="hud-value level">{level}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Жизни</span>
          <span className="hud-value lives">
            {Array.from({ length: lives }, (_, i) => (
              <span key={i} className="life-icon">●</span>
            ))}
          </span>
        </div>
      </div>

      <div className="hud-center">
        {combo > 1 && (
          <div className="combo-display">
            <span className="combo-value">x{combo}</span>
            <span className="combo-label">COMBO</span>
          </div>
        )}
        {isPaused && (
          <div className="pause-indicator">
            ПАУЗА
          </div>
        )}
      </div>

      <div className="hud-right">
        <div className="hud-item">
          <span className="hud-label">Очки</span>
          <span className="hud-value score">{score.toLocaleString()}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Рекорд</span>
          <span className="hud-value high-score">{highScore.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default HUD;
