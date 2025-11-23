// Game constants
export const GRID_SIZE = 20;
export const CELL_SIZE = 20;
export const INITIAL_SNAKE = [{ x: 10, y: 10 }];
export const INITIAL_DIRECTION = { x: 1, y: 0 };

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  easy: { speed: 150, name: 'Легкий' },
  medium: { speed: 100, name: 'Средний' },
  hard: { speed: 50, name: 'Сложный' }
};

// Generate random food position
export const generateFood = (snake) => {
  let food;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  return food;
};

// Check if position is out of bounds
export const isOutOfBounds = (position) => {
  return (
    position.x < 0 ||
    position.x >= GRID_SIZE ||
    position.y < 0 ||
    position.y >= GRID_SIZE
  );
};

// Check if snake collides with itself
export const checkSelfCollision = (snake) => {
  const head = snake[0];
  return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
};

// Move snake
export const moveSnake = (snake, direction) => {
  const head = { ...snake[0] };
  head.x += direction.x;
  head.y += direction.y;
  return [head, ...snake];
};

// Check if snake ate food
export const checkFoodCollision = (snake, food) => {
  const head = snake[0];
  return head.x === food.x && head.y === food.y;
};

// Get opposite direction
export const getOppositeDirection = (direction) => {
  return { x: -direction.x, y: -direction.y };
};

// Check if direction is valid (prevent moving backwards)
export const isValidDirection = (newDirection, currentDirection) => {
  const opposite = getOppositeDirection(currentDirection);
  return !(newDirection.x === opposite.x && newDirection.y === opposite.y);
};

