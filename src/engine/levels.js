// Генерация уровней для Neon Breakout

import {
  BLOCK_ROWS,
  BLOCK_COLS,
  BLOCK_WIDTH,
  BLOCK_HEIGHT,
  BLOCK_PADDING,
  BLOCK_OFFSET_TOP,
  BLOCK_OFFSET_LEFT
} from '../utils/constants';
import { createBlock } from './entities';

// Паттерны уровней (0 = пусто, 1 = обычный, 2 = усиленный, 3 = прочный)
const LEVEL_PATTERNS = [
  // Уровень 1 - Классический
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  // Уровень 2 - Пирамида
  [
    [0, 0, 0, 0, 3, 3, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 2, 2, 0, 0, 0],
    [0, 0, 2, 2, 2, 2, 2, 2, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  // Уровень 3 - Шахматы
  [
    [3, 0, 3, 0, 3, 0, 3, 0, 3, 0],
    [0, 2, 0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
  ],
  // Уровень 4 - Крепость
  [
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 2, 2, 2, 2, 2, 2, 0, 3],
    [3, 0, 2, 1, 1, 1, 1, 2, 0, 3],
    [3, 0, 2, 1, 1, 1, 1, 2, 0, 3]
  ],
  // Уровень 5 - Финальный
  [
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    [2, 3, 2, 3, 2, 2, 3, 2, 3, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ]
];

const BLOCK_TYPE_MAP = {
  1: 'NORMAL',
  2: 'STRONG',
  3: 'SUPER'
};

// Генерация блоков для уровня
export const generateLevel = (levelNumber) => {
  const patternIndex = Math.min(levelNumber - 1, LEVEL_PATTERNS.length - 1);
  const pattern = LEVEL_PATTERNS[patternIndex];
  const blocks = [];

  for (let row = 0; row < BLOCK_ROWS; row++) {
    for (let col = 0; col < BLOCK_COLS; col++) {
      const blockValue = pattern[row]?.[col] || 0;

      if (blockValue > 0) {
        const x = BLOCK_OFFSET_LEFT + col * (BLOCK_WIDTH + BLOCK_PADDING);
        const y = BLOCK_OFFSET_TOP + row * (BLOCK_HEIGHT + BLOCK_PADDING);
        const type = BLOCK_TYPE_MAP[blockValue];
        blocks.push(createBlock(x, y, type));
      }
    }
  }

  return blocks;
};

// Проверка завершения уровня
export const isLevelComplete = (blocks) => {
  return blocks.every(block => block.destroyed);
};

// Получить общее количество уровней
export const getTotalLevels = () => LEVEL_PATTERNS.length;

// Подсчёт оставшихся блоков
export const getRemainingBlocks = (blocks) => {
  return blocks.filter(block => !block.destroyed).length;
};
