import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './ExportControls.css';

/**
 * Компонент для экспорта BPMN диаграммы в различные форматы
 */
function ExportControls({ containerRef, bpmnXml, filename = 'bpmn-diagram' }) {

  /**
   * Экспорт в PNG
   */
  const exportToPNG = async () => {
    if (!containerRef.current) {
      alert('Контейнер диаграммы не найден');
      return;
    }

    try {
      // Находим SVG элемент внутри bpmn-js
      const svgElement = containerRef.current.querySelector('svg');
      if (!svgElement) {
        alert('Диаграмма не найдена. Убедитесь, что диаграмма загружена.');
        return;
      }

      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Ошибка экспорта в PNG:', error);
      alert(`Ошибка экспорта в PNG: ${error.message}`);
    }
  };

  /**
   * Экспорт в SVG (через скачивание XML)
   */
  const exportToSVG = () => {
    if (!bpmnXml) return;

    const blob = new Blob([bpmnXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${filename}.bpmn`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Экспорт в PDF
   */
  const exportToPDF = async () => {
    if (!containerRef.current) {
      alert('Контейнер диаграммы не найден');
      return;
    }

    try {
      const svgElement = containerRef.current.querySelector('svg');
      if (!svgElement) {
        alert('Диаграмма не найдена. Убедитесь, что диаграмма загружена.');
        return;
      }

      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 297; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Ошибка экспорта в PDF:', error);
      alert(`Ошибка экспорта в PDF: ${error.message}`);
    }
  };

  /**
   * Скачать BPMN XML
   */
  const downloadBPMN = () => {
    if (!bpmnXml) return;

    const blob = new Blob([bpmnXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${filename}.bpmn`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="export-controls">
      <h3>Экспорт диаграммы</h3>
      <div className="export-buttons">
        <button onClick={exportToPNG} className="export-btn">
          📷 PNG
        </button>
        <button onClick={exportToSVG} className="export-btn">
          🎨 SVG/BPMN
        </button>
        <button onClick={exportToPDF} className="export-btn">
          📄 PDF
        </button>
        <button onClick={downloadBPMN} className="export-btn">
          💾 BPMN XML
        </button>
      </div>
    </div>
  );
}

export default ExportControls;
