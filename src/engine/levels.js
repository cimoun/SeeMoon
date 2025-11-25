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

// Паттерны уровней:
// 0 = пусто
// 1 = обычный (NORMAL)
// 2 = усиленный (STRONG)
// 3 = прочный (SUPER)
// 4 = неразрушаемый (INDESTRUCTIBLE)

const LEVEL_PATTERNS = [
  // Уровень 1 - Классический (обучение)
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
  // Уровень 4 - Стены (первые неразрушаемые)
  [
    [4, 1, 1, 1, 1, 1, 1, 1, 1, 4],
    [4, 2, 2, 2, 2, 2, 2, 2, 2, 4],
    [4, 0, 0, 3, 3, 3, 3, 0, 0, 4],
    [4, 0, 0, 2, 2, 2, 2, 0, 0, 4],
    [4, 1, 1, 1, 1, 1, 1, 1, 1, 4]
  ],
  // Уровень 5 - Крепость
  [
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 2, 2, 2, 2, 2, 2, 0, 3],
    [3, 0, 2, 1, 1, 1, 1, 2, 0, 3],
    [3, 0, 2, 1, 1, 1, 1, 2, 0, 3]
  ],
  // Уровень 6 - Лабиринт
  [
    [4, 0, 4, 0, 4, 4, 0, 4, 0, 4],
    [1, 1, 1, 0, 2, 2, 0, 1, 1, 1],
    [4, 0, 1, 1, 1, 1, 1, 1, 0, 4],
    [1, 1, 1, 0, 3, 3, 0, 1, 1, 1],
    [4, 0, 4, 0, 4, 4, 0, 4, 0, 4]
  ],
  // Уровень 7 - Сердце
  [
    [0, 2, 2, 0, 0, 0, 0, 2, 2, 0],
    [2, 3, 3, 2, 0, 0, 2, 3, 3, 2],
    [2, 3, 3, 3, 2, 2, 3, 3, 3, 2],
    [0, 2, 3, 3, 3, 3, 3, 3, 2, 0],
    [0, 0, 2, 3, 3, 3, 3, 2, 0, 0]
  ],
  // Уровень 8 - Туннель
  [
    [4, 4, 0, 0, 0, 0, 0, 0, 4, 4],
    [4, 1, 1, 2, 2, 2, 2, 1, 1, 4],
    [0, 1, 3, 3, 3, 3, 3, 3, 1, 0],
    [4, 1, 1, 2, 2, 2, 2, 1, 1, 4],
    [4, 4, 0, 0, 0, 0, 0, 0, 4, 4]
  ],
  // Уровень 9 - Инвейдер
  [
    [0, 0, 3, 0, 0, 0, 0, 3, 0, 0],
    [0, 0, 0, 3, 0, 0, 3, 0, 0, 0],
    [0, 0, 3, 3, 3, 3, 3, 3, 0, 0],
    [0, 3, 3, 2, 3, 3, 2, 3, 3, 0],
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
  ],
  // Уровень 10 - Финальный босс
  [
    [4, 3, 3, 3, 4, 4, 3, 3, 3, 4],
    [3, 3, 2, 2, 3, 3, 2, 2, 3, 3],
    [4, 2, 2, 2, 2, 2, 2, 2, 2, 4],
    [3, 2, 3, 2, 2, 2, 2, 3, 2, 3],
    [4, 3, 3, 3, 4, 4, 3, 3, 3, 4]
  ]
];

const BLOCK_TYPE_MAP = {
  1: 'NORMAL',
  2: 'STRONG',
  3: 'SUPER',
  4: 'INDESTRUCTIBLE'
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

// Проверка завершения уровня (игнорируем неразрушаемые)
export const isLevelComplete = (blocks) => {
  return blocks
    .filter(block => !block.indestructible)
    .every(block => block.destroyed);
};

// Получить общее количество уровней
export const getTotalLevels = () => LEVEL_PATTERNS.length;

// Подсчёт оставшихся разрушаемых блоков
export const getRemainingBlocks = (blocks) => {
  return blocks.filter(block => !block.destroyed && !block.indestructible).length;
};
