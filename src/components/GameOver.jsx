import './GameOver.css';

const GameOver = ({ score, highScore, onRestart }) => {
  const isNewRecord = score === highScore && score > 0;

  return (
    <div className="game-over-overlay">
      <div className="game-over-modal">
        <h2 className="game-over-title">Игра окончена!</h2>
        <div className="game-over-scores">
          <div className="final-score">
            <span className="final-score-label">Ваш счет:</span>
            <span className="final-score-value">{score}</span>
          </div>
          {isNewRecord && (
            <div className="new-record">
              🎉 Новый рекорд! 🎉
            </div>
          )}
          <div className="high-score">
            <span className="high-score-label">Рекорд:</span>
            <span className="high-score-value">{highScore}</span>
          </div>
        </div>
        <button className="restart-button" onClick={onRestart}>
          Играть снова
        </button>
      </div>
    </div>
  );
};

export default GameOver;

