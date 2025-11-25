import './BPMNShapes.css'

/**
 * Start Event - Зелёный круг
 */
export function StartEvent({ x, y, size, label, selected, onClick }) {
  const radius = size / 2
  const cx = x + radius
  const cy = y + radius
  
  return (
    <g className={`bpmn-element bpmn-start-event ${selected ? 'selected' : ''}`} onClick={onClick}>
      <circle
        cx={cx}
        cy={cy}
        r={radius - 2}
        className="bpmn-shape"
      />
      <circle
        cx={cx}
        cy={cy}
        r={radius - 6}
        className="bpmn-shape-inner"
        fill="none"
      />
      {label && (
        <text
          x={cx}
          y={cy + radius + 16}
          className="bpmn-label"
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  )
}

/**
 * End Event - Красный круг с толстой границей
 */
export function EndEvent({ x, y, size, label, selected, onClick }) {
  const radius = size / 2
  const cx = x + radius
  const cy = y + radius
  
  return (
    <g className={`bpmn-element bpmn-end-event ${selected ? 'selected' : ''}`} onClick={onClick}>
      <circle
        cx={cx}
        cy={cy}
        r={radius - 2}
        className="bpmn-shape"
      />
      <circle
        cx={cx}
        cy={cy}
        r={radius - 8}
        className="bpmn-shape-inner"
      />
      {label && (
        <text
          x={cx}
          y={cy + radius + 16}
          className="bpmn-label"
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  )
}

/**
 * Intermediate Event - Жёлтый круг с двойной границей
 */
export function IntermediateEvent({ x, y, size, label, selected, onClick }) {
  const radius = size / 2
  const cx = x + radius
  const cy = y + radius
  
  return (
    <g className={`bpmn-element bpmn-intermediate-event ${selected ? 'selected' : ''}`} onClick={onClick}>
      <circle
        cx={cx}
        cy={cy}
        r={radius - 2}
        className="bpmn-shape"
      />
      <circle
        cx={cx}
        cy={cy}
        r={radius - 6}
        className="bpmn-shape-inner"
        fill="none"
      />
      {label && (
        <text
          x={cx}
          y={cy + radius + 16}
          className="bpmn-label"
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  )
}

/**
 * Task - Прямоугольник со скруглёнными углами
 */
export function Task({ x, y, width, height, label, selected, onClick }) {
  const rx = 8
  
  return (
    <g className={`bpmn-element bpmn-task ${selected ? 'selected' : ''}`} onClick={onClick}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={rx}
        className="bpmn-shape"
      />
      {label && (
        <foreignObject x={x + 8} y={y + 8} width={width - 16} height={height - 16}>
          <div className="bpmn-task-label">
            {label}
          </div>
        </foreignObject>
      )}
    </g>
  )
}

/**
 * Subprocess - Прямоугольник с иконкой разворачивания
 */
export function Subprocess({ x, y, width, height, label, selected, onClick }) {
  const rx = 8
  const iconSize = 12
  
  return (
    <g className={`bpmn-element bpmn-subprocess ${selected ? 'selected' : ''}`} onClick={onClick}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={rx}
        className="bpmn-shape"
      />
      {/* Иконка разворачивания */}
      <rect
        x={x + width / 2 - iconSize / 2}
        y={y + height - iconSize - 4}
        width={iconSize}
        height={iconSize}
        rx={2}
        className="bpmn-subprocess-icon"
      />
      <line
        x1={x + width / 2}
        y1={y + height - iconSize - 1}
        x2={x + width / 2}
        y2={y + height - 7}
        className="bpmn-subprocess-icon-line"
      />
      <line
        x1={x + width / 2 - 3}
        y1={y + height - iconSize / 2 - 4}
        x2={x + width / 2 + 3}
        y2={y + height - iconSize / 2 - 4}
        className="bpmn-subprocess-icon-line"
      />
      {label && (
        <foreignObject x={x + 8} y={y + 8} width={width - 16} height={height - 28}>
          <div className="bpmn-task-label">
            {label}
          </div>
        </foreignObject>
      )}
    </g>
  )
}

/**
 * XOR Gateway - Ромб с X
 */
export function XORGateway({ x, y, size, label, selected, onClick }) {
  const cx = x + size / 2
  const cy = y + size / 2
  const half = size / 2 - 2
  
  const points = [
    `${cx},${cy - half}`,
    `${cx + half},${cy}`,
    `${cx},${cy + half}`,
    `${cx - half},${cy}`
  ].join(' ')
  
  return (
    <g className={`bpmn-element bpmn-xor-gateway ${selected ? 'selected' : ''}`} onClick={onClick}>
      <polygon
        points={points}
        className="bpmn-shape"
      />
      {/* X внутри */}
      <line
        x1={cx - 8}
        y1={cy - 8}
        x2={cx + 8}
        y2={cy + 8}
        className="bpmn-gateway-symbol"
      />
      <line
        x1={cx + 8}
        y1={cy - 8}
        x2={cx - 8}
        y2={cy + 8}
        className="bpmn-gateway-symbol"
      />
      {label && (
        <text
          x={cx}
          y={cy - half - 8}
          className="bpmn-label bpmn-gateway-label"
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  )
}

/**
 * Parallel Gateway - Ромб с +
 */
export function ParallelGateway({ x, y, size, label, selected, onClick }) {
  const cx = x + size / 2
  const cy = y + size / 2
  const half = size / 2 - 2
  
  const points = [
    `${cx},${cy - half}`,
    `${cx + half},${cy}`,
    `${cx},${cy + half}`,
    `${cx - half},${cy}`
  ].join(' ')
  
  return (
    <g className={`bpmn-element bpmn-parallel-gateway ${selected ? 'selected' : ''}`} onClick={onClick}>
      <polygon
        points={points}
        className="bpmn-shape"
      />
      {/* + внутри */}
      <line
        x1={cx}
        y1={cy - 10}
        x2={cx}
        y2={cy + 10}
        className="bpmn-gateway-symbol"
      />
      <line
        x1={cx - 10}
        y1={cy}
        x2={cx + 10}
        y2={cy}
        className="bpmn-gateway-symbol"
      />
      {label && (
        <text
          x={cx}
          y={cy - half - 8}
          className="bpmn-label bpmn-gateway-label"
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  )
}

/**
 * Inclusive Gateway - Ромб с O
 */
export function InclusiveGateway({ x, y, size, label, selected, onClick }) {
  const cx = x + size / 2
  const cy = y + size / 2
  const half = size / 2 - 2
  
  const points = [
    `${cx},${cy - half}`,
    `${cx + half},${cy}`,
    `${cx},${cy + half}`,
    `${cx - half},${cy}`
  ].join(' ')
  
  return (
    <g className={`bpmn-element bpmn-inclusive-gateway ${selected ? 'selected' : ''}`} onClick={onClick}>
      <polygon
        points={points}
        className="bpmn-shape"
      />
      {/* O внутри */}
      <circle
        cx={cx}
        cy={cy}
        r={10}
        className="bpmn-gateway-symbol-circle"
      />
      {label && (
        <text
          x={cx}
          y={cy - half - 8}
          className="bpmn-label bpmn-gateway-label"
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  )
}

/**
 * Рендерер для любого типа элемента
 */
export function BPMNElement({ element, selected, onClick }) {
  const { position, type, label } = element
  
  if (!position) return null
  
  const props = {
    x: position.x,
    y: position.y,
    width: position.width,
    height: position.height,
    size: type.includes('Event') || type.includes('Gateway') ? position.width : undefined,
    label,
    selected,
    onClick
  }
  
  switch (type) {
    case 'startEvent':
      return <StartEvent {...props} />
    case 'endEvent':
      return <EndEvent {...props} />
    case 'intermediateEvent':
      return <IntermediateEvent {...props} />
    case 'task':
      return <Task {...props} />
    case 'subprocess':
      return <Subprocess {...props} />
    case 'xorGateway':
      return <XORGateway {...props} />
    case 'parallelGateway':
      return <ParallelGateway {...props} />
    case 'inclusiveGateway':
      return <InclusiveGateway {...props} />
    default:
      return <Task {...props} />
  }
}
