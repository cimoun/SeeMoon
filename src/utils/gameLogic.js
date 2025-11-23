export const GRID_SIZE = 20;
export const CELL_SIZE = 20;
export const INITIAL_SNAKE = [{ x: 10, y: 10 }];
export const INITIAL_DIRECTION = { x: 0, y: 0 };

export const DIFFICULTY_LEVELS = {
  easy: { speed: 250, name: 'Легкий' },
  medium: { speed: 150, name: 'Средний' },
  hard: { speed: 100, name: 'Сложный' }
};

export const generateFood = (snake) => {
  // Ensure safe spawn distance from snake head
  const head = snake[0];
  let food;
  let safeDistance = false;
  
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    
    // Calculate manhattan distance
    const distance = Math.abs(food.x - head.x) + Math.abs(food.y - head.y);
    safeDistance = distance > 2; // Keep at least 2 cells away at spawn
    
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y) || !safeDistance);
  
  return food;
};

export const isOutOfBounds = (position) => {
  return (
    position.x < 0 ||
    position.x >= GRID_SIZE ||
    position.y < 0 ||
    position.y >= GRID_SIZE
  );
};

export const checkSelfCollision = (snake) => {
  const head = snake[0];
  return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
};

export const moveSnake = (snake, direction) => {
  const head = { ...snake[0] };
  head.x += direction.x;
  head.y += direction.y;
  return [head, ...snake];
};

export const checkFoodCollision = (snake, food) => {
  const head = snake[0];
  return head.x === food.x && head.y === food.y;
};

export const getOppositeDirection = (direction) => {
  return { x: -direction.x, y: -direction.y };
};

export const isValidDirection = (newDirection, currentDirection) => {
  const opposite = getOppositeDirection(currentDirection);
  return !(newDirection.x === opposite.x && newDirection.y === opposite.y);
};
