import { useState, useCallback } from 'react'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import DiagramCanvas from './components/DiagramCanvas/DiagramCanvas'
import JsonEditor from './components/JsonEditor/JsonEditor'
import ExportPanel from './components/ExportPanel/ExportPanel'
import { sampleDiagrams } from './data/sampleDiagrams'
import './App.css'

function App() {
  const [diagramData, setDiagramData] = useState(sampleDiagrams.contractApproval)
  const [activeTab, setActiveTab] = useState('visual') // 'visual' | 'json'
  const [showExport, setShowExport] = useState(false)
  const [selectedElement, setSelectedElement] = useState(null)
  const [zoom, setZoom] = useState(1)

  const handleDataChange = useCallback((newData) => {
    setDiagramData(newData)
    setSelectedElement(null)
  }, [])

  const handleLoadSample = useCallback((sampleKey) => {
    setDiagramData(sampleDiagrams[sampleKey])
    setSelectedElement(null)
  }, [])

  const handleElementSelect = useCallback((elementId) => {
    setSelectedElement(elementId)
  }, [])

  const handleZoomChange = useCallback((newZoom) => {
    setZoom(Math.max(0.25, Math.min(2, newZoom)))
  }, [])

  return (
    <div className="app">
      <Header 
        onExport={() => setShowExport(true)}
        onLoadSample={handleLoadSample}
        zoom={zoom}
        onZoomChange={handleZoomChange}
      />
      
      <div className="app-content">
        <Sidebar 
          diagramData={diagramData}
          onDataChange={handleDataChange}
          selectedElement={selectedElement}
          onElementSelect={handleElementSelect}
        />
        
        <main className="main-area">
          <div className="tab-bar">
            <button 
              className={`tab ${activeTab === 'visual' ? 'active' : ''}`}
              onClick={() => setActiveTab('visual')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1 3a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V3zm2-.5a.5.5 0 00-.5.5v10a.5.5 0 00.5.5h10a.5.5 0 00.5-.5V3a.5.5 0 00-.5-.5H3z"/>
                <circle cx="5" cy="8" r="1.5"/>
                <rect x="8" y="6" width="4" height="4" rx="0.5"/>
              </svg>
              Диаграмма
            </button>
            <button 
              className={`tab ${activeTab === 'json' ? 'active' : ''}`}
              onClick={() => setActiveTab('json')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.854 4.854a.5.5 0 10-.708-.708l-3.5 3.5a.5.5 0 000 .708l3.5 3.5a.5.5 0 00.708-.708L2.707 8l3.147-3.146zm4.292 0a.5.5 0 01.708-.708l3.5 3.5a.5.5 0 010 .708l-3.5 3.5a.5.5 0 01-.708-.708L13.293 8l-3.147-3.146z"/>
              </svg>
              JSON
            </button>
          </div>
          
          <div className="canvas-area">
            {activeTab === 'visual' ? (
              <DiagramCanvas 
                data={diagramData}
                zoom={zoom}
                selectedElement={selectedElement}
                onElementSelect={handleElementSelect}
              />
            ) : (
              <JsonEditor 
                data={diagramData}
                onChange={handleDataChange}
              />
            )}
          </div>
        </main>
      </div>
      
      {showExport && (
        <ExportPanel 
          data={diagramData}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}

export default App
