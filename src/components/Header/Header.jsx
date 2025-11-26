import './Header.css'

export default function Header({ onExport, onLoadSample, zoom, onZoomChange }) {
  const zoomPercent = Math.round(zoom * 100)
  
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <svg width="28" height="28" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#667eea' }} />
                <stop offset="100%" style={{ stopColor: '#764ba2' }} />
              </linearGradient>
            </defs>
            <rect x="5" y="5" width="90" height="90" rx="15" fill="url(#logoGrad)"/>
            <circle cx="25" cy="50" r="8" fill="none" stroke="white" strokeWidth="2"/>
            <rect x="42" y="40" width="20" height="20" rx="3" fill="none" stroke="white" strokeWidth="2"/>
            <polygon points="80,50 72,42 72,58" fill="none" stroke="white" strokeWidth="2"/>
            <line x1="33" y1="50" x2="42" y2="50" stroke="white" strokeWidth="2"/>
            <line x1="62" y1="50" x2="72" y2="50" stroke="white" strokeWidth="2"/>
          </svg>
          <span className="logo-text">BPMN Generator</span>
        </div>
      </div>
      
      <div className="header-center">
        <div className="sample-selector">
          <label>Пример:</label>
          <select onChange={(e) => onLoadSample(e.target.value)} defaultValue="contractApproval">
            <option value="contractApproval">Согласование договора</option>
            <option value="orderProcessing">Обработка заказа</option>
            <option value="simpleProcess">Простой процесс</option>
          </select>
        </div>
      </div>
      
      <div className="header-right">
        <div className="zoom-controls">
          <button 
            className="zoom-btn"
            onClick={() => onZoomChange(zoom - 0.1)}
            disabled={zoom <= 0.25}
            title="Уменьшить"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 8a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7A.5.5 0 014 8z"/>
            </svg>
          </button>
          <span className="zoom-value">{zoomPercent}%</span>
          <button 
            className="zoom-btn"
            onClick={() => onZoomChange(zoom + 0.1)}
            disabled={zoom >= 2}
            title="Увеличить"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 4a.5.5 0 01.5.5v3h3a.5.5 0 010 1h-3v3a.5.5 0 01-1 0v-3h-3a.5.5 0 010-1h3v-3A.5.5 0 018 4z"/>
            </svg>
          </button>
          <button 
            className="zoom-btn"
            onClick={() => onZoomChange(1)}
            title="Сбросить масштаб"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 3a5 5 0 104.546 2.914.5.5 0 11.908-.418A6 6 0 118 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 01.41-.192l2.36 1.966a.25.25 0 010 .384L8.41 4.658A.25.25 0 018 4.466z"/>
            </svg>
          </button>
        </div>
        
        <button className="export-btn" onClick={onExport}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M.5 9.9a.5.5 0 01.5.5v2.5a1 1 0 001 1h12a1 1 0 001-1v-2.5a.5.5 0 011 0v2.5a2 2 0 01-2 2H2a2 2 0 01-2-2v-2.5a.5.5 0 01.5-.5z"/>
            <path d="M7.646 11.854a.5.5 0 00.708 0l3-3a.5.5 0 00-.708-.708L8.5 10.293V1.5a.5.5 0 00-1 0v8.793L5.354 8.146a.5.5 0 10-.708.708l3 3z"/>
          </svg>
          Экспорт
        </button>
      </div>
    </header>
  )
}
