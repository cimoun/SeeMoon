/**
 * BPMN Layout Engine
 * Автоматически рассчитывает позиции элементов на диаграмме
 */

// Константы размеров
export const LAYOUT = {
  LANE_HEADER_WIDTH: 120,
  LANE_MIN_HEIGHT: 140,
  LANE_PADDING: 40,
  
  ELEMENT_WIDTH: 140,
  ELEMENT_HEIGHT: 60,
  ELEMENT_SPACING_X: 60,
  ELEMENT_SPACING_Y: 30,
  
  EVENT_SIZE: 40,
  GATEWAY_SIZE: 50,
  
  CANVAS_PADDING: 40,
}

/**
 * Построение графа зависимостей
 */
function buildGraph(elements, flows) {
  const graph = new Map()
  const reverseGraph = new Map()
  
  elements.forEach(el => {
    graph.set(el.id, [])
    reverseGraph.set(el.id, [])
  })
  
  flows.forEach(flow => {
    if (flow.type !== 'return') {
      graph.get(flow.from)?.push(flow.to)
      reverseGraph.get(flow.to)?.push(flow.from)
    }
  })
  
  return { graph, reverseGraph }
}

/**
 * Топологическая сортировка для определения порядка колонок
 */
function topologicalSort(elements, graph, reverseGraph) {
  const visited = new Set()
  const levels = new Map()
  
  // Находим стартовые элементы (без входящих связей)
  const startElements = elements.filter(el => 
    reverseGraph.get(el.id)?.length === 0
  )
  
  // BFS для назначения уровней
  const queue = startElements.map(el => ({ id: el.id, level: 0 }))
  
  while (queue.length > 0) {
    const { id, level } = queue.shift()
    
    if (visited.has(id)) {
      // Обновляем уровень если новый путь длиннее
      levels.set(id, Math.max(levels.get(id) || 0, level))
      continue
    }
    
    visited.add(id)
    levels.set(id, level)
    
    const nextElements = graph.get(id) || []
    nextElements.forEach(nextId => {
      queue.push({ id: nextId, level: level + 1 })
    })
  }
  
  // Обрабатываем элементы без связей
  elements.forEach(el => {
    if (!levels.has(el.id)) {
      levels.set(el.id, 0)
    }
  })
  
  return levels
}

/**
 * Группировка элементов по колонкам
 */
function groupByColumns(elements, levels) {
  const columns = new Map()
  
  elements.forEach(el => {
    const level = levels.get(el.id)
    if (!columns.has(level)) {
      columns.set(level, [])
    }
    columns.get(level).push(el)
  })
  
  return columns
}

/**
 * Оптимизация позиций элементов в колонке для минимизации пересечений
 */
function optimizeColumnOrder(columns, lanes, _flows) {
  const laneOrder = new Map()
  lanes.forEach((lane, index) => {
    laneOrder.set(lane.id, index)
  })
  
  // Сортируем элементы в каждой колонке по порядку дорожек
  columns.forEach((elements) => {
    elements.sort((a, b) => {
      const laneA = laneOrder.get(a.lane) ?? 0
      const laneB = laneOrder.get(b.lane) ?? 0
      return laneA - laneB
    })
  })
  
  return columns
}

/**
 * Расчёт высоты каждой дорожки
 */
function calculateLaneHeights(lanes, elements, columns) {
  const laneElementCounts = new Map()
  const laneMaxPerColumn = new Map()
  
  lanes.forEach(lane => {
    laneElementCounts.set(lane.id, 0)
    laneMaxPerColumn.set(lane.id, new Map())
  })
  
  // Подсчитываем максимальное количество элементов в каждой колонке для каждой дорожки
  columns.forEach((colElements, colIndex) => {
    const laneCount = new Map()
    colElements.forEach(el => {
      const count = (laneCount.get(el.lane) || 0) + 1
      laneCount.set(el.lane, count)
    })
    
    laneCount.forEach((count, laneId) => {
      const maxPerCol = laneMaxPerColumn.get(laneId)
      if (maxPerCol) {
        maxPerCol.set(colIndex, count)
        laneElementCounts.set(laneId, Math.max(laneElementCounts.get(laneId), count))
      }
    })
  })
  
  // Рассчитываем высоту каждой дорожки
  const heights = new Map()
  lanes.forEach(lane => {
    const maxElements = laneElementCounts.get(lane.id) || 1
    heights.set(lane.id, Math.max(
      LAYOUT.LANE_MIN_HEIGHT,
      maxElements * (LAYOUT.ELEMENT_HEIGHT + LAYOUT.ELEMENT_SPACING_Y) + LAYOUT.LANE_PADDING * 2
    ))
  })
  
  return heights
}

/**
 * Расчёт Y-позиций дорожек
 */
function calculateLanePositions(lanes, heights) {
  const positions = new Map()
  let currentY = LAYOUT.CANVAS_PADDING
  
  lanes.forEach(lane => {
    positions.set(lane.id, {
      y: currentY,
      height: heights.get(lane.id)
    })
    currentY += heights.get(lane.id)
  })
  
  return positions
}

/**
 * Расчёт позиций элементов
 */
function calculateElementPositions(elements, columns, lanes, lanePositions) {
  const positions = new Map()
  const laneElementsInColumn = new Map()
  
  // Инициализация счётчиков
  lanes.forEach(lane => {
    laneElementsInColumn.set(lane.id, new Map())
  })
  
  // Сортируем колонки по номеру
  const sortedColumns = [...columns.entries()].sort((a, b) => a[0] - b[0])
  
  sortedColumns.forEach(([colIndex, colElements]) => {
    // Группируем элементы колонки по дорожкам
    const elementsByLane = new Map()
    colElements.forEach(el => {
      if (!elementsByLane.has(el.lane)) {
        elementsByLane.set(el.lane, [])
      }
      elementsByLane.get(el.lane).push(el)
    })
    
    // Рассчитываем позиции для каждого элемента
    elementsByLane.forEach((laneElements, laneId) => {
      const lanePos = lanePositions.get(laneId)
      if (!lanePos) return
      
      const laneHeight = lanePos.height
      const laneCenterY = lanePos.y + laneHeight / 2
      
      // Распределяем элементы вертикально в пределах дорожки
      const totalElementsHeight = laneElements.length * LAYOUT.ELEMENT_HEIGHT + 
        (laneElements.length - 1) * LAYOUT.ELEMENT_SPACING_Y
      const startY = laneCenterY - totalElementsHeight / 2
      
      laneElements.forEach((el, index) => {
        const x = LAYOUT.CANVAS_PADDING + LAYOUT.LANE_HEADER_WIDTH + 
          colIndex * (LAYOUT.ELEMENT_WIDTH + LAYOUT.ELEMENT_SPACING_X) + 
          LAYOUT.ELEMENT_SPACING_X
        
        const y = startY + index * (LAYOUT.ELEMENT_HEIGHT + LAYOUT.ELEMENT_SPACING_Y)
        
        positions.set(el.id, {
          x,
          y,
          width: getElementWidth(el),
          height: getElementHeight(el),
          centerX: x + getElementWidth(el) / 2,
          centerY: y + getElementHeight(el) / 2
        })
      })
    })
  })
  
  return positions
}

/**
 * Получение ширины элемента по типу
 */
function getElementWidth(element) {
  switch (element.type) {
    case 'startEvent':
    case 'endEvent':
    case 'intermediateEvent':
      return LAYOUT.EVENT_SIZE
    case 'xorGateway':
    case 'parallelGateway':
    case 'inclusiveGateway':
      return LAYOUT.GATEWAY_SIZE
    default:
      return LAYOUT.ELEMENT_WIDTH
  }
}

/**
 * Получение высоты элемента по типу
 */
function getElementHeight(element) {
  switch (element.type) {
    case 'startEvent':
    case 'endEvent':
    case 'intermediateEvent':
      return LAYOUT.EVENT_SIZE
    case 'xorGateway':
    case 'parallelGateway':
    case 'inclusiveGateway':
      return LAYOUT.GATEWAY_SIZE
    default:
      return LAYOUT.ELEMENT_HEIGHT
  }
}

/**
 * Расчёт путей для соединительных линий
 */
function calculateFlowPaths(flows, positions) {
  return flows.map(flow => {
    const fromPos = positions.get(flow.from)
    const toPos = positions.get(flow.to)
    
    if (!fromPos || !toPos) {
      return { ...flow, path: null }
    }
    
    const isReturn = flow.type === 'return'
    const path = calculatePath(fromPos, toPos, isReturn)
    
    return {
      ...flow,
      path,
      fromPos,
      toPos
    }
  })
}

/**
 * Расчёт пути между двумя элементами
 */
function calculatePath(from, to, isReturn) {
  const fromX = from.centerX + from.width / 2
  const fromY = from.centerY
  const toX = to.centerX - to.width / 2
  const toY = to.centerY
  
  if (isReturn) {
    // Возвратная стрелка - идёт вверх и влево (не снизу!)
    // Для лучшей читаемости используем верхний обход
    const topY = Math.min(from.centerY, to.centerY) - 50
    
    // Если элемент справа от целевого, делаем обход сверху
    if (from.centerX > to.centerX) {
      return {
        type: 'return',
        points: [
          { x: from.centerX, y: from.centerY - from.height / 2 },
          { x: from.centerX, y: topY },
          { x: to.centerX, y: topY },
          { x: to.centerX, y: to.centerY - to.height / 2 }
        ]
      }
    }
    
    // Иначе - снизу
    const bottomY = Math.max(from.centerY, to.centerY) + 50
    return {
      type: 'return',
      points: [
        { x: from.centerX, y: from.centerY + from.height / 2 },
        { x: from.centerX, y: bottomY },
        { x: to.centerX, y: bottomY },
        { x: to.centerX, y: to.centerY + to.height / 2 }
      ]
    }
  }
  
  // Прямой слева направо поток
  const goingForward = to.centerX > from.centerX
  
  // Обычная связь - горизонтальная линия если на одном уровне
  if (Math.abs(fromY - toY) < 15 && goingForward) {
    return {
      type: 'straight',
      points: [
        { x: fromX, y: fromY },
        { x: toX, y: toY }
      ]
    }
  }
  
  // Ортогональная линия с изгибом
  if (goingForward) {
    const midX = (fromX + toX) / 2
    
    return {
      type: 'orthogonal',
      points: [
        { x: fromX, y: fromY },
        { x: midX, y: fromY },
        { x: midX, y: toY },
        { x: toX, y: toY }
      ]
    }
  }
  
  // Обратный поток (справа налево) - но не возвратная стрелка
  const offsetY = 40
  const goUp = fromY > toY
  
  return {
    type: 'orthogonal',
    points: [
      { x: fromX, y: fromY },
      { x: fromX + 20, y: fromY },
      { x: fromX + 20, y: goUp ? fromY - offsetY : fromY + offsetY },
      { x: toX - 20, y: goUp ? toY + offsetY : toY - offsetY },
      { x: toX - 20, y: toY },
      { x: toX, y: toY }
    ]
  }
}

/**
 * Главная функция расчёта лейаута
 */
export function calculateLayout(data) {
  const { lanes, elements, flows } = data
  
  if (!elements || elements.length === 0) {
    return {
      lanes: [],
      elements: [],
      flows: [],
      dimensions: { width: 0, height: 0 }
    }
  }
  
  // 1. Строим граф
  const { graph, reverseGraph } = buildGraph(elements, flows)
  
  // 2. Топологическая сортировка
  const levels = topologicalSort(elements, graph, reverseGraph)
  
  // 3. Группируем по колонкам
  let columns = groupByColumns(elements, levels)
  
  // 4. Оптимизируем порядок
  columns = optimizeColumnOrder(columns, lanes, flows)
  
  // 5. Рассчитываем высоты дорожек
  const laneHeights = calculateLaneHeights(lanes, elements, columns)
  
  // 6. Рассчитываем позиции дорожек
  const lanePositions = calculateLanePositions(lanes, laneHeights)
  
  // 7. Рассчитываем позиции элементов
  const elementPositions = calculateElementPositions(elements, columns, lanes, lanePositions)
  
  // 8. Рассчитываем пути связей
  const flowPaths = calculateFlowPaths(flows, elementPositions)
  
  // 9. Рассчитываем общие размеры
  const maxColumn = Math.max(...columns.keys())
  const totalWidth = LAYOUT.CANVAS_PADDING * 2 + LAYOUT.LANE_HEADER_WIDTH +
    (maxColumn + 1) * (LAYOUT.ELEMENT_WIDTH + LAYOUT.ELEMENT_SPACING_X) + LAYOUT.ELEMENT_SPACING_X
  
  let totalHeight = LAYOUT.CANVAS_PADDING * 2
  laneHeights.forEach(height => {
    totalHeight += height
  })
  
  return {
    lanes: lanes.map(lane => ({
      ...lane,
      position: lanePositions.get(lane.id)
    })),
    elements: elements.map(el => ({
      ...el,
      position: elementPositions.get(el.id)
    })),
    flows: flowPaths,
    dimensions: {
      width: totalWidth,
      height: totalHeight
    }
  }
}
