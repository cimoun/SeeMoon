import './FlowConnection.css'

/**
 * Создание SVG path из точек
 */
function createPathFromPoints(points, smooth = false) {
  if (!points || points.length < 2) return ''
  
  if (smooth && points.length > 2) {
    // Создаём сглаженный путь с кривыми Безье
    let path = `M ${points[0].x} ${points[0].y}`
    
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const next = points[i + 1]
      
      // Радиус скругления
      const radius = 10
      
      // Направления
      const dx1 = curr.x - prev.x
      const dy1 = curr.y - prev.y
      const dx2 = next.x - curr.x
      const dy2 = next.y - curr.y
      
      // Нормализуем
      const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1)
      const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
      
      if (len1 === 0 || len2 === 0) {
        path += ` L ${curr.x} ${curr.y}`
        continue
      }
      
      const nx1 = dx1 / len1
      const ny1 = dy1 / len1
      const nx2 = dx2 / len2
      const ny2 = dy2 / len2
      
      // Точки до и после угла
      const r = Math.min(radius, len1 / 2, len2 / 2)
      const x1 = curr.x - nx1 * r
      const y1 = curr.y - ny1 * r
      const x2 = curr.x + nx2 * r
      const y2 = curr.y + ny2 * r
      
      path += ` L ${x1} ${y1}`
      path += ` Q ${curr.x} ${curr.y} ${x2} ${y2}`
    }
    
    const last = points[points.length - 1]
    path += ` L ${last.x} ${last.y}`
    
    return path
  }
  
  // Простой путь из линий
  return points.map((p, i) => 
    i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
  ).join(' ')
}

/**
 * Расчёт позиции для метки
 */
function getLabelPosition(points, isReturn) {
  if (!points || points.length < 2) return null
  
  if (isReturn && points.length >= 3) {
    // Для возвратных стрелок - на горизонтальном участке
    const p1 = points[1]
    const p2 = points[2]
    return {
      x: (p1.x + p2.x) / 2,
      y: p1.y - 10
    }
  }
  
  // Для обычных стрелок - около начала
  const p1 = points[0]
  const p2 = points[1]
  
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const len = Math.sqrt(dx * dx + dy * dy)
  
  if (len === 0) return { x: p1.x, y: p1.y - 10 }
  
  // Смещаемся на 30% по первому сегменту
  const t = Math.min(30 / len, 0.5)
  
  return {
    x: p1.x + dx * t + (dy === 0 ? 0 : 5),
    y: p1.y + dy * t - 10
  }
}

/**
 * Компонент соединительной линии
 */
export function FlowConnection({ flow, selected }) {
  const { path, label, type } = flow
  
  if (!path || !path.points || path.points.length < 2) {
    return null
  }
  
  const isReturn = path.type === 'return' || type === 'return'
  const pathD = createPathFromPoints(path.points, true)
  const labelPos = getLabelPosition(path.points, isReturn)
  
  return (
    <g className={`bpmn-flow ${isReturn ? 'return-flow' : ''} ${selected ? 'selected' : ''}`}>
      {/* Линия */}
      <path
        d={pathD}
        className="flow-line"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
      
      {/* Метка */}
      {label && labelPos && (
        <g className="flow-label-group">
          <rect
            x={labelPos.x - label.length * 4 - 6}
            y={labelPos.y - 8}
            width={label.length * 8 + 12}
            height={16}
            rx={4}
            className="flow-label-bg"
          />
          <text
            x={labelPos.x}
            y={labelPos.y + 4}
            className="flow-label"
            textAnchor="middle"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  )
}

/**
 * Определения маркеров для стрелок
 */
export function FlowMarkers() {
  return (
    <defs>
      {/* Стандартная стрелка */}
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <polygon
          points="0 0, 10 3.5, 0 7"
          fill="var(--text-secondary)"
        />
      </marker>
      
      {/* Стрелка для возвратных связей */}
      <marker
        id="arrowhead-return"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <polygon
          points="0 0, 10 3.5, 0 7"
          fill="var(--accent-warning)"
        />
      </marker>
    </defs>
  )
}
