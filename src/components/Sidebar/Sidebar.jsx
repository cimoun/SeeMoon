import { useState } from 'react'
import './Sidebar.css'

// Иконки для типов элементов
const ElementIcons = {
  startEvent: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="6" fill="none" stroke="var(--bpmn-event-start)" strokeWidth="2"/>
    </svg>
  ),
  endEvent: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="6" fill="none" stroke="var(--bpmn-event-end)" strokeWidth="3"/>
      <circle cx="8" cy="8" r="3" fill="var(--bpmn-event-end)"/>
    </svg>
  ),
  intermediateEvent: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="6" fill="none" stroke="var(--bpmn-event-intermediate)" strokeWidth="2"/>
      <circle cx="8" cy="8" r="4" fill="none" stroke="var(--bpmn-event-intermediate)" strokeWidth="1"/>
    </svg>
  ),
  task: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <rect x="2" y="4" width="12" height="8" rx="2" fill="none" stroke="var(--bpmn-task)" strokeWidth="1.5"/>
    </svg>
  ),
  subprocess: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <rect x="2" y="4" width="12" height="8" rx="2" fill="none" stroke="var(--bpmn-subprocess)" strokeWidth="1.5"/>
      <rect x="6" y="9" width="4" height="2" rx="0.5" fill="none" stroke="var(--bpmn-subprocess)" strokeWidth="1"/>
    </svg>
  ),
  xorGateway: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <polygon points="8,2 14,8 8,14 2,8" fill="none" stroke="var(--bpmn-gateway)" strokeWidth="1.5"/>
      <line x1="5" y1="5" x2="11" y2="11" stroke="var(--bpmn-gateway)" strokeWidth="1.5"/>
      <line x1="11" y1="5" x2="5" y2="11" stroke="var(--bpmn-gateway)" strokeWidth="1.5"/>
    </svg>
  ),
  parallelGateway: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <polygon points="8,2 14,8 8,14 2,8" fill="none" stroke="var(--bpmn-gateway)" strokeWidth="1.5"/>
      <line x1="8" y1="4" x2="8" y2="12" stroke="var(--bpmn-gateway)" strokeWidth="1.5"/>
      <line x1="4" y1="8" x2="12" y2="8" stroke="var(--bpmn-gateway)" strokeWidth="1.5"/>
    </svg>
  ),
  inclusiveGateway: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <polygon points="8,2 14,8 8,14 2,8" fill="none" stroke="var(--bpmn-gateway)" strokeWidth="1.5"/>
      <circle cx="8" cy="8" r="3" fill="none" stroke="var(--bpmn-gateway)" strokeWidth="1.5"/>
    </svg>
  ),
}

const TypeLabels = {
  startEvent: 'Начало',
  endEvent: 'Конец',
  intermediateEvent: 'Промежуточное событие',
  task: 'Задача',
  subprocess: 'Подпроцесс',
  xorGateway: 'XOR-шлюз',
  parallelGateway: 'AND-шлюз',
  inclusiveGateway: 'OR-шлюз',
}

export default function Sidebar({ diagramData, onDataChange: _onDataChange, selectedElement, onElementSelect }) {
  const [expandedSections, setExpandedSections] = useState({
    lanes: true,
    elements: true,
    flows: false,
  })
  
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }
  
  const { lanes = [], elements = [], flows = [] } = diagramData
  
  // Группируем элементы по дорожкам
  const elementsByLane = lanes.reduce((acc, lane) => {
    acc[lane.id] = elements.filter(el => el.lane === lane.id)
    return acc
  }, {})
  
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Структура процесса</h2>
        <span className="element-count">{elements.length} элементов</span>
      </div>
      
      <div className="sidebar-content">
        {/* Дорожки */}
        <section className="sidebar-section">
          <button 
            className={`section-header ${expandedSections.lanes ? 'expanded' : ''}`}
            onClick={() => toggleSection('lanes')}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M4 4l4 2-4 2V4z"/>
            </svg>
            <span>Дорожки</span>
            <span className="count">{lanes.length}</span>
          </button>
          
          {expandedSections.lanes && (
            <div className="section-content">
              {lanes.map((lane) => (
                <div key={lane.id} className="lane-item">
                  <div 
                    className="lane-color" 
                    style={{ backgroundColor: lane.color }}
                  />
                  <span className="lane-name">{lane.name}</span>
                  <span className="lane-elements">
                    {elementsByLane[lane.id]?.length || 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* Элементы по дорожкам */}
        <section className="sidebar-section">
          <button 
            className={`section-header ${expandedSections.elements ? 'expanded' : ''}`}
            onClick={() => toggleSection('elements')}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M4 4l4 2-4 2V4z"/>
            </svg>
            <span>Элементы</span>
            <span className="count">{elements.length}</span>
          </button>
          
          {expandedSections.elements && (
            <div className="section-content">
              {lanes.map(lane => (
                <div key={lane.id} className="lane-group">
                  <div className="lane-group-header">
                    <div 
                      className="lane-color" 
                      style={{ backgroundColor: lane.color }}
                    />
                    <span>{lane.name}</span>
                  </div>
                  
                  <div className="elements-list">
                    {elementsByLane[lane.id]?.map(element => (
                      <button
                        key={element.id}
                        className={`element-item ${selectedElement === element.id ? 'selected' : ''}`}
                        onClick={() => onElementSelect(element.id)}
                      >
                        <span className="element-icon">
                          {ElementIcons[element.type] || ElementIcons.task}
                        </span>
                        <div className="element-info">
                          <span className="element-label">
                            {element.label || element.id}
                          </span>
                          <span className="element-type">
                            {TypeLabels[element.type] || element.type}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* Связи */}
        <section className="sidebar-section">
          <button 
            className={`section-header ${expandedSections.flows ? 'expanded' : ''}`}
            onClick={() => toggleSection('flows')}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M4 4l4 2-4 2V4z"/>
            </svg>
            <span>Связи</span>
            <span className="count">{flows.length}</span>
          </button>
          
          {expandedSections.flows && (
            <div className="section-content">
              <div className="flows-list">
                {flows.map((flow, index) => (
                  <div key={index} className="flow-item">
                    <span className="flow-from">{flow.from}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="flow-arrow">
                      <path d="M1 8a.5.5 0 01.5-.5h11.793l-3.147-3.146a.5.5 0 01.708-.708l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L13.293 8.5H1.5A.5.5 0 011 8z"/>
                    </svg>
                    <span className="flow-to">{flow.to}</span>
                    {flow.label && (
                      <span className="flow-label">{flow.label}</span>
                    )}
                    {flow.type === 'return' && (
                      <span className="flow-type return">↩</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
      
      {/* Подсказки по нотации */}
      <div className="sidebar-footer">
        <div className="notation-help">
          <h4>BPMN 2.0 Нотация</h4>
          <div className="notation-items">
            <div className="notation-item">
              {ElementIcons.startEvent}
              <span>Начало</span>
            </div>
            <div className="notation-item">
              {ElementIcons.endEvent}
              <span>Конец</span>
            </div>
            <div className="notation-item">
              {ElementIcons.task}
              <span>Задача</span>
            </div>
            <div className="notation-item">
              {ElementIcons.xorGateway}
              <span>XOR</span>
            </div>
            <div className="notation-item">
              {ElementIcons.parallelGateway}
              <span>AND</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
