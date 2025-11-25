import { contractApprovalSpec } from '../data/examples';

export const STATUS_TOKENS = {
  draft: { label: 'Черновик', fill: '#e0e7ff', stroke: '#4338ca', text: '#312e81' },
  'in-progress': { label: 'В работе', fill: '#fef9c3', stroke: '#facc15', text: '#713f12' },
  waiting: { label: 'Ожидание', fill: '#ffedd5', stroke: '#fb923c', text: '#7c2d12' },
  review: { label: 'Проверка', fill: '#e0f2fe', stroke: '#0ea5e9', text: '#083344' },
  success: { label: 'Готово', fill: '#dcfce7', stroke: '#16a34a', text: '#14532d' },
  rejected: { label: 'Отклонено', fill: '#fee2e2', stroke: '#ef4444', text: '#7f1d1d' },
  rework: { label: 'Доработка', fill: '#fef3c7', stroke: '#f97316', text: '#7c2d12' },
  system: { label: 'Система', fill: '#ede9fe', stroke: '#8b5cf6', text: '#4c1d95' },
  info: { label: 'Событие', fill: '#f0f9ff', stroke: '#38bdf8', text: '#0f172a' },
  neutral: { label: 'Не указан', fill: '#f4f4f5', stroke: '#a1a1aa', text: '#27272a' }
};

const TYPE_DIMENSIONS = {
  startEvent: { width: 64, height: 64 },
  endEvent: { width: 72, height: 72 },
  intermediateEvent: { width: 64, height: 64 },
  task: { width: 210, height: 92 },
  subProcess: { width: 230, height: 110 },
  xorGateway: { width: 90, height: 90 },
  andGateway: { width: 90, height: 90 }
};

const FLOW_COLORS = {
  default: '#0f172a',
  loop: '#0ea5e9',
  message: '#f97316'
};

export function buildDiagramModel(rawSpec = contractApprovalSpec) {
  const warnings = [];
  if (!rawSpec) {
    return {
      meta: {},
      config: defaultConfig(),
      lanes: [],
      nodes: [],
      flows: [],
      width: 0,
      height: 0,
      warnings: ['Нет данных процесса']
    };
  }

  const spec = safeClone(rawSpec);
  const config = defaultConfig(spec.layout);

  const lanes = normalizeLanes(spec.lanes, warnings, config);
  const laneMap = new Map(lanes.map((lane) => [lane.id, lane]));

  const nodes = normalizeElements(spec.elements, laneMap, warnings);
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  const { flows, layoutFlows } = normalizeFlows(spec.flows, nodeMap, warnings);

  assignColumns(nodes, layoutFlows);

  const width =
    config.laneLabelWidth + config.paddingX * 2 + (maxColumn(nodes) + 1) * config.columnGap;
  const height = config.paddingY * 2 + lanes.length * config.laneHeight;

  applyLaneGeometry(lanes, config, width);
  applyNodeGeometry(nodes, laneMap, config);

  const { hydratedFlows, geometryWarnings } = buildFlowGeometry(flows, nodeMap, config, height);

  return {
    meta: spec.meta ?? {},
    config,
    lanes,
    nodes,
    flows: hydratedFlows,
    width,
    height,
    warnings: [...warnings, ...geometryWarnings]
  };
}

function defaultConfig(overrides) {
  const base = {
    laneHeight: 160,
    columnGap: 220,
    paddingX: 120,
    paddingY: 80,
    laneLabelWidth: 150,
    loopOffset: 80,
    edgeGap: 36
  };
  return { ...base, ...(overrides || {}) };
}

function safeClone(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}

function slugify(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return fallback;
  return trimmed.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || fallback;
}

function normalizeLanes(rawLanes, warnings, config) {
  const lanes = Array.isArray(rawLanes) && rawLanes.length ? rawLanes : ['Lane'];
  const seen = new Set();
  return lanes.map((lane, index) => {
    const laneObject =
      typeof lane === 'string' ? { id: slugify(lane, `lane-${index + 1}`), label: lane } : lane;
    const id = laneObject.id || slugify(laneObject.label, `lane-${index + 1}`) || `lane-${index}`;
    if (seen.has(id)) {
      warnings.push(`Дублирующийся lane id "${id}" заменён на уникальный`);
    }
    seen.add(id);
    return {
      id,
      label: laneObject.label || id,
      accent: laneObject.accent || '#94a3b8',
      index,
      height: config.laneHeight
    };
  });
}

function resolveStatusToken(value) {
  if (typeof value !== 'string') {
    return { token: STATUS_TOKENS.neutral, key: 'neutral' };
  }
  const normalized = value.trim().toLowerCase();
  const token = STATUS_TOKENS[normalized] ?? STATUS_TOKENS.neutral;
  return {
    token,
    key: token === STATUS_TOKENS.neutral ? 'neutral' : normalized
  };
}

function normalizeElements(rawElements, laneMap, warnings) {
  if (!Array.isArray(rawElements) || !rawElements.length) {
    warnings.push('В описании процесса нет элементов');
    return [];
  }
  return rawElements
    .map((element, order) => {
      if (!element || typeof element !== 'object') {
        warnings.push(`Элемент №${order + 1} пропущен: требуется объект`);
        return null;
      }
      if (!element.id) {
        warnings.push(`Элемент "${element.label || order + 1}" не имеет id и будет пропущен`);
        return null;
      }
      const normalizedType = element.type && TYPE_DIMENSIONS[element.type] ? element.type : 'task';
      if (!TYPE_DIMENSIONS[element.type] && element.type) {
        warnings.push(`Тип "${element.type}" не поддерживается, использован прямоугольник задачи`);
      }
      const laneId = laneMap.has(element.lane)
        ? element.lane
        : laneMap.keys().next().value ?? 'lane-1';
      if (!laneMap.has(element.lane)) {
        warnings.push(`Lane "${element.lane}" не найден, элемент ${element.id} перенесён в первый`);
      }
      const dimensions = TYPE_DIMENSIONS[normalizedType];
      const { token: statusToken, key: statusKey } = resolveStatusToken(element.status);
      return {
        ...element,
        type: normalizedType,
        width: dimensions.width,
        height: dimensions.height,
        laneId,
        laneIndex: laneMap.get(laneId)?.index ?? 0,
        statusToken,
        statusKey,
        order
      };
    })
    .filter(Boolean);
}

function normalizeFlows(rawFlows, nodeMap, warnings) {
  const flows = Array.isArray(rawFlows) ? rawFlows : [];
  const hydrated = [];
  const layoutFlows = [];

  flows.forEach((flow, index) => {
    if (!flow || typeof flow !== 'object') {
      warnings.push(`Поток №${index + 1} пропущен: требуется объект`);
      return;
    }
    const fromNode = nodeMap.get(flow.from);
    const toNode = nodeMap.get(flow.to);
    if (!fromNode || !toNode) {
      warnings.push(
        `Поток ${flow.id || index + 1} пропущен: не найдены элементы ${flow.from} -> ${flow.to}`
      );
      return;
    }
    const behavior = flow.behavior === 'loop' ? 'loop' : 'default';
    const type = flow.type === 'message' ? 'message' : 'sequence';
    const normalized = {
      id: flow.id || `flow-${index + 1}`,
      from: flow.from,
      to: flow.to,
      label: flow.label || '',
      behavior,
      type,
      order: index
    };
    hydrated.push(normalized);
    if (behavior !== 'loop') {
      layoutFlows.push(normalized);
    }
  });

  return { flows: hydrated, layoutFlows };
}

function assignColumns(nodes, flows) {
  const indegree = new Map(nodes.map((node) => [node.id, 0]));
  const adjacency = new Map(nodes.map((node) => [node.id, []]));
  const incoming = new Map(nodes.map((node) => [node.id, []]));

  flows.forEach((flow) => {
    indegree.set(flow.to, (indegree.get(flow.to) || 0) + 1);
    adjacency.get(flow.from)?.push(flow.to);
    incoming.get(flow.to)?.push(flow.from);
  });

  const queue = nodes
    .filter((node) => indegree.get(node.id) === 0)
    .sort((a, b) => a.order - b.order)
    .map((node) => node.id);

  const processed = [];
  const mutableIndegree = new Map(indegree);

  while (queue.length) {
    const current = queue.shift();
    processed.push(current);
    adjacency.get(current)?.forEach((next) => {
      const nextValue = (mutableIndegree.get(next) || 0) - 1;
      mutableIndegree.set(next, nextValue);
      if (nextValue === 0) queue.push(next);
    });
  }

  nodes
    .map((node) => node.id)
    .filter((id) => !processed.includes(id))
    .forEach((id) => processed.push(id));

  processed.forEach((id) => {
    const node = nodes.find((item) => item.id === id);
    if (!node) return;
    if (typeof node.column === 'number') return;
    const parents = incoming.get(id) || [];
    if (!parents.length) {
      node.column = 0;
      return;
    }
    const parentColumns = parents
      .map((parentId) => nodes.find((n) => n.id === parentId)?.column)
      .filter((value) => typeof value === 'number');
    node.column = parentColumns.length ? Math.max(...parentColumns) + 1 : 0;
  });

  nodes.forEach((node, index) => {
    if (typeof node.column !== 'number') {
      node.column = index;
    }
  });
}

function maxColumn(nodes) {
  if (!nodes.length) return 0;
  return nodes.reduce((max, node) => Math.max(max, node.column ?? 0), 0);
}

function applyLaneGeometry(lanes, config, width) {
  lanes.forEach((lane) => {
    lane.top = config.paddingY + lane.index * config.laneHeight;
    lane.bottom = lane.top + config.laneHeight;
    lane.centerY = lane.top + config.laneHeight / 2;
    lane.width = width - config.paddingX;
    lane.labelX = config.laneLabelWidth / 2;
  });
}

function applyNodeGeometry(nodes, laneMap, config) {
  const contentOffsetX = config.laneLabelWidth + config.paddingX;
  nodes.forEach((node) => {
    const lane = laneMap.get(node.laneId);
    if (!lane) return;
    node.x = contentOffsetX + (node.column ?? 0) * config.columnGap;
    node.y = lane.centerY;
    node.bounds = {
      left: node.x - node.width / 2,
      right: node.x + node.width / 2,
      top: node.y - node.height / 2,
      bottom: node.y + node.height / 2
    };
  });
}

function buildFlowGeometry(flows, nodeMap, config, diagramHeight) {
  const hydratedFlows = [];
  const warnings = [];
  const minXBoundary = config.paddingX / 2;

  flows.forEach((flow) => {
    const source = nodeMap.get(flow.from);
    const target = nodeMap.get(flow.to);
    if (!source || !target) return;
    const geometry = createFlowPath(source, target, flow, config, minXBoundary, diagramHeight);
    if (!geometry) {
      warnings.push(`Не удалось построить маршрут для связи ${flow.id}`);
    } else {
      hydratedFlows.push({ ...flow, ...geometry });
    }
  });

  return { hydratedFlows, geometryWarnings: warnings };
}

function createFlowPath(source, target, flow, config, minXBoundary, diagramHeight) {
  const sameLane = source.laneId === target.laneId;
  const forward = (target.column ?? 0) >= (source.column ?? 0);
  const loop = flow.behavior === 'loop' || !forward;
  const start = loop
    ? { x: source.bounds.left, y: source.y }
    : { x: source.bounds.right, y: source.y };
  const end = { x: target.bounds.left, y: target.y };

  const points = [start];
  if (loop) {
    const offsetFactor = Math.max(1, (source.column ?? 0) - (target.column ?? 0) + 1);
    const loopX =
      Math.min(start.x, end.x) -
      config.loopOffset * offsetFactor -
      Math.max(40, config.edgeGap * offsetFactor);
    const horizontalX = Math.max(loopX, minXBoundary);
    const verticalDir = target.y <= source.y ? -1 : 1;
    const laneDistance = Math.max(
      1,
      Math.abs((source.laneIndex ?? 0) - (target.laneIndex ?? 0)) || (sameLane ? 1 : 0)
    );
    const arcSpan = config.laneHeight * (laneDistance + 0.4);
    const innerTop = config.paddingY / 2;
    const innerBottom = diagramHeight - config.paddingY / 2;
    const arcY =
      verticalDir < 0
        ? Math.max(innerTop, Math.min(source.y, target.y) - arcSpan)
        : Math.min(innerBottom, Math.max(source.y, target.y) + arcSpan);
    points.push({ x: horizontalX, y: source.y });
    points.push({ x: horizontalX, y: arcY });
    points.push({ x: end.x - 24, y: arcY });
    points.push({ x: end.x - 24, y: target.y });
  } else {
    const deltaColumns = (target.column ?? 0) - (source.column ?? 0);
    const horizontalOffset = Math.max(config.edgeGap, deltaColumns * (config.columnGap / 2));
    const bendX = Math.min(start.x + horizontalOffset, end.x - config.edgeGap / 2);
    if (sameLane) {
      points.push({ x: bendX, y: start.y });
    } else {
      points.push({ x: bendX, y: start.y });
      points.push({ x: bendX, y: end.y });
    }
  }
  points.push(end);

  const path = roundedPath(points, 14);
  const labelAnchor = midPoint(points);
  const color =
    flow.behavior === 'loop'
      ? FLOW_COLORS.loop
      : flow.type === 'message'
        ? FLOW_COLORS.message
        : FLOW_COLORS.default;

  return {
    path,
    points,
    labelAnchor,
    color,
    dashed: flow.type === 'message',
    loop
  };
}

function roundedPath(points, radius = 12) {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const current = points[i];
    const prev = points[i - 1];
    const next = points[i + 1];
    if (!next) {
      d += ` L ${current.x} ${current.y}`;
      continue;
    }
    const v1 = { x: current.x - prev.x, y: current.y - prev.y };
    const v2 = { x: next.x - current.x, y: next.y - current.y };
    if ((v1.x === 0 && v2.x === 0) || (v1.y === 0 && v2.y === 0)) {
      d += ` L ${current.x} ${current.y}`;
      continue;
    }
    const len1 = Math.hypot(v1.x, v1.y);
    const len2 = Math.hypot(v2.x, v2.y);
    const corner = Math.min(radius, len1 / 2, len2 / 2);
    const before = {
      x: current.x - (v1.x / len1) * corner,
      y: current.y - (v1.y / len1) * corner
    };
    const after = {
      x: current.x + (v2.x / len2) * corner,
      y: current.y + (v2.y / len2) * corner
    };
    d += ` L ${before.x} ${before.y}`;
    d += ` Q ${current.x} ${current.y} ${after.x} ${after.y}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

function midPoint(points) {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];
  let total = 0;
  const segments = [];
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const length = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    total += length;
    segments.push({ prev, curr, length });
  }
  let target = total / 2;
  for (const segment of segments) {
    if (target <= segment.length) {
      const ratio = segment.length === 0 ? 0 : target / segment.length;
      return {
        x: segment.prev.x + (segment.curr.x - segment.prev.x) * ratio,
        y: segment.prev.y + (segment.curr.y - segment.prev.y) * ratio
      };
    }
    target -= segment.length;
  }
  return points[Math.floor(points.length / 2)];
}
