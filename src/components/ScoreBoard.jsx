import { DIFFICULTY_LEVELS } from '../utils/gameLogic';
import './ScoreBoard.css';

const ScoreBoard = ({ score, highScore, difficulty, isPaused }) => {
  return (
    <div className="score-board">
      <div className="score-item">
        <span className="score-label">Счет:</span>
        <span className="score-value">{score}</span>
      </div>
      <div className="score-item">
        <span className="score-label">Рекорд:</span>
        <span className="score-value">{highScore}</span>
      </div>
      <div className="score-item">
        <span className="score-label">Уровень:</span>
        <span className="score-value difficulty">{DIFFICULTY_LEVELS[difficulty].name}</span>
      </div>
      {isPaused && (
        <div className="pause-indicator">
          ПАУЗА
        </div>
      )}
    </div>
  );
};

export default ScoreBoard;

