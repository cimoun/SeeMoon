import { useState, useRef, useEffect } from 'react';
import BPMNEditor from './BPMNEditor';
import ExportControls from './ExportControls';
import ProcessEditor from './ProcessEditor';
import { generateBPMNXML, exampleProcessData } from '../../utils/bpmnGenerator';
import './BPMNGenerator.css';

/**
 * Главный компонент генератора BPMN диаграмм
 */
function BPMNGenerator() {
  const [processData, setProcessData] = useState(exampleProcessData);
  const [bpmnXml, setBpmnXml] = useState('');
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  // Генерируем BPMN XML при изменении данных процесса
  useEffect(() => {
    try {
      const xml = generateBPMNXML(processData);
      setBpmnXml(xml);
      setError(null);
    } catch (err) {
      console.error('Ошибка генерации BPMN:', err);
      setError(err.message);
    }
  }, [processData]);

  const handleProcessChange = (newProcessData) => {
    setProcessData(newProcessData);
  };

  return (
    <div className="bpmn-generator">
      <header className="bpmn-header">
        <h1>Генератор BPMN 2.0 диаграмм</h1>
        <p>Создавайте профессиональные BPMN диаграммы с точным позиционированием</p>
      </header>

      {error && (
        <div className="error-message">
          Ошибка: {error}
        </div>
      )}

      <div className="bpmn-layout">
        <div className="bpmn-sidebar">
          <ProcessEditor
            processData={processData}
            onProcessChange={handleProcessChange}
          />
        </div>

        <div className="bpmn-main">
          <ExportControls
            containerRef={containerRef}
            bpmnXml={bpmnXml}
            filename="bpmn-diagram"
          />
          <div ref={containerRef} className="bpmn-viewer-wrapper">
            <BPMNEditor bpmnXml={bpmnXml} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BPMNGenerator;
