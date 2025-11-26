import { useState, useCallback } from 'react'
import { toPng, toSvg } from 'html-to-image'
import { jsPDF } from 'jspdf'
import { calculateLayout } from '../../engine/layoutEngine'
import './ExportPanel.css'

const QUALITY_SCALE = {
  low: 1,
  medium: 2,
  high: 3,
}

export default function ExportPanel({ data, onClose }) {
  const [format, setFormat] = useState('png')
  const [quality, setQuality] = useState('high')
  const [includeBackground, setIncludeBackground] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  
  const layout = calculateLayout(data)
  
  const exportDiagram = useCallback(async () => {
    setIsExporting(true)
    
    try {
      // Создаём временный SVG для экспорта
      const svgElement = document.querySelector('.diagram-canvas svg')
      if (!svgElement) {
        throw new Error('Диаграмма не найдена')
      }
      
      const scale = QUALITY_SCALE[quality]
      const filename = `${data.name || 'bpmn-diagram'}-${Date.now()}`
      
      if (format === 'svg') {
        // SVG экспорт
        const svgData = await toSvg(svgElement, {
          backgroundColor: includeBackground ? '#0d1117' : 'transparent',
        })
        
        const link = document.createElement('a')
        link.download = `${filename}.svg`
        link.href = svgData
        link.click()
      } else if (format === 'png') {
        // PNG экспорт
        const pngData = await toPng(svgElement, {
          backgroundColor: includeBackground ? '#0d1117' : 'transparent',
          pixelRatio: scale,
        })
        
        const link = document.createElement('a')
        link.download = `${filename}.png`
        link.href = pngData
        link.click()
      } else if (format === 'pdf') {
        // PDF экспорт
        const pngData = await toPng(svgElement, {
          backgroundColor: includeBackground ? '#0d1117' : '#ffffff',
          pixelRatio: scale,
        })
        
        const img = new Image()
        img.src = pngData
        
        await new Promise((resolve) => {
          img.onload = resolve
        })
        
        const { width, height } = layout.dimensions
        const orientation = width > height ? 'landscape' : 'portrait'
        
        const pdf = new jsPDF({
          orientation,
          unit: 'px',
          format: [width * scale, height * scale],
        })
        
        pdf.addImage(pngData, 'PNG', 0, 0, width * scale, height * scale)
        pdf.save(`${filename}.pdf`)
      } else if (format === 'json') {
        // JSON экспорт
        const jsonData = JSON.stringify(data, null, 2)
        const blob = new Blob([jsonData], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.download = `${filename}.json`
        link.href = url
        link.click()
        
        URL.revokeObjectURL(url)
      }
      
      onClose()
    } catch (error) {
      console.error('Export error:', error)
      alert('Ошибка при экспорте: ' + error.message)
    } finally {
      setIsExporting(false)
    }
  }, [format, quality, includeBackground, data, layout, onClose])
  
  return (
    <div className="export-panel-overlay" onClick={onClose}>
      <div className="export-panel" onClick={(e) => e.stopPropagation()}>
        <div className="export-header">
          <h2>Экспорт диаграммы</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z"/>
            </svg>
          </button>
        </div>
        
        <div className="export-content">
          {/* Формат */}
          <div className="export-section">
            <label className="section-label">Формат</label>
            <div className="format-options">
              {[
                { id: 'png', label: 'PNG', icon: '🖼️', desc: 'Растровое изображение' },
                { id: 'svg', label: 'SVG', icon: '📐', desc: 'Векторный формат' },
                { id: 'pdf', label: 'PDF', icon: '📄', desc: 'Документ' },
                { id: 'json', label: 'JSON', icon: '{ }', desc: 'Данные диаграммы' },
              ].map(opt => (
                <button
                  key={opt.id}
                  className={`format-btn ${format === opt.id ? 'active' : ''}`}
                  onClick={() => setFormat(opt.id)}
                >
                  <span className="format-icon">{opt.icon}</span>
                  <span className="format-label">{opt.label}</span>
                  <span className="format-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Качество (только для растровых форматов) */}
          {(format === 'png' || format === 'pdf') && (
            <div className="export-section">
              <label className="section-label">Качество</label>
              <div className="quality-options">
                {[
                  { id: 'low', label: 'Низкое', scale: '1x' },
                  { id: 'medium', label: 'Среднее', scale: '2x' },
                  { id: 'high', label: 'Высокое', scale: '3x' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    className={`quality-btn ${quality === opt.id ? 'active' : ''}`}
                    onClick={() => setQuality(opt.id)}
                  >
                    <span className="quality-label">{opt.label}</span>
                    <span className="quality-scale">{opt.scale}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Опции */}
          {format !== 'json' && (
            <div className="export-section">
              <label className="section-label">Опции</label>
              <div className="options-list">
                <label className="option-checkbox">
                  <input
                    type="checkbox"
                    checked={includeBackground}
                    onChange={(e) => setIncludeBackground(e.target.checked)}
                  />
                  <span className="checkbox-mark"></span>
                  <span className="option-text">Включить фон</span>
                </label>
              </div>
            </div>
          )}
          
          {/* Превью информация */}
          <div className="export-section">
            <label className="section-label">Информация</label>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Название</span>
                <span className="info-value">{data.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Размер</span>
                <span className="info-value">
                  {Math.round(layout.dimensions.width)} × {Math.round(layout.dimensions.height)} px
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Элементов</span>
                <span className="info-value">{layout.elements.length}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Дорожек</span>
                <span className="info-value">{layout.lanes.length}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="export-footer">
          <button className="cancel-btn" onClick={onClose}>
            Отмена
          </button>
          <button 
            className="export-btn"
            onClick={exportDiagram}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <span className="spinner"></span>
                Экспорт...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M.5 9.9a.5.5 0 01.5.5v2.5a1 1 0 001 1h12a1 1 0 001-1v-2.5a.5.5 0 011 0v2.5a2 2 0 01-2 2H2a2 2 0 01-2-2v-2.5a.5.5 0 01.5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 00.708 0l3-3a.5.5 0 00-.708-.708L8.5 10.293V1.5a.5.5 0 00-1 0v8.793L5.354 8.146a.5.5 0 10-.708.708l3 3z"/>
                </svg>
                Экспортировать {format.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
