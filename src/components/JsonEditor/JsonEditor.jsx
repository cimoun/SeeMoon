import { useState, useCallback, useEffect } from 'react'
import './JsonEditor.css'

export default function JsonEditor({ data, onChange }) {
  const [jsonText, setJsonText] = useState('')
  const [error, setError] = useState(null)
  const [isValid, setIsValid] = useState(true)
  
  // Синхронизация с входными данными
  useEffect(() => {
    setJsonText(JSON.stringify(data, null, 2))
    setError(null)
    setIsValid(true)
  }, [data])
  
  const handleTextChange = useCallback((e) => {
    const newText = e.target.value
    setJsonText(newText)
    
    try {
      const parsed = JSON.parse(newText)
      
      // Валидация структуры
      if (!parsed.lanes || !Array.isArray(parsed.lanes)) {
        throw new Error('Отсутствует или некорректен массив "lanes"')
      }
      if (!parsed.elements || !Array.isArray(parsed.elements)) {
        throw new Error('Отсутствует или некорректен массив "elements"')
      }
      if (!parsed.flows || !Array.isArray(parsed.flows)) {
        throw new Error('Отсутствует или некорректен массив "flows"')
      }
      
      setError(null)
      setIsValid(true)
    } catch (err) {
      setError(err.message)
      setIsValid(false)
    }
  }, [])
  
  const handleApply = useCallback(() => {
    if (!isValid) return
    
    try {
      const parsed = JSON.parse(jsonText)
      onChange(parsed)
    } catch (err) {
      setError(err.message)
    }
  }, [jsonText, isValid, onChange])
  
  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText)
      setJsonText(JSON.stringify(parsed, null, 2))
      setError(null)
      setIsValid(true)
    } catch (err) {
      setError(err.message)
    }
  }, [jsonText])
  
  const handleReset = useCallback(() => {
    setJsonText(JSON.stringify(data, null, 2))
    setError(null)
    setIsValid(true)
  }, [data])
  
  return (
    <div className="json-editor">
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <span className={`status-indicator ${isValid ? 'valid' : 'invalid'}`}>
            {isValid ? (
              <>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z"/>
                </svg>
                JSON валиден
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z"/>
                </svg>
                Ошибка
              </>
            )}
          </span>
        </div>
        
        <div className="toolbar-right">
          <button className="toolbar-btn" onClick={handleFormat} title="Форматировать">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2.5 2a.5.5 0 010 1h11a.5.5 0 010-1h-11zm0 4a.5.5 0 010 1h6a.5.5 0 010-1h-6zm0 4a.5.5 0 010 1h11a.5.5 0 010-1h-11zm0 4a.5.5 0 010 1h6a.5.5 0 010-1h-6z"/>
            </svg>
            Формат
          </button>
          
          <button className="toolbar-btn" onClick={handleReset} title="Сбросить изменения">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 3a5 5 0 104.546 2.914.5.5 0 11.908-.418A6 6 0 118 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 01.41-.192l2.36 1.966a.25.25 0 010 .384L8.41 4.658A.25.25 0 018 4.466z"/>
            </svg>
            Сброс
          </button>
          
          <button 
            className="toolbar-btn primary" 
            onClick={handleApply}
            disabled={!isValid}
            title="Применить изменения"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M10.97 4.97a.75.75 0 011.07 1.05l-3.99 4.99a.75.75 0 01-1.08.02L4.324 8.384a.75.75 0 111.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 01.02-.022z"/>
            </svg>
            Применить
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8.982 1.566a1.13 1.13 0 00-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 01-1.1 0L7.1 5.995A.905.905 0 018 5zm.002 6a1 1 0 110 2 1 1 0 010-2z"/>
          </svg>
          {error}
        </div>
      )}
      
      <div className="editor-container">
        <div className="line-numbers">
          {jsonText.split('\n').map((_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
        <textarea
          className="json-textarea"
          value={jsonText}
          onChange={handleTextChange}
          spellCheck="false"
          placeholder="Введите JSON структуру диаграммы..."
        />
      </div>
      
      <div className="editor-help">
        <h4>Структура JSON</h4>
        <pre>{`{
  "name": "Название процесса",
  "lanes": [
    { "id": "lane-1", "name": "Роль", "color": "#58a6ff" }
  ],
  "elements": [
    { "id": "el-1", "type": "task", "label": "Задача", "lane": "lane-1" }
  ],
  "flows": [
    { "from": "el-1", "to": "el-2", "label": "Условие" }
  ]
}`}</pre>
        <div className="type-hint">
          <strong>Типы элементов:</strong> startEvent, endEvent, task, subprocess, xorGateway, parallelGateway
        </div>
      </div>
    </div>
  )
}
