/**
 * Парсер JSON описания BPMN диаграммы в структуру для React Flow
 */

/**
 * Преобразует JSON описание в nodes и edges для React Flow
 * @param {Object} description - JSON описание диаграммы
 * @returns {Object} { nodes, edges }
 */
export function parseBpmnDescription(description) {
  const { lanes = [], elements = [], flows = [] } = description;
  
  // Создаем узлы из элементов
  const nodes = elements.map((element, index) => {
    const node = {
      id: element.id,
      type: getNodeType(element.type),
      data: {
        label: element.label || '',
        elementType: element.type,
        lane: element.lane || lanes[0] || '',
      },
      position: { x: 0, y: 0 }, // Будет вычислено алгоритмом компоновки
    };
    
    return node;
  });
  
  // Создаем рёбра из потоков
  const edges = flows.map((flow, index) => {
    const isReturn = flow.loop || flow.return;
    
    const edge = {
      id: `edge-${index}`,
      source: flow.from,
      target: flow.to,
      type: isReturn ? 'default' : (flow.type || 'smoothstep'),
      label: flow.label || '',
      animated: flow.animated || false,
      style: {
        stroke: '#333',
        strokeWidth: 2,
        ...flow.style,
      },
      markerEnd: {
        type: 'arrowclosed',
        color: '#333',
      },
    };
    
    // Для возвратных стрелок используем изогнутый путь
    if (isReturn) {
      edge.type = 'default';
      edge.style = {
        ...edge.style,
        strokeDasharray: '5,5',
      };
      // Добавляем путь для возвратной стрелки
      edge.pathOptions = {
        offset: 50, // Смещение для изогнутого пути
      };
    }
    
    return edge;
  });
  
  return { nodes, edges, lanes };
}

/**
 * Преобразует тип элемента BPMN в тип узла React Flow
 */
function getNodeType(bpmnType) {
  const typeMap = {
    startEvent: 'bpmnStart',
    endEvent: 'bpmnEnd',
    task: 'bpmnTask',
    subProcess: 'bpmnSubProcess',
    xorGateway: 'bpmnGateway',
    andGateway: 'bpmnGateway',
    orGateway: 'bpmnGateway',
  };
  
  return typeMap[bpmnType] || 'bpmnTask';
}

/**
 * Создает пример диаграммы согласования договора (хардкод для MVP)
 */
export function createContractApprovalExample() {
  return {
    lanes: ['Автор', 'Система', 'Согласующий'],
    elements: [
      { id: 'start', type: 'startEvent', label: 'Начало', lane: 'Автор' },
      { id: 't1', type: 'task', label: 'Создать договор', lane: 'Автор' },
      { id: 'g1', type: 'xorGateway', label: 'Изменить?', lane: 'Автор' },
      { id: 't2', type: 'task', label: 'Редактировать', lane: 'Автор' },
      { id: 't3', type: 'task', label: 'Отправить на согласование', lane: 'Автор' },
      { id: 't4', type: 'task', label: 'Проверить валидность', lane: 'Система' },
      { id: 'g2', type: 'xorGateway', label: 'Валиден?', lane: 'Система' },
      { id: 't5', type: 'task', label: 'Вернуть на доработку', lane: 'Система' },
      { id: 't6', type: 'task', label: 'Отправить согласующему', lane: 'Система' },
      { id: 't7', type: 'task', label: 'Рассмотреть договор', lane: 'Согласующий' },
      { id: 'g3', type: 'xorGateway', label: 'Одобрить?', lane: 'Согласующий' },
      { id: 't8', type: 'task', label: 'Отклонить', lane: 'Согласующий' },
      { id: 't9', type: 'task', label: 'Одобрить', lane: 'Согласующий' },
      { id: 't10', type: 'task', label: 'Подписать', lane: 'Согласующий' },
      { id: 'end', type: 'endEvent', label: 'Конец', lane: 'Согласующий' },
    ],
    flows: [
      { from: 'start', to: 't1' },
      { from: 't1', to: 'g1' },
      { from: 'g1', to: 't2', label: 'Да', return: true },
      { from: 'g1', to: 't3', label: 'Нет' },
      { from: 't2', to: 't1', return: true },
      { from: 't3', to: 't4' },
      { from: 't4', to: 'g2' },
      { from: 'g2', to: 't5', label: 'Нет' },
      { from: 'g2', to: 't6', label: 'Да' },
      { from: 't5', to: 't1', return: true },
      { from: 't6', to: 't7' },
      { from: 't7', to: 'g3' },
      { from: 'g3', to: 't8', label: 'Нет' },
      { from: 'g3', to: 't9', label: 'Да' },
      { from: 't8', to: 't1', return: true },
      { from: 't9', to: 't10' },
      { from: 't10', to: 'end' },
    ],
  };
}
