import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import { calculateLayout, LAYOUT } from '../../engine/layoutEngine'
import { BPMNElement, FlowConnection, FlowMarkers } from '../BPMNShapes'
import './DiagramCanvas.css'

// Цвета для дорожек
const LANE_COLORS = [
  'rgba(88, 166, 255, 0.06)',
  'rgba(126, 231, 135, 0.06)',
  'rgba(163, 113, 247, 0.06)',
  'rgba(210, 153, 34, 0.06)',
  'rgba(248, 81, 73, 0.06)',
]

const LANE_BORDER_COLORS = [
  'rgba(88, 166, 255, 0.3)',
  'rgba(126, 231, 135, 0.3)',
  'rgba(163, 113, 247, 0.3)',
  'rgba(210, 153, 34, 0.3)',
  'rgba(248, 81, 73, 0.3)',
]

/**
 * Swimlane - Горизонтальная дорожка
 */
function Swimlane({ lane, index, totalWidth }) {
  const { position, name, color } = lane
  
  if (!position) return null
  
  const bgColor = LANE_COLORS[index % LANE_COLORS.length]
  const borderColor = color || LANE_BORDER_COLORS[index % LANE_BORDER_COLORS.length]
  
  return (
    <g className="bpmn-swimlane">
      {/* Фон дорожки */}
      <rect
        x={LAYOUT.CANVAS_PADDING}
        y={position.y}
        width={totalWidth - LAYOUT.CANVAS_PADDING * 2}
        height={position.height}
        fill={bgColor}
        stroke={borderColor}
        strokeWidth="1"
        rx="4"
      />
      
      {/* Заголовок дорожки */}
      <rect
        x={LAYOUT.CANVAS_PADDING}
        y={position.y}
        width={LAYOUT.LANE_HEADER_WIDTH}
        height={position.height}
        fill="rgba(255, 255, 255, 0.03)"
        stroke={borderColor}
        strokeWidth="1"
        rx="4"
      />
      
      {/* Текст заголовка - вертикальный */}
      <text
        x={LAYOUT.CANVAS_PADDING + LAYOUT.LANE_HEADER_WIDTH / 2}
        y={position.y + position.height / 2}
        className="swimlane-label"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fill: color || borderColor }}
      >
        {name}
      </text>
    </g>
  )
}

/**
 * Основной компонент холста диаграммы
 */
export default function DiagramCanvas({ data, zoom, selectedElement, onElementSelect }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [startPan, setStartPan] = useState({ x: 0, y: 0 })
  
  // Вычисляем лейаут
  const layout = useMemo(() => {
    return calculateLayout(data)
  }, [data])
  
  // Обработка перетаскивания
  const handleMouseDown = useCallback((e) => {
    if (e.target === svgRef.current || e.target.classList.contains('canvas-background')) {
      setIsPanning(true)
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }, [pan])
  
  const handleMouseMove = useCallback((e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      })
    }
  }, [isPanning, startPan])
  
  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])
  
  // Обработка колёсика мыши
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      // Зум обрабатывается в родительском компоненте
    } else {
      // Панорамирование
      setPan(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }))
    }
  }, [])
  
  // Клик по пустому месту - сброс выделения
  const handleBackgroundClick = useCallback((e) => {
    if (e.target === svgRef.current || e.target.classList.contains('canvas-background')) {
      onElementSelect(null)
    }
  }, [onElementSelect])
  
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [handleWheel])
  
  const { dimensions, lanes, elements, flows } = layout
  
  // Размеры SVG с учётом зума
  const svgWidth = Math.max(dimensions.width, 800)
  const svgHeight = Math.max(dimensions.height, 600)
  
  return (
    <div 
      ref={containerRef}
      className={`diagram-canvas ${isPanning ? 'panning' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        ref={svgRef}
        width={svgWidth * zoom}
        height={svgHeight * zoom}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px)`,
        }}
        onClick={handleBackgroundClick}
      >
        <FlowMarkers />
        
        {/* Фон */}
        <rect
          className="canvas-background"
          x="0"
          y="0"
          width={svgWidth}
          height={svgHeight}
          fill="transparent"
        />
        
        {/* Сетка */}
        <defs>
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="0.5" fill="var(--border-muted)" />
          </pattern>
        </defs>
        <rect
          x="0"
          y="0"
          width={svgWidth}
          height={svgHeight}
          fill="url(#grid)"
          opacity="0.5"
        />
        
        {/* Дорожки */}
        <g className="swimlanes-layer">
          {lanes.map((lane, index) => (
            <Swimlane
              key={lane.id}
              lane={lane}
              index={index}
              totalWidth={svgWidth}
            />
          ))}
        </g>
        
        {/* Связи */}
        <g className="flows-layer">
          {flows.map((flow, index) => (
            <FlowConnection
              key={`${flow.from}-${flow.to}-${index}`}
              flow={flow}
            />
          ))}
        </g>
        
        {/* Элементы */}
        <g className="elements-layer">
          {elements.map(element => (
            <BPMNElement
              key={element.id}
              element={element}
              selected={selectedElement === element.id}
              onClick={() => onElementSelect(element.id)}
            />
          ))}
        </g>
      </svg>
      
      {/* Информация о диаграмме */}
      <div className="diagram-info">
        <span className="diagram-name">{data.name}</span>
        <span className="diagram-stats">
          {elements.length} элементов · {flows.length} связей · {lanes.length} дорожек
        </span>
      </div>
      
      {/* Подсказка по управлению */}
      <div className="canvas-hint">
        Перетаскивайте для навигации · Колёсико мыши для прокрутки
      </div>
    </div>
  )
}
