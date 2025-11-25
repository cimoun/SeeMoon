/**
 * Генератор BPMN 2.0 XML из структурированного описания
 */

/**
 * Генерирует BPMN XML из структуры процесса
 * @param {Object} processData - Структура процесса
 * @param {string[]} processData.lanes - Массив названий дорожек (swimlanes)
 * @param {Array} processData.elements - Массив элементов процесса
 * @param {Array} processData.flows - Массив связей между элементами
 * @returns {string} BPMN 2.0 XML
 */
export function generateBPMNXML(processData) {
  const { lanes = [], elements = [], flows = [] } = processData;
  
  if (elements.length === 0) {
    return generateEmptyBPMN();
  }

  // Генерируем XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"
                   xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                   xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                   xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   id="Definitions_1"
                   targetNamespace="http://bpmn.io/schema/bpmn"
                   exporter="BPMN Generator"
                   exporterVersion="1.0.0">
  <bpmn2:process id="Process_1" isExecutable="false">
`;

  // Добавляем laneSet для swimlanes
  if (lanes.length > 0) {
    xml += `    <bpmn2:laneSet id="LaneSet_1">\n`;
    lanes.forEach((lane, idx) => {
      const laneId = `Lane_${idx + 1}`;
      xml += `      <bpmn2:lane id="${laneId}" name="${escapeXML(lane)}">\n`;
      
      // Добавляем элементы в дорожку
      const laneElements = elements.filter((el) => el.lane === lane);
      laneElements.forEach((el) => {
        xml += `        <bpmn2:flowNodeRef>${el.id}</bpmn2:flowNodeRef>\n`;
      });
      
      xml += `      </bpmn2:lane>\n`;
    });
    xml += `    </bpmn2:laneSet>\n`;
  }

  // Добавляем элементы процесса
  elements.forEach((el) => {
    xml += generateElementXML(el);
  });

  // Добавляем связи
  flows.forEach((flow) => {
    xml += generateFlowXML(flow);
  });

  xml += `  </bpmn2:process>
`;

  // Добавляем диаграмму (позиционирование)
  xml += `  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
`;

  // Позиционирование дорожек (swimlanes)
  const positions = calculatePositions(elements, flows, lanes);
  const laneHeight = 200;
  const startY = 100;
  
  if (lanes.length > 0) {
    lanes.forEach((lane, idx) => {
      const y = startY + idx * laneHeight;
      const laneId = `Lane_${idx + 1}`;
      xml += `      <bpmndi:BPMNShape id="${laneId}_di" bpmnElement="${laneId}" isHorizontal="true">
        <dc:Bounds x="100" y="${y}" width="1400" height="${laneHeight - 20}" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="120" y="${y + 10}" width="100" height="20" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
`;
    });
  }

  // Позиционирование элементов
  elements.forEach((el) => {
    const pos = positions[el.id];
    if (pos) {
      xml += generateElementShapeXML(el, pos);
    }
  });

  // Позиционирование связей
  flows.forEach((flow) => {
    const waypoints = calculateWaypoints(flow, positions, elements);
    xml += generateFlowEdgeXML(flow, waypoints);
  });

  xml += `    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`;

  return xml;
}

/**
 * Генерирует пустой BPMN XML
 */
function generateEmptyBPMN() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"
                   xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                   xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                   xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                   id="Definitions_1"
                   targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn2:process id="Process_1" isExecutable="false" />
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1" />
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`;
}

/**
 * Генерирует XML для элемента процесса
 */
function generateElementXML(element) {
  const { type, label, id } = element;
  const escapedLabel = escapeXML(label || '');

  switch (type) {
    case 'startEvent':
      return `    <bpmn2:startEvent id="${id}" name="${escapedLabel}" />\n`;
    case 'endEvent':
      return `    <bpmn2:endEvent id="${id}" name="${escapedLabel}" />\n`;
    case 'task':
      return `    <bpmn2:task id="${id}" name="${escapedLabel}" />\n`;
    case 'userTask':
      return `    <bpmn2:userTask id="${id}" name="${escapedLabel}" />\n`;
    case 'serviceTask':
      return `    <bpmn2:serviceTask id="${id}" name="${escapedLabel}" />\n`;
    case 'subProcess':
      return `    <bpmn2:subProcess id="${id}" name="${escapedLabel}" />\n`;
    case 'xorGateway':
      return `    <bpmn2:exclusiveGateway id="${id}" name="${escapedLabel}" />\n`;
    case 'andGateway':
      return `    <bpmn2:parallelGateway id="${id}" name="${escapedLabel}" />\n`;
    default:
      return `    <bpmn2:task id="${id}" name="${escapedLabel}" />\n`;
  }
}

/**
 * Генерирует XML для связи
 */
function generateFlowXML(flow) {
  const { from, to, label, condition } = flow;
  const escapedLabel = escapeXML(label || '');
  const flowId = `Flow_${from}_${to}`;
  
  let xml = `    <bpmn2:sequenceFlow id="${flowId}" sourceRef="${from}" targetRef="${to}"`;
  
  if (label) {
    xml += ` name="${escapedLabel}"`;
  }
  
  xml += `>\n`;
  
  if (condition) {
    xml += `      <bpmn2:conditionExpression xsi:type="bpmn2:tFormalExpression">${escapeXML(condition)}</bpmn2:conditionExpression>\n`;
  }
  
  xml += `    </bpmn2:sequenceFlow>\n`;
  
  return xml;
}

/**
 * Генерирует XML для формы элемента
 */
function generateElementShapeXML(element, position) {
  const { type, id, label } = element;
  const { x, y, width, height } = position;

  const shapeTypes = {
    startEvent: { width: 36, height: 36 },
    endEvent: { width: 36, height: 36 },
    task: { width: 100, height: 80 },
    userTask: { width: 100, height: 80 },
    serviceTask: { width: 100, height: 80 },
    subProcess: { width: 150, height: 100 },
    xorGateway: { width: 50, height: 50 },
    andGateway: { width: 50, height: 50 },
  };

  const dims = shapeTypes[type] || { width: 100, height: 80 };
  const finalWidth = width || dims.width;
  const finalHeight = height || dims.height;

  // Для шлюзов используем ромб
  const isGateway = type === 'xorGateway' || type === 'andGateway';
  const shapeType = isGateway ? 'bpmndi:BPMNShape' : 'bpmndi:BPMNShape';

  return `      <bpmndi:BPMNShape id="${id}_di" bpmnElement="${id}">
        <dc:Bounds x="${x}" y="${y}" width="${finalWidth}" height="${finalHeight}" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="${x - 20}" y="${y + finalHeight + 5}" width="${finalWidth + 40}" height="20" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
`;
}

/**
 * Генерирует XML для ребра связи
 */
function generateFlowEdgeXML(flow, waypoints) {
  const { from, to, label } = flow;
  const flowId = `Flow_${from}_${to}`;

  let xml = `      <bpmndi:BPMNEdge id="${flowId}_di" bpmnElement="${flowId}">\n`;
  
  waypoints.forEach((wp) => {
    xml += `        <di:waypoint x="${wp.x}" y="${wp.y}" />\n`;
  });

  if (label) {
    const midPoint = waypoints[Math.floor(waypoints.length / 2)];
    xml += `        <bpmndi:BPMNLabel>
          <dc:Bounds x="${midPoint.x}" y="${midPoint.y - 10}" width="50" height="20" />
        </bpmndi:BPMNLabel>
`;
  }

  xml += `      </bpmndi:BPMNEdge>
`;

  return xml;
}

/**
 * Вычисляет позиции элементов с учетом swimlanes и минимизации пересечений
 */
function calculatePositions(elements, flows, lanes) {
  const positions = {};
  
  if (elements.length === 0) return positions;

  // Создаем карту элементов по дорожкам
  const laneMap = new Map();
  lanes.forEach((lane, idx) => {
    laneMap.set(lane, idx);
  });

  // Строим граф для определения порядка элементов
  const graph = buildGraph(elements, flows);
  const order = topologicalSort(graph, elements);

  // Позиционируем элементы
  const laneHeight = 200;
  const startX = 250;
  const startY = 150;
  const xStep = 300;

  const laneYPositions = {};
  lanes.forEach((lane, idx) => {
    laneYPositions[lane] = startY + idx * laneHeight;
  });

  // Группируем элементы по глубине в графе
  const depthMap = new Map();
  const maxDepth = calculateMaxDepth(graph, elements);
  
  elements.forEach((el) => {
    const depth = calculateDepth(graph, el.id);
    if (!depthMap.has(depth)) {
      depthMap.set(depth, []);
    }
    depthMap.get(depth).push(el);
  });

  // Позиционируем элементы по глубине и дорожкам
  depthMap.forEach((elementsAtDepth, depth) => {
    const x = startX + depth * xStep;
    
    // Группируем по дорожкам
    const byLane = new Map();
    elementsAtDepth.forEach((el) => {
      const lane = el.lane || lanes[0] || '';
      if (!byLane.has(lane)) {
        byLane.set(lane, []);
      }
      byLane.get(lane).push(el);
    });

    // Позиционируем элементы в каждой дорожке
    byLane.forEach((laneElements, lane) => {
      const laneY = laneYPositions[lane] || startY;
      const centerY = laneY + laneHeight / 2;
      
      // Если элементов несколько, распределяем их вертикально
      if (laneElements.length === 1) {
        positions[laneElements[0].id] = { x, y: centerY - 40 };
      } else {
        const spacing = Math.min(120, (laneHeight - 100) / laneElements.length);
        const startOffset = -(laneElements.length - 1) * spacing / 2;
        
        laneElements.forEach((el, idx) => {
          const y = centerY + startOffset + idx * spacing - 40;
          positions[el.id] = { x, y };
        });
      }
    });
  });

  return positions;
}

/**
 * Строит граф из элементов и связей
 */
function buildGraph(elements, flows) {
  const graph = new Map();
  
  elements.forEach((el) => {
    graph.set(el.id, { element: el, incoming: [], outgoing: [] });
  });

  flows.forEach((flow) => {
    const from = graph.get(flow.from);
    const to = graph.get(flow.to);
    
    if (from && to) {
      from.outgoing.push(flow.to);
      to.incoming.push(flow.from);
    }
  });

  return graph;
}

/**
 * Топологическая сортировка для определения порядка элементов
 */
function topologicalSort(graph, elements) {
  const visited = new Set();
  const result = [];
  const startElements = elements.filter((el) => {
    const node = graph.get(el.id);
    return node && node.incoming.length === 0;
  });

  function visit(nodeId) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = graph.get(nodeId);
    if (node) {
      node.outgoing.forEach((nextId) => visit(nextId));
      result.push(nodeId);
    }
  }

  startElements.forEach((el) => visit(el.id));
  
  // Добавляем оставшиеся элементы
  elements.forEach((el) => {
    if (!visited.has(el.id)) {
      result.push(el.id);
    }
  });

  return result;
}

/**
 * Вычисляет максимальную глубину графа
 */
function calculateMaxDepth(graph, elements) {
  const depths = new Map();
  
  function getDepth(nodeId) {
    if (depths.has(nodeId)) {
      return depths.get(nodeId);
    }

    const node = graph.get(nodeId);
    if (!node || node.incoming.length === 0) {
      depths.set(nodeId, 0);
      return 0;
    }

    const maxIncomingDepth = Math.max(
      ...node.incoming.map((incomingId) => getDepth(incomingId))
    );
    const depth = maxIncomingDepth + 1;
    depths.set(nodeId, depth);
    return depth;
  }

  elements.forEach((el) => getDepth(el.id));
  return Math.max(...Array.from(depths.values()), 0);
}

/**
 * Вычисляет глубину конкретного узла
 */
function calculateDepth(graph, nodeId) {
  const node = graph.get(nodeId);
  if (!node || node.incoming.length === 0) {
    return 0;
  }

  return Math.max(
    ...node.incoming.map((incomingId) => calculateDepth(graph, incomingId))
  ) + 1;
}

/**
 * Вычисляет waypoints для связи с учетом возвратных стрелок
 */
function calculateWaypoints(flow, positions, elements) {
  const fromPos = positions[flow.from];
  const toPos = positions[flow.to];
  
  if (!fromPos || !toPos) {
    return [{ x: 0, y: 0 }, { x: 100, y: 100 }];
  }

  const fromElement = elements.find((e) => e.id === flow.from);
  const toElement = elements.find((e) => e.id === flow.to);

  // Определяем размеры элементов
  const getElementSize = (type) => {
    const sizes = {
      startEvent: { width: 36, height: 36 },
      endEvent: { width: 36, height: 36 },
      task: { width: 100, height: 80 },
      userTask: { width: 100, height: 80 },
      serviceTask: { width: 100, height: 80 },
      subProcess: { width: 150, height: 100 },
      xorGateway: { width: 50, height: 50 },
      andGateway: { width: 50, height: 50 },
    };
    return sizes[type] || { width: 100, height: 80 };
  };

  const fromSize = getElementSize(fromElement?.type);
  const toSize = getElementSize(toElement?.type);

  // Точки выхода и входа
  const fromX = fromPos.x + fromSize.width;
  const fromY = fromPos.y + fromSize.height / 2;
  const toX = toPos.x;
  const toY = toPos.y + toSize.height / 2;

  // Если это возвратная стрелка (toX < fromX), делаем изогнутую
  if (toX < fromX) {
    const offsetX = 50;
    const offsetY = Math.abs(fromY - toY) + 100; // Высота дуги
    
    return [
      { x: fromX, y: fromY },
      { x: fromX + offsetX, y: fromY },
      { x: fromX + offsetX, y: fromY + offsetY },
      { x: toX - offsetX, y: toY + offsetY },
      { x: toX - offsetX, y: toY },
      { x: toX, y: toY },
    ];
  }

  // Обычная горизонтальная связь
  const midX = (fromX + toX) / 2;
  return [
    { x: fromX, y: fromY },
    { x: midX, y: fromY },
    { x: midX, y: toY },
    { x: toX, y: toY },
  ];
}

/**
 * Экранирует XML специальные символы
 */
function escapeXML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Пример данных для диаграммы согласования договора
 */
export const exampleProcessData = {
  lanes: ['Автор', 'Система', 'Согласующий'],
  elements: [
    { id: 'start', type: 'startEvent', label: 'Начало', lane: 'Автор' },
    { id: 't1', type: 'userTask', label: 'Создать договор', lane: 'Автор' },
    { id: 'g1', type: 'xorGateway', label: 'Изменить?', lane: 'Автор' },
    { id: 't2', type: 'userTask', label: 'Изменить договор', lane: 'Автор' },
    { id: 't3', type: 'serviceTask', label: 'Отправить на согласование', lane: 'Система' },
    { id: 't4', type: 'userTask', label: 'Проверить договор', lane: 'Согласующий' },
    { id: 'g2', type: 'xorGateway', label: 'Одобрен?', lane: 'Согласующий' },
    { id: 't5', type: 'serviceTask', label: 'Уведомить об одобрении', lane: 'Система' },
    { id: 't6', type: 'userTask', label: 'Исправить замечания', lane: 'Автор' },
    { id: 'end', type: 'endEvent', label: 'Конец', lane: 'Автор' },
  ],
  flows: [
    { from: 'start', to: 't1' },
    { from: 't1', to: 'g1' },
    { from: 'g1', to: 't2', label: 'Да' },
    { from: 'g1', to: 't3', label: 'Нет' },
    { from: 't2', to: 't1' }, // Возвратная стрелка
    { from: 't3', to: 't4' },
    { from: 't4', to: 'g2' },
    { from: 'g2', to: 't5', label: 'Да' },
    { from: 'g2', to: 't6', label: 'Нет' },
    { from: 't5', to: 'end' },
    { from: 't6', to: 't1' }, // Возвратная стрелка
  ],
};
