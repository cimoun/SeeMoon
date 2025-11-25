/**
 * Алгоритм компоновки BPMN диаграммы с поддержкой swimlanes
 */

import dagre from 'dagre';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 80;
const LANE_HEIGHT = 200;
const HORIZONTAL_SPACING = 250;
const VERTICAL_SPACING = 100;

/**
 * Вычисляет позиции узлов с учетом swimlanes
 * @param {Array} nodes - Узлы React Flow
 * @param {Array} edges - Рёбра React Flow
 * @param {Array} lanes - Массив названий дорожек
 * @returns {Array} Узлы с обновленными позициями
 */
export function calculateLayout(nodes, edges, lanes = []) {
  // Создаем граф dagre
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: 'LR', // Слева направо
    nodesep: HORIZONTAL_SPACING,
    ranksep: VERTICAL_SPACING,
    edgesep: 50,
  });

  // Добавляем узлы в граф
  nodes.forEach((node) => {
    graph.setNode(node.id, {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    });
  });

  // Добавляем рёбра в граф
  edges.forEach((edge) => {
    if (edge.source && edge.target) {
      graph.setEdge(edge.source, edge.target);
    }
  });

  // Вычисляем компоновку
  dagre.layout(graph);

  // Обновляем позиции узлов
  const positionedNodes = nodes.map((node) => {
    const nodeWithPosition = graph.node(node.id);
    if (nodeWithPosition) {
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - NODE_WIDTH / 2,
          y: nodeWithPosition.y - NODE_HEIGHT / 2,
        },
      };
    }
    return node;
  });

  // Применяем вертикальное смещение для swimlanes
  return applySwimlanes(positionedNodes, lanes);
}

/**
 * Применяет вертикальное смещение для группировки по swimlanes
 */
function applySwimlanes(nodes, lanes) {
  if (!lanes || lanes.length === 0) {
    return nodes;
  }

  // Группируем узлы по дорожкам
  const nodesByLane = {};
  lanes.forEach((lane) => {
    nodesByLane[lane] = [];
  });

  nodes.forEach((node) => {
    const lane = node.data?.lane || lanes[0];
    if (!nodesByLane[lane]) {
      nodesByLane[lane] = [];
    }
    nodesByLane[lane].push(node);
  });

  // Вычисляем базовые Y позиции для каждой дорожки
  const laneBaseY = {};
  lanes.forEach((lane, index) => {
    laneBaseY[lane] = index * LANE_HEIGHT + 50;
  });

  // Находим минимальный Y среди всех узлов
  let minY = Infinity;
  nodes.forEach((node) => {
    if (node.position.y < minY) {
      minY = node.position.y;
    }
  });

  // Применяем смещение для каждой дорожки
  const adjustedNodes = nodes.map((node) => {
    const lane = node.data?.lane || lanes[0];
    const baseY = laneBaseY[lane];
    
    // Находим минимальный Y в этой дорожке
    const laneNodes = nodesByLane[lane];
    let laneMinY = Infinity;
    laneNodes.forEach((n) => {
      if (n.position.y < laneMinY) {
        laneMinY = n.position.y;
      }
    });

    // Вычисляем смещение
    const offsetY = baseY - (laneMinY - minY);
    
    return {
      ...node,
      position: {
        x: node.position.x,
        y: node.position.y + offsetY,
      },
    };
  });

  return adjustedNodes;
}

/**
 * Вычисляет размеры canvas на основе позиций узлов
 */
export function calculateCanvasSize(nodes) {
  if (!nodes || nodes.length === 0) {
    return { width: 1200, height: 800 };
  }

  let maxX = 0;
  let maxY = 0;
  let minX = Infinity;
  let minY = Infinity;

  nodes.forEach((node) => {
    const x = node.position.x;
    const y = node.position.y;
    
    if (x + NODE_WIDTH > maxX) maxX = x + NODE_WIDTH;
    if (y + NODE_HEIGHT > maxY) maxY = y + NODE_HEIGHT;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
  });

  return {
    width: Math.max(maxX - minX + 200, 1200),
    height: Math.max(maxY - minY + 200, 800),
  };
}
