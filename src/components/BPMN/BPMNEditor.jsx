import { useEffect, useRef, useState } from 'react';
import BpmnJS from 'bpmn-js/lib/NavigatedViewer';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import './BPMNEditor.css';

/**
 * Компонент для отображения и редактирования BPMN диаграмм
 */
function BPMNEditor({ bpmnXml, onDiagramChange }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Создаем экземпляр BPMN viewer
    const viewer = new BpmnJS({
      container: containerRef.current,
      width: '100%',
      height: '100%',
    });

    viewerRef.current = viewer;

    // Загружаем диаграмму
    if (bpmnXml) {
      viewer.importXML(bpmnXml).catch((err) => {
        console.error('Ошибка загрузки BPMN:', err);
        setError('Ошибка загрузки диаграммы');
      });
    }

    // Очистка при размонтировании
    return () => {
      viewer.destroy();
    };
  }, []);

  // Обновляем диаграмму при изменении XML
  useEffect(() => {
    if (viewerRef.current && bpmnXml) {
      setError(null);
      viewerRef.current.importXML(bpmnXml).catch((err) => {
        console.error('Ошибка обновления BPMN:', err);
        setError(`Ошибка загрузки диаграммы: ${err.message || 'Неизвестная ошибка'}`);
      });
    }
  }, [bpmnXml]);

  return (
    <div className="bpmn-editor">
      {error && <div className="bpmn-error">{error}</div>}
      <div ref={containerRef} className="bpmn-container" />
    </div>
  );
}

export default BPMNEditor;
