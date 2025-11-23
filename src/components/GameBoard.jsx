import { GRID_SIZE, CELL_SIZE } from '../utils/gameLogic';
import './GameBoard.css';

const GameBoard = ({ snake, food, direction }) => {
  const getDirectionClass = () => {
    if (!direction) return '';
    if (direction.x === 1) return 'direction-right';
    if (direction.x === -1) return 'direction-left';
    if (direction.y === -1) return 'direction-up';
    if (direction.y === 1) return 'direction-down';
    return '';
  };

  const renderCell = (x, y) => {
    const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
    const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
    const isFood = food.x === x && food.y === y;

    let cellClass = 'cell';
    if (isSnakeHead) {
      cellClass += ' snake-head';
      cellClass += ' ' + getDirectionClass();
    }
    if (isSnakeBody) cellClass += ' snake-body';
    if (isFood) cellClass += ' food';

    return (
      <div
        key={`${x}-${y}`}
        className={cellClass}
        style={{
          gridColumn: x + 1,
          gridRow: y + 1
        }}
      />
    );
  };

  const cells = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      cells.push(renderCell(x, y));
    }
  }

  return (
    <div className="game-board">
      {cells}
    </div>
  );
};

export default GameBoard;

